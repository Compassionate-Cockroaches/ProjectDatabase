from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Integer, Session, cast, func, select

from app.api.deps import get_current_active_user, require_admin
from app.core.database import get_session
from app.models.match_player_stats import MatchPlayerStats
from app.models.match import Match
from app.models.player import Player
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.user import User
from app.schemas.player import (
    PlayerCreate,
    PlayerResponse,
    PlayerUpdate,
    PlayerWithStats,
)

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("/", response_model=List[PlayerResponse])
async def list_players(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    position: str = Query(
        None, description="Filter by position (Top, Jungle, Mid, Bot, Support)"
    ),
    search: str = Query(None, description="Search by player name"),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get all players (Public access)"""
    statement = select(Player).offset(skip).limit(limit)

    # Add filters
    if position:
        statement = statement.where(Player.position == position)
    if search:
        statement = statement.where(Player.player_name.contains(search))

    players = session.exec(statement).all()
    return players


@router.get("/{player_id}", response_model=PlayerWithStats)
async def get_player(player_id: str, session: Annotated[Session, Depends(get_session)]):
    """Get player details with career stats (Public access)"""
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Get aggregated stats
    stats_query = select(
        func.count(MatchPlayerStats.match_id).label("total_games"),
        func.sum(cast(MatchPlayerStats.result, Integer)).label("total_wins"),
        func.sum(MatchPlayerStats.kills).label("total_kills"),
        func.sum(MatchPlayerStats.deaths).label("total_deaths"),
        func.sum(MatchPlayerStats.assists).label("total_assists"),
    ).where(MatchPlayerStats.player_id == player_id)

    stats = session.exec(stats_query).first()

    # Calculate KDA and win rate
    total_games = stats.total_games or 0
    total_wins = stats.total_wins or 0
    total_kills = stats.total_kills or 0
    total_deaths = stats.total_deaths or 0
    total_assists = stats.total_assists or 0

    avg_kda = (
        ((total_kills + total_assists) / total_deaths)
        if total_deaths > 0
        else total_kills + total_assists
    )
    win_rate = (total_wins / total_games * 100) if total_games > 0 else 0

    return PlayerWithStats(
        id=player.id,
        player_name=player.player_name,
        position=player.position,
        external_id=player.external_id,
        total_games=total_games,
        total_wins=total_wins,
        total_kills=total_kills,
        total_deaths=total_deaths,
        total_assists=total_assists,
        avg_kda=round(avg_kda, 2),
        win_rate=round(win_rate, 2),
    )


@router.post("/", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
async def create_player(
    player_data: PlayerCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Create new player (Admin only)"""
    # Create player
    db_player = Player(
        player_name=player_data.player_name,
        position=player_data.position,
        external_id="UNOFFICIAL",
    )
    session.add(db_player)
    session.commit()
    session.refresh(db_player)
    return db_player


@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: str,
    player_data: PlayerUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Update player (Admin only)"""
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Update fields
    update_data = player_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(player, key, value)

    session.add(player)
    session.commit()
    session.refresh(player)
    return player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_player(
    player_id: str,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)],
):
    """Delete player (Admin only)"""
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    session.delete(player)
    session.commit()
    return None


@router.get("/{player_id}/matches")
async def get_player_matches(
    player_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get player's match history with stats"""
    # Get player matches with related data
    statement = (
        select(MatchPlayerStats, Match.match_date, Team.team_name)
        .join(Match, MatchPlayerStats.match_id == Match.id)
        .join(Team, MatchPlayerStats.team_id == Team.id)
        .where(MatchPlayerStats.player_id == player_id)
        .order_by(Match.match_date.desc())
        .offset(skip)
        .limit(limit)
    )
    
    results = session.exec(statement).all()
    
    matches = []
    for stats, match_date, team_name in results:
        match_dict = stats.model_dump()
        match_dict["match_date"] = match_date
        match_dict["team_name"] = team_name
        matches.append(match_dict)
    
    return matches


@router.get("/{player_id}/champions")
async def get_player_champion_stats(
    player_id: str,
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get player's champion statistics"""
    statement = (
        select(
            MatchPlayerStats.champion,
            func.count(MatchPlayerStats.match_id).label("games_played"),
            func.sum(cast(MatchPlayerStats.result, Integer)).label("wins"),
            func.avg(MatchPlayerStats.kills).label("avg_kills"),
            func.avg(MatchPlayerStats.deaths).label("avg_deaths"),
            func.avg(MatchPlayerStats.assists).label("avg_assists"),
        )
        .where(MatchPlayerStats.player_id == player_id)
        .group_by(MatchPlayerStats.champion)
        .order_by(func.count(MatchPlayerStats.match_id).desc())
    )
    
    results = session.exec(statement).all()
    
    champion_stats = []
    for result in results:
        games = result.games_played or 0
        wins = result.wins or 0
        deaths = result.avg_deaths or 0
        
        win_rate = (wins / games * 100) if games > 0 else 0
        kda = ((result.avg_kills + result.avg_assists) / deaths) if deaths > 0 else (result.avg_kills + result.avg_assists)
        
        champion_stats.append({
            "champion": result.champion,
            "games_played": games,
            "wins": wins,
            "win_rate": round(win_rate, 2),
            "avg_kills": round(result.avg_kills, 2),
            "avg_deaths": round(result.avg_deaths, 2),
            "avg_assists": round(result.avg_assists, 2),
            "avg_kda": round(kda, 2),
        })
    
    return champion_stats


@router.get("/{player_id}/teams")
async def get_player_teams(
    player_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get all teams the player has played for"""
    statement = (
        select(
            Team.id,
            Team.team_name,
            func.count(MatchPlayerStats.match_id.distinct()).label("games_played"),
            func.sum(cast(MatchPlayerStats.result, Integer)).label("wins"),
        )
        .join(MatchPlayerStats, MatchPlayerStats.team_id == Team.id)
        .where(MatchPlayerStats.player_id == player_id)
        .group_by(Team.id, Team.team_name)
        .order_by(func.count(MatchPlayerStats.match_id.distinct()).desc())
    )
    
    results = session.exec(statement).all()
    
    teams = []
    for result in results:
        games = result.games_played or 0
        wins = result.wins or 0
        win_rate = (wins / games * 100) if games > 0 else 0
        
        teams.append({
            "team_id": result.id,
            "team_name": result.team_name,
            "games_played": games,
            "wins": wins,
            "win_rate": round(win_rate, 2),
        })
    
    return teams
