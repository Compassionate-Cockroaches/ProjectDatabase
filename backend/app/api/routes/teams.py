from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func, cast, Integer

from app.api.deps import get_current_active_user, require_admin
from app.core.database import get_session
from app.models.team import Team
from app.models.team_tournament import TeamTournament
from app.models.tournament import Tournament
from app.models.match_player_stats import MatchPlayerStats
from app.models.match import Match
from app.models.player import Player
from app.models.user import User
from app.schemas.team import TeamCreate, TeamResponse, TeamUpdate

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get("/", response_model=List[TeamResponse])
async def list_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str = Query(None, description="Search by team name"),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get all teams (Public access)"""
    statement = select(Team).offset(skip).limit(limit)

    # Add search filter if provided
    if search:
        statement = statement.where(Team.team_name.contains(search))

    teams = session.exec(statement).all()
    return teams


@router.get("/{team_id}", response_model=TeamResponse)
async def read_team(
    team_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get single team by ID (Public access)"""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user=Annotated[User, Depends(require_admin)],
):
    """Create new team (Admin only)"""
    # Check if team name already exists
    statement = select(Team).where(Team.team_name == team_data.team_name)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Team name already exists"
        )

    # Create team
    team = Team(team_name=team_data.team_name, external_id="UNOFFICIAL")
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: str,
    team_data: TeamUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Update team (Admin only)"""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    update_data = team_data.model_dump(exclude_unset=True)

    if "team_name" in update_data:
        statement = select(Team).where(Team.team_name == update_data["team_name"])
        existing = session.exec(statement).first()
        if existing and existing.id != team_id:
            raise HTTPException(status_code=400, detail="Team name already exists")

    for key, value in update_data.items():
        setattr(team, key, value)

    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: str,
    session: Annotated[Session, Depends(get_session)],
    current_user=Depends(require_admin),
):
    """Delete team (Admin only)"""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    session.delete(team)
    session.commit()
    return None


@router.get("/{team_id}/tournaments")
async def get_team_tournaments(
    team_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get team's tournament history with results"""
    statement = (
        select(
            Tournament.id,
            Tournament.league,
            Tournament.year,
            Tournament.split,
            Tournament.playoffs,
            TeamTournament.result,
        )
        .join(TeamTournament, TeamTournament.tournament_id == Tournament.id)
        .where(TeamTournament.team_id == team_id)
        .order_by(Tournament.year.desc(), Tournament.split.desc())
    )
    
    results = session.exec(statement).all()
    
    tournaments = []
    for tournament_id, league, year, split, playoffs, result in results:
        # Count wins and losses in this tournament
        match_stats = (
            select(
                func.count(MatchPlayerStats.match_id.distinct()).label("total_games"),
                func.sum(cast(MatchPlayerStats.result, Integer)).label("wins"),
            )
            .join(Match, MatchPlayerStats.match_id == Match.id)
            .where(MatchPlayerStats.team_id == team_id)
            .where(Match.tournament_id == tournament_id)
        )
        stats_result = session.exec(match_stats).first()
        
        total_games = stats_result.total_games or 0
        wins = stats_result.wins or 0
        losses = total_games - wins
        
        tournaments.append({
            "tournament_id": tournament_id,
            "league": league,
            "year": year,
            "split": split,
            "playoffs": playoffs,
            "result": result,
            "wins": wins,
            "losses": losses,
            "total_games": total_games,
        })
    
    return tournaments


@router.get("/{team_id}/matches")
async def get_team_matches(
    team_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get team's match history"""
    statement = (
        select(Match, Tournament.league, Tournament.year, Tournament.split)
        .join(Tournament, Match.tournament_id == Tournament.id)
        .join(MatchPlayerStats, MatchPlayerStats.match_id == Match.id)
        .where(MatchPlayerStats.team_id == team_id)
        .distinct()
        .order_by(Match.match_date.desc())
        .offset(skip)
        .limit(limit)
    )
    
    results = session.exec(statement).all()
    
    matches = []
    for match, league, year, split in results:
        # Get result for this team
        result_stmt = (
            select(MatchPlayerStats.result)
            .where(MatchPlayerStats.match_id == match.id)
            .where(MatchPlayerStats.team_id == team_id)
            .limit(1)
        )
        result = session.exec(result_stmt).first()
        
        # Get opponent team
        opponent_stmt = (
            select(Team.team_name)
            .join(MatchPlayerStats, MatchPlayerStats.team_id == Team.id)
            .where(MatchPlayerStats.match_id == match.id)
            .where(MatchPlayerStats.team_id != team_id)
            .distinct()
            .limit(1)
        )
        opponent = session.exec(opponent_stmt).first()
        
        match_dict = match.model_dump()
        match_dict["tournament_name"] = f"{league} {year} {split or ''}".strip()
        match_dict["result"] = result
        match_dict["opponent"] = opponent
        matches.append(match_dict)
    
    return matches


@router.get("/{team_id}/players")
async def get_team_players(
    team_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get all players who have played for this team"""
    statement = (
        select(
            Player.id,
            Player.player_name,
            Player.position,
            func.count(MatchPlayerStats.match_id.distinct()).label("games_played"),
            func.sum(cast(MatchPlayerStats.result, Integer)).label("wins"),
            func.avg(MatchPlayerStats.kills).label("avg_kills"),
            func.avg(MatchPlayerStats.deaths).label("avg_deaths"),
            func.avg(MatchPlayerStats.assists).label("avg_assists"),
        )
        .join(MatchPlayerStats, MatchPlayerStats.player_id == Player.id)
        .where(MatchPlayerStats.team_id == team_id)
        .group_by(Player.id, Player.player_name, Player.position)
        .order_by(func.count(MatchPlayerStats.match_id.distinct()).desc())
    )
    
    results = session.exec(statement).all()
    
    players = []
    for result in results:
        games = result.games_played or 0
        wins = result.wins or 0
        deaths = result.avg_deaths or 0
        
        win_rate = (wins / games * 100) if games > 0 else 0
        kda = ((result.avg_kills + result.avg_assists) / deaths) if deaths > 0 else (result.avg_kills + result.avg_assists)
        
        players.append({
            "player_id": result.id,
            "player_name": result.player_name,
            "position": result.position,
            "games_played": games,
            "wins": wins,
            "win_rate": round(win_rate, 2),
            "avg_kills": round(result.avg_kills, 2),
            "avg_deaths": round(result.avg_deaths, 2),
            "avg_assists": round(result.avg_assists, 2),
            "avg_kda": round(kda, 2),
        })
    
    return players


@router.get("/{team_id}/stats")
async def get_team_stats(
    team_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get overall team statistics"""
    # Count unique matches and calculate wins
    match_statement = (
        select(
            Match.id,
            func.max(cast(MatchPlayerStats.result, Integer)).label("won")
        )
        .join(MatchPlayerStats, MatchPlayerStats.match_id == Match.id)
        .where(MatchPlayerStats.team_id == team_id)
        .group_by(Match.id)
    )
    
    match_results = session.exec(match_statement).all()
    
    total_games = len(match_results)
    total_wins = sum(1 for _, won in match_results if won)
    
    # Calculate average stats per player
    stats_statement = (
        select(
            func.avg(MatchPlayerStats.kills).label("avg_kills"),
            func.avg(MatchPlayerStats.deaths).label("avg_deaths"),
            func.avg(MatchPlayerStats.assists).label("avg_assists"),
            func.avg(Match.game_length).label("avg_game_duration"),
        )
        .join(Match, MatchPlayerStats.match_id == Match.id)
        .where(MatchPlayerStats.team_id == team_id)
    )
    
    result = session.exec(stats_statement).first()
    
    deaths = result.avg_deaths or 0
    
    win_rate = (total_wins / total_games * 100) if total_games > 0 else 0
    kda = ((result.avg_kills + result.avg_assists) / deaths) if deaths > 0 else (result.avg_kills + result.avg_assists)
    
    # Count tournaments participated
    tournament_count_stmt = (
        select(func.count(TeamTournament.tournament_id.distinct()))
        .where(TeamTournament.team_id == team_id)
    )
    tournament_count = session.exec(tournament_count_stmt).first()
    
    return {
        "total_games": total_games,
        "total_wins": total_wins,
        "total_losses": total_games - total_wins,
        "win_rate": round(win_rate, 2),
        "avg_kda": round(kda, 2),
        "avg_kills": round(result.avg_kills, 2) if result.avg_kills else 0,
        "avg_deaths": round(result.avg_deaths, 2) if result.avg_deaths else 0,
        "avg_assists": round(result.avg_assists, 2) if result.avg_assists else 0,
        "avg_game_duration": round(result.avg_game_duration, 2) if result.avg_game_duration else 0,
        "tournaments_participated": tournament_count or 0,
    }
