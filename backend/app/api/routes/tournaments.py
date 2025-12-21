from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.api.deps import get_current_active_user, require_admin
from app.core.database import get_session
from app.models.match import Match
from app.models.match_player_stats import MatchPlayerStats
from app.models.player import Player
from app.models.team import Team
from app.models.team_tournament import TeamTournament
from app.models.tournament import Tournament
from app.models.user import User
from app.schemas.tournament import (
    TournamentCreate,
    TournamentResponse,
    TournamentUpdate,
    TournamentWithStats,
)

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])


@router.get("/", response_model=List[TournamentResponse])
async def list_tournaments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    year: int = Query(None, description="Filter by year"),
    league: str = Query(None, description="Filter by league (LCK, LPL, LEC, etc.)"),
    playoffs: bool = Query(None, description="Filter by playoffs"),
    sort_by: str = Query("year", description="Sort by field (year, league, split)"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)"),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get all tournaments (Public access)"""
    statement = select(Tournament)

    # Add filters
    if year:
        statement = statement.where(Tournament.year == year)
    if league:
        statement = statement.where(Tournament.league == league)
    if playoffs is not None:
        statement = statement.where(Tournament.playoffs == playoffs)

    # Add sorting
    sort_column = getattr(Tournament, sort_by, Tournament.year)
    if sort_order.lower() == "desc":
        statement = statement.order_by(sort_column.desc())
    else:
        statement = statement.order_by(sort_column.asc())

    # Add pagination
    statement = statement.offset(skip).limit(limit)

    tournaments = session.exec(statement).all()
    return tournaments


@router.get("/{tournament_id}", response_model=TournamentWithStats)
async def get_tournament(
    tournament_id: str, session: Annotated[Session, Depends(get_session)]
):
    """Get tournament details with stats (Public access)"""
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Count participating teams
    team_count_query = select(func.count(TeamTournament.team_id)).where(
        TeamTournament.tournament_id == tournament_id
    )
    total_teams = session.exec(team_count_query).first() or 0

    # Count matches
    match_count_query = select(func.count(Match.id)).where(
        Match.tournament_id == tournament_id
    )
    total_matches = session.exec(match_count_query).first() or 0

    return TournamentWithStats(
        id=tournament.id,
        league=tournament.league,
        year=tournament.year,
        split=tournament.split,
        playoffs=tournament.playoffs,
        total_teams=total_teams,
        total_matches=total_matches,
    )


@router.post(
    "/", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED
)
async def create_tournament(
    tournament_data: TournamentCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Create new tournament (Admin only)"""
    # Create tournament
    db_tournament = Tournament(**tournament_data.model_dump())
    session.add(db_tournament)
    session.commit()
    session.refresh(db_tournament)
    return db_tournament


@router.put("/{tournament_id}", response_model=TournamentResponse)
async def update_tournament(
    tournament_id: str,
    tournament_data: TournamentUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Update tournament (Admin only)"""
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Update fields
    update_data = tournament_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tournament, key, value)

    session.add(tournament)
    session.commit()
    session.refresh(tournament)
    return tournament


@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tournament(
    tournament_id: str,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Delete tournament (Admin only)"""
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    session.delete(tournament)
    session.commit()
    return None


@router.get("/{tournament_id}/teams")
async def get_tournament_teams(
    tournament_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get all teams participating in tournament with standings"""
    from sqlmodel import Integer, case, cast, distinct
    
    # Create a subquery to get unique matches with their results per team
    # This ensures we count each match only once per team, not once per player
    match_results_subquery = (
        select(
            MatchPlayerStats.team_id,
            MatchPlayerStats.match_id,
            func.max(cast(MatchPlayerStats.result, Integer)).label("team_result")
        )
        .join(Match, MatchPlayerStats.match_id == Match.id)
        .where(Match.tournament_id == tournament_id)
        .group_by(MatchPlayerStats.team_id, MatchPlayerStats.match_id)
    ).subquery()
    
    # Now aggregate team stats from the match-level results
    statement = (
        select(
            Team.id,
            Team.team_name,
            func.count(match_results_subquery.c.match_id).label("games_played"),
            func.sum(match_results_subquery.c.team_result).label("wins"),
        )
        .join(TeamTournament, TeamTournament.team_id == Team.id)
        .join(match_results_subquery, match_results_subquery.c.team_id == Team.id)
        .where(TeamTournament.tournament_id == tournament_id)
        .group_by(Team.id, Team.team_name)
        .order_by(func.sum(match_results_subquery.c.team_result).desc())
    )
    
    results = session.exec(statement).all()
    
    teams = []
    for result in results:
        games = result.games_played or 0
        wins = result.wins or 0
        losses = games - wins
        win_rate = (wins / games * 100) if games > 0 else 0
        
        teams.append({
            "team_id": result.id,
            "team_name": result.team_name,
            "games_played": games,
            "wins": wins,
            "losses": losses,
            "win_rate": round(win_rate, 2),
        })
    
    return teams


@router.get("/{tournament_id}/matches")
async def get_tournament_matches(
    tournament_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get all matches in tournament"""
    statement = (
        select(Match)
        .where(Match.tournament_id == tournament_id)
        .order_by(Match.match_date.desc(), Match.game_number.desc())
        .offset(skip)
        .limit(limit)
    )
    
    matches = session.exec(statement).all()
    
    enriched_matches = []
    for match in matches:
        # Get teams for this match
        team_statement = (
            select(Team.team_name, MatchPlayerStats.result)
            .join(MatchPlayerStats, MatchPlayerStats.team_id == Team.id)
            .where(MatchPlayerStats.match_id == match.id)
            .distinct()
        )
        team_results = session.exec(team_statement).all()
        
        match_dict = match.model_dump()
        match_dict["teams"] = [
            {"team_name": name, "result": result}
            for name, result in team_results
        ]
        enriched_matches.append(match_dict)
    
    return enriched_matches


@router.get("/{tournament_id}/stats")
async def get_tournament_stats(
    tournament_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get tournament statistics and leaderboards"""
    from sqlmodel import Integer, cast
    
    # Top players by KDA
    top_kda_statement = (
        select(
            Player.id,
            Player.player_name,
            Team.team_name,
            func.count(MatchPlayerStats.match_id).label("games"),
            func.avg(MatchPlayerStats.kills).label("avg_kills"),
            func.avg(MatchPlayerStats.deaths).label("avg_deaths"),
            func.avg(MatchPlayerStats.assists).label("avg_assists"),
        )
        .join(MatchPlayerStats, MatchPlayerStats.player_id == Player.id)
        .join(Team, MatchPlayerStats.team_id == Team.id)
        .join(Match, MatchPlayerStats.match_id == Match.id)
        .where(Match.tournament_id == tournament_id)
        .group_by(Player.id, Player.player_name, Team.team_name)
        .having(func.count(MatchPlayerStats.match_id) >= 3)
    )
    
    kda_results = session.exec(top_kda_statement).all()
    
    top_players = []
    for result in kda_results:
        deaths = result.avg_deaths or 0
        kda = ((result.avg_kills + result.avg_assists) / deaths) if deaths > 0 else (result.avg_kills + result.avg_assists)
        
        top_players.append({
            "player_id": result.id,
            "player_name": result.player_name,
            "team_name": result.team_name,
            "games_played": result.games,
            "avg_kda": round(kda, 2),
            "avg_kills": round(result.avg_kills, 2),
            "avg_deaths": round(result.avg_deaths, 2),
            "avg_assists": round(result.avg_assists, 2),
        })
    
    # Sort by KDA
    top_players.sort(key=lambda x: x["avg_kda"], reverse=True)
    
    # Most picked champions
    champion_statement = (
        select(
            MatchPlayerStats.champion,
            func.count(MatchPlayerStats.match_id).label("picks"),
            func.sum(cast(MatchPlayerStats.result, Integer)).label("wins"),
        )
        .join(Match, MatchPlayerStats.match_id == Match.id)
        .where(Match.tournament_id == tournament_id)
        .where(MatchPlayerStats.champion.is_not(None))
        .group_by(MatchPlayerStats.champion)
        .order_by(func.count(MatchPlayerStats.match_id).desc())
        .limit(10)
    )
    
    champion_results = session.exec(champion_statement).all()
    
    champion_stats = []
    for result in champion_results:
        picks = result.picks or 0
        wins = result.wins or 0
        win_rate = (wins / picks * 100) if picks > 0 else 0
        
        champion_stats.append({
            "champion": result.champion,
            "picks": picks,
            "wins": wins,
            "win_rate": round(win_rate, 2),
        })
    
    # Average game duration
    avg_duration_stmt = select(func.avg(Match.game_length)).where(
        Match.tournament_id == tournament_id
    )
    avg_duration = session.exec(avg_duration_stmt).first() or 0
    
    return {
        "top_players": top_players[:10],
        "champion_stats": champion_stats,
        "avg_game_duration": round(avg_duration, 2) if avg_duration else 0,
    }
