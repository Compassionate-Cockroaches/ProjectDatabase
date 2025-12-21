from datetime import date
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.api.deps import get_current_active_user, require_admin
from app.core.database import get_session
from app.models.match import Match
from app.models.match_player_stats import MatchPlayerStats
from app.models.player import Player
from app.models.team import Team
from app.models.user import User
from app.schemas.match import MatchCreate, MatchResponse, MatchUpdate
from app.schemas.match_player_stats import (
    MatchPlayerStatsCreate,
    MatchPlayerStatsResponse,
)

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.get("/", response_model=List[MatchResponse])
async def list_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tournament_id: str = Query(None, description="Filter by tournament"),
    date_from: date = Query(None, description="Filter by start date"),
    date_to: date = Query(None, description="Filter by end date"),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get all matches (Public access)"""
    statement = select(Match).offset(skip).limit(limit)

    # Add filters
    if tournament_id:
        statement = statement.where(Match.tournament_id == tournament_id)
    if date_from:
        statement = statement.where(Match.match_date >= date_from)
    if date_to:
        statement = statement.where(Match.match_date <= date_to)

    # Order by date descending
    statement = statement.order_by(Match.match_date.desc())

    matches = session.exec(statement).all()
    
    # Enrich matches with team information
    enriched_matches = []
    for match in matches:
        # Get unique teams for this match from match_player_stats
        team_statement = (
            select(Team.team_name)
            .join(MatchPlayerStats, MatchPlayerStats.team_id == Team.id)
            .where(MatchPlayerStats.match_id == match.id)
            .distinct()
        )
        team_names = session.exec(team_statement).all()
        
        match_dict = match.model_dump()
        match_dict["team_names"] = list(team_names)
        enriched_matches.append(MatchResponse(**match_dict))
    
    return enriched_matches


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: str, session: Annotated[Session, Depends(get_session)]):
    """Get match details (Public access)"""
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(
    match_data: MatchCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Create new match (Admin only)"""
    # Create match
    db_match = Match(
        tournament_id=match_data.tournament_id,
        game_number=match_data.game_number,
        game_length=match_data.game_length,
        patch=match_data.patch,
        match_date=match_data.match_date,
        data_completeness=match_data.data_completeness,
        url=match_data.url,
        external_id="UNOFFICIAL",
    )

    session.add(db_match)
    session.commit()
    session.refresh(db_match)
    return db_match


@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: str,
    match_data: MatchUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Update match (Admin only)"""
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Update fields
    update_data = match_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(match, key, value)

    session.add(match)
    session.commit()
    session.refresh(match)
    return match


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match(
    match_id: str,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Delete match (Admin only)"""
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    session.delete(match)
    session.commit()
    return None


# Match Player Stats endpoints
@router.get("/{match_id}/player-stats", response_model=List[MatchPlayerStatsResponse])
async def get_match_player_stats(
    match_id: str, session: Annotated[Session, Depends(get_session)]
):
    """Get all player stats for a match (Public access)"""
    # Verify match exists
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Get player stats with joins
    statement = (
        select(MatchPlayerStats, Player.player_name, Team.team_name)
        .join(Player, MatchPlayerStats.player_id == Player.id)
        .join(Team, MatchPlayerStats.team_id == Team.id)
        .where(MatchPlayerStats.match_id == match_id)
    )

    results = session.exec(statement).all()

    # Convert to response format
    stats_list = []
    for stats, player_name, team_name in results:
        stats_dict = stats.model_dump()
        stats_dict["player_name"] = player_name
        stats_dict["team_name"] = team_name
        stats_list.append(MatchPlayerStatsResponse(**stats_dict))

    return stats_list


@router.post(
    "/{match_id}/player-stats",
    response_model=MatchPlayerStatsResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_match_player_stats(
    match_id: str,
    stats_data: MatchPlayerStatsCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Add player stats for a match (Admin only)"""
    # Verify match exists
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Verify player exists
    player = session.get(Player, stats_data.player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Verify team exists
    team = session.get(Team, stats_data.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if stats already exist for this player in this match
    existing_stats = session.exec(
        select(MatchPlayerStats).where(
            MatchPlayerStats.match_id == match_id,
            MatchPlayerStats.player_id == stats_data.player_id,
        )
    ).first()

    if existing_stats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stats already exist for this player in this match",
        )

    # Create stats
    db_stats = MatchPlayerStats(**stats_data.model_dump())
    session.add(db_stats)
    session.commit()
    session.refresh(db_stats)

    # Add player and team names to response
    response = MatchPlayerStatsResponse(
        **db_stats.model_dump(),
        player_name=player.player_name,
        team_name=team.team_name,
    )
    return response
