from typing import Annotated, List
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func, cast, Integer
from app.core.database import get_session
from app.models.player import Player
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.match import Match
from app.models.match_player_stats import MatchPlayerStats
from app.models.team_tournament import TeamTournament
from app.api.deps import get_current_active_user, require_analyst
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Response models for analytics
class PlayerKDAStats(BaseModel):
    player_id: str
    player_name: str
    position: str
    games_played: int
    total_kills: int
    total_deaths: int
    total_assists: int
    kda_ratio: float

class TeamWinRateStats(BaseModel):
    team_id: str
    team_name: str
    matches_played: int
    wins: int
    losses: int
    win_rate: float

class TournamentParticipationStats(BaseModel):
    tournament_id: str
    league: str
    year: int
    split: str
    total_teams: int
    total_matches: int

class DashboardStats(BaseModel):
    total_teams: int
    total_players: int
    total_tournaments: int
    total_matches: int

@router.get("/players/top-kda", response_model=List[PlayerKDAStats])
async def get_top_players_by_kda(
    limit: int = Query(10, ge=1, le=100),
    position: str = Query(None, description="Filter by position"),
    tournament_id: str = Query(None, description="Filter by tournament"),
    session: Annotated[Session, Depends(get_session)] = None,
    current_user: Annotated[User, Depends(require_analyst)] = None
):
    """
    Get top players by KDA ratio (Analyst/Admin only)
    Uses GROUP BY aggregation for analytics
    """
    # Base query with GROUP BY
    query = select(
        Player.id,
        Player.player_name,
        Player.position,
        func.count(MatchPlayerStats.match_id).label("games_played"),
        func.sum(MatchPlayerStats.kills).label("total_kills"),
        func.sum(MatchPlayerStats.deaths).label("total_deaths"),
        func.sum(MatchPlayerStats.assists).label("total_assists")
    ).join(
        MatchPlayerStats, Player.id == MatchPlayerStats.player_id
    ).group_by(
        Player.id, Player.player_name, Player.position
    )
    
    # Add position filter
    if position:
        query = query.where(Player.position == position)
    
    # Add tournament filter
    if tournament_id:
        query = query.join(
            Match, MatchPlayerStats.match_id == Match.id
        ).where(
            Match.tournament_id == tournament_id
        )
    
    # Having clause - only players with at least 5 games
    query = query.having(func.count(MatchPlayerStats.match_id) >= 5)
    
    results = session.exec(query).all()
    
    # Calculate KDA and sort
    player_stats = []
    for row in results:
        deaths = row.total_deaths or 1  # Avoid division by zero
        kda = (row.total_kills + row.total_assists) / deaths
        
        player_stats.append(PlayerKDAStats(
            player_id=row.id,
            player_name=row.player_name,
            position=row.position or "Unknown",
            games_played=row.games_played,
            total_kills=row.total_kills or 0,
            total_deaths=row.total_deaths or 0,
            total_assists=row.total_assists or 0,
            kda_ratio=round(kda, 2)
        ))
    
    # Sort by KDA and return top N
    player_stats.sort(key=lambda x: x.kda_ratio, reverse=True)
    return player_stats[:limit]

@router.get("/teams/win-rate", response_model=List[TeamWinRateStats])
async def get_teams_win_rate(
    tournament_id: str = Query(None, description="Filter by tournament"),
    session: Annotated[Session, Depends(get_session)] = None,
    current_user: Annotated[User, Depends(require_analyst)] = None
):
    """
    Get team win rates (Analyst/Admin only)
    Uses GROUP BY with aggregation
    """
    # Query with GROUP BY
    query = select(
        Team.id,
        Team.team_name,
        func.count(MatchPlayerStats.match_id).label("matches_played"),
        func.sum(cast(MatchPlayerStats.result, Integer)).label("wins")
    ).join(
        MatchPlayerStats, Team.id == MatchPlayerStats.team_id
    ).group_by(
        Team.id, Team.team_name
    )
    
    # Add tournament filter
    if tournament_id:
        query = query.join(
            Match, MatchPlayerStats.match_id == Match.id
        ).where(
            Match.tournament_id == tournament_id
        )
    
    results = session.exec(query).all()
    
    # Calculate win rates
    team_stats = []
    for row in results:
        matches = row.matches_played // 10  # Each match has ~10 player records
        wins = (row.wins or 0) // 5  # Each win has 5 winning players
        losses = matches - wins
        win_rate = (wins / matches * 100) if matches > 0 else 0
        
        team_stats.append(TeamWinRateStats(
            team_id=row.id,
            team_name=row.team_name,
            matches_played=matches,
            wins=wins,
            losses=losses,
            win_rate=round(win_rate, 2)
        ))
    
    # Sort by win rate
    team_stats.sort(key=lambda x: x.win_rate, reverse=True)
    return team_stats

@router.get("/tournaments/participation-stats", response_model=List[TournamentParticipationStats])
async def get_tournament_participation_stats(
    session: Annotated[Session, Depends(get_session)] = None,
    current_user: Annotated[User, Depends(require_analyst)] = None
):
    """
    Get tournament participation statistics (Analyst/Admin only)
    Uses multiple JOINs with GROUP BY
    """
    # Query with JOINs and GROUP BY
    query = select(
        Tournament.id,
        Tournament.league,
        Tournament.year,
        Tournament.split,
        func.count(func.distinct(TeamTournament.team_id)).label("total_teams"),
        func.count(func.distinct(Match.id)).label("total_matches")
    ).outerjoin(
        TeamTournament, Tournament.id == TeamTournament.tournament_id
    ).outerjoin(
        Match, Tournament.id == Match.tournament_id
    ).group_by(
        Tournament.id, Tournament.league, Tournament.year, Tournament.split
    ).order_by(
        Tournament.year.desc(), Tournament.split
    )
    
    results = session.exec(query).all()
    
    stats = [
        TournamentParticipationStats(
            tournament_id=row.id,
            league=row.league,
            year=row.year,
            split=row.split or "N/A",
            total_teams=row.total_teams or 0,
            total_matches=row.total_matches or 0
        )
        for row in results
    ]
    
    return stats

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    session: Annotated[Session, Depends(get_session)] = None
):
    """
    Get summary dashboard statistics (Public access)
    This endpoint can use a view in production
    """
    # Count totals
    total_teams = session.exec(select(func.count(Team.id))).first() or 0
    total_players = session.exec(select(func.count(Player.id))).first() or 0
    total_tournaments = session.exec(select(func.count(Tournament.id))).first() or 0
    total_matches = session.exec(select(func.count(Match.id))).first() or 0
    
    return DashboardStats(
        total_teams=total_teams,
        total_players=total_players,
        total_tournaments=total_tournaments,
        total_matches=total_matches
    )