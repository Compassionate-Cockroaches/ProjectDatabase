from typing import Annotated, List, Optional, Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlmodel import Session, select, func, cast, Integer, case

from app.core.database import get_session
from app.models.player import Player
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.match import Match
from app.models.match_player_stats import MatchPlayerStats

router = APIRouter(prefix="/analytics", tags=["Analytics"])

class PlayerLeaderboardRow(BaseModel):
    player_id: str
    player_name: str
    position: str
    games_played: int
    metric: str
    metric_value: float

    tournament_label: Optional[str] = None
    total_kills: Optional[int] = None
    total_deaths: Optional[int] = None
    total_assists: Optional[int] = None

    kda: Optional[float] = None
    avg_dpm: Optional[float] = None
    avg_cspm: Optional[float] = None
    avg_vision: Optional[float] = None
    win_rate: Optional[float] = None

class TeamLeaderboardRow(BaseModel):
    team_id: str
    team_name: str
    tournament_label: Optional[str] = None
    matches_played: int
    wins: int
    losses: int
    win_rate: float

class TournamentLeaderboardRow(BaseModel):
    tournament_id: str
    league: str
    year: int
    split: str
    tournament_label: Optional[str] = None
    metric: str
    metric_value: float
    total_matches: int
    total_teams: int
    avg_game_duration: Optional[float] = None

class DashboardStats(BaseModel):
    total_teams: int
    total_players: int
    total_tournaments: int
    total_matches: int

@router.get("/leaderboard/players", response_model=List[PlayerLeaderboardRow])
async def players_leaderboard(
    # Rankable metric
    metric: Literal["kda", "dpm", "cspm", "vision", "winrate"] = Query("kda"),
    year: Optional[int] = Query(None),
    league: Optional[str] = Query(None),
    split: Optional[str] = Query(None),
    playoffs: Optional[int] = Query(None),
    patch: Optional[str] = Query(None),
    # Player-only filters
    position: Optional[str] = Query(None),
    champion: Optional[str] = Query(None),
    side: Optional[str] = Query(None),
    # Controls
    limit: int = Query(10, ge=1, le=100),
    min_games: int = Query(5, ge=1, le=100),
    session: Annotated[Session, Depends(get_session)] = None,
):

    label_parts = []
    if league:
        label_parts.append(league)
    if split:
        label_parts.append(split)
    if year is not None:
        label_parts.append(str(year))
    tournament_label = " ".join(label_parts) if label_parts else "All data"
    if playoffs == 1:
        tournament_label += " (Playoffs)"
    if patch:
        tournament_label += f" • Patch {patch}"

    # Base query
    base = (
        select(
            Player.id.label("player_id"),
            Player.player_name.label("player_name"),
            Player.position.label("position"),
            func.count(func.distinct(MatchPlayerStats.match_id)).label("games_played"),
        )
        .join(MatchPlayerStats, Player.id == MatchPlayerStats.player_id)
        .join(Match, MatchPlayerStats.match_id == Match.id)
        .join(Tournament, Match.tournament_id == Tournament.id)
        .group_by(Player.id, Player.player_name, Player.position)
    )

    # Player-only filters
    if position:
        base = base.where(Player.position == position)
    if champion:
        base = base.where(MatchPlayerStats.champion == champion)
    if side:
        base = base.where(MatchPlayerStats.side == side)

    # Shared-category filters
    if year is not None:
        base = base.where(Tournament.year == year)
    if league:
        base = base.where(Tournament.league == league)
    if split:
        base = base.where(Tournament.split == split)
    if playoffs is not None:
        base = base.where(Tournament.playoffs == playoffs)
    if patch:
        base = base.where(Match.patch == patch)

    query = base.add_columns(
        func.sum(MatchPlayerStats.kills).label("kills"),
        func.sum(MatchPlayerStats.deaths).label("deaths"),
        func.sum(MatchPlayerStats.assists).label("assists"),
        func.avg(MatchPlayerStats.dpm).label("avg_dpm"),
        func.avg(MatchPlayerStats.cspm).label("avg_cspm"),
        func.avg(MatchPlayerStats.visionscore).label("avg_vision"),
        func.avg(cast(MatchPlayerStats.result, Integer)).label("win_rate"),
    )

    query = query.having(func.count(func.distinct(MatchPlayerStats.match_id)) >= min_games)

    rows = session.exec(query).all()
    results: List[PlayerLeaderboardRow] = []

    for row in rows:
        kills = int(row.kills or 0)
        deaths = int(row.deaths or 0)
        assists = int(row.assists or 0)
        denom = deaths if deaths > 0 else 1
        kda = (kills + assists) / denom

        avg_dpm = float(row.avg_dpm or 0)
        avg_cspm = float(row.avg_cspm or 0)
        avg_vision = float(row.avg_vision or 0)
        win_rate = float(row.win_rate or 0) * 100.0

        # Ranking metric_value
        if metric == "kda": metric_value = kda
        elif metric == "dpm": metric_value = avg_dpm
        elif metric == "cspm": metric_value = avg_cspm
        elif metric == "vision": metric_value = avg_vision
        elif metric == "winrate": metric_value = win_rate
        else: metric_value = 0

        results.append(
            PlayerLeaderboardRow(
                player_id=row.player_id,
                player_name=row.player_name,
                position=row.position or "Unknown",
                games_played=int(row.games_played or 0),

                metric=metric,
                metric_value=round(float(metric_value), 2),

                tournament_label=tournament_label,
                total_kills=kills,
                total_deaths=deaths,
                total_assists=assists,

                kda=round(float(kda), 2),
                avg_dpm=round(avg_dpm, 2),
                avg_cspm=round(avg_cspm, 2),
                avg_vision=round(avg_vision, 2),
                win_rate=round(win_rate, 2),
            )
        )

    results.sort(key=lambda x: x.metric_value, reverse=True)
    return results[:limit]

@router.get("/leaderboard/teams", response_model=List[TeamLeaderboardRow])
async def teams_leaderboard(
    year: Optional[int] = Query(None),
    league: Optional[str] = Query(None),
    split: Optional[str] = Query(None),
    playoffs: Optional[int] = Query(None),
    patch: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    min_matches: int = Query(5, ge=1, le=100),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """
    Team leaderboard ranked by win rate.
    Returns supporting metrics + tournament_label so users can verify filters.
    """

    # Build label so users can verify applied filters
    label_parts = []
    if league:
        label_parts.append(league)
    if split:
        label_parts.append(split)
    if year is not None:
        label_parts.append(str(year))

    tournament_label = " ".join(label_parts) if label_parts else "All data"
    if playoffs == 1:
        tournament_label += " (Playoffs)"
    if patch:
        tournament_label += f" • Patch {patch}"

    team_per_match = (
        select(
            Team.id.label("team_id"),
            Team.team_name.label("team_name"),
            Match.id.label("match_id"),
            case(
                (func.sum(cast(MatchPlayerStats.result, Integer)) >= 3, 1),
                else_=0,
            ).label("team_win"),
        )
        .join(MatchPlayerStats, Team.id == MatchPlayerStats.team_id)
        .join(Match, MatchPlayerStats.match_id == Match.id)
        .join(Tournament, Match.tournament_id == Tournament.id)
        .group_by(Team.id, Team.team_name, Match.id)
    )

    # Shared filters
    if year is not None:
        team_per_match = team_per_match.where(Tournament.year == year)
    if league:
        team_per_match = team_per_match.where(Tournament.league == league)
    if split:
        team_per_match = team_per_match.where(Tournament.split == split)
    if playoffs is not None:
        team_per_match = team_per_match.where(Tournament.playoffs == playoffs)
    if patch:
        team_per_match = team_per_match.where(Match.patch == patch)

    subq = team_per_match.subquery()

    base = (
        select(
            subq.c.team_id,
            subq.c.team_name,
            func.count(func.distinct(subq.c.match_id)).label("matches_played"),
            func.sum(cast(subq.c.team_win, Integer)).label("wins"),
        )
        .group_by(subq.c.team_id, subq.c.team_name)
        .having(func.count(func.distinct(subq.c.match_id)) >= min_matches)
    )

    core_rows = session.exec(base).all()

    results: List[TeamLeaderboardRow] = []
    for row in core_rows:
        matches = int(row.matches_played or 0)
        wins = int(row.wins or 0)
        losses = matches - wins
        win_rate = (wins / matches * 100) if matches > 0 else 0.0

        results.append(
            TeamLeaderboardRow(
                team_id=row.team_id,
                team_name=row.team_name,
                tournament_label=tournament_label,
                matches_played=matches,
                wins=wins,
                losses=losses,
                win_rate=round(win_rate, 2),
            )
        )

    results.sort(key=lambda x: x.win_rate, reverse=True)
    return results[:limit]

@router.get("/leaderboard/tournaments", response_model=List[TournamentLeaderboardRow])
async def tournaments_leaderboard(
    # Rankable tournament metrics
    metric: Literal["total_matches", "total_teams", "avg_game_duration"] = Query(
        "total_matches", description="Tournament ranking metric"
    ),
    # Shared-category filters
    year: Optional[int] = Query(None),
    league: Optional[str] = Query(None),
    split: Optional[str] = Query(None),
    playoffs: Optional[int] = Query(None),
    patch: Optional[str] = Query(None),
    # Controls
    limit: int = Query(10, ge=1, le=100),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """
    Tournament leaderboard

    Rankable metrics:
    - total_matches: number of matches played
    - total_teams: number of distinct teams
    - avg_game_duration: average match duration (seconds)
    """

    base = (
        select(
            Tournament.id.label("tournament_id"),
            Tournament.league.label("league"),
            Tournament.year.label("year"),
            Tournament.split.label("split"),
            func.count(func.distinct(Match.id)).label("total_matches"),
            func.count(func.distinct(Team.id)).label("total_teams"),
            func.avg(Match.game_duration).label("avg_game_duration"),
        )
        .join(Match, Match.tournament_id == Tournament.id)
        .join(MatchPlayerStats, Match.id == MatchPlayerStats.match_id)
        .join(Team, MatchPlayerStats.team_id == Team.id)
        .group_by(
            Tournament.id,
            Tournament.league,
            Tournament.year,
            Tournament.split,
        )
    )

    # Shared-category filters
    if year is not None:
        base = base.where(Tournament.year == year)
    if league:
        base = base.where(Tournament.league == league)
    if split:
        base = base.where(Tournament.split == split)
    if playoffs is not None:
        base = base.where(Tournament.playoffs == playoffs)
    if patch:
        base = base.where(Match.patch == patch)

    rows = session.exec(base).all()

    results: List[TournamentLeaderboardRow] = []

    for row in rows:
        if metric == "total_matches":
            metric_value = row.total_matches
        elif metric == "total_teams":
            metric_value = row.total_teams
        elif metric == "avg_game_duration":
            metric_value = float(row.avg_game_duration or 0)
        else:
            metric_value = 0
        tournament_label = f"{row.league} {row.split} {row.year}"
        
        if playoffs == 1:
            tournament_label += " (Playoffs)"
        if patch:
            tournament_label += f" • Patch {patch}"
        results.append(
            TournamentLeaderboardRow(
                 tournament_id=row.tournament_id,
                league=row.league,
                year=row.year,
                split=row.split,
                tournament_label=tournament_label,
                metric=metric,
                metric_value=round(float(metric_value), 2),
                total_matches=row.total_matches,
                total_teams=row.total_teams,
                avg_game_duration=(
                    round(float(row.avg_game_duration), 2)
                    if row.avg_game_duration is not None
                    else None
                ),
            )
        )

    results.sort(key=lambda x: x.metric_value, reverse=True)
    return results[:limit]

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(session: Annotated[Session, Depends(get_session)] = None):
    """
    Get summary dashboard statistics (Public access)
    This endpoint can use a view in production
    """
    total_teams = session.exec(select(func.count(Team.id))).first() or 0
    total_players = session.exec(select(func.count(Player.id))).first() or 0
    total_tournaments = session.exec(select(func.count(Tournament.id))).first() or 0
    total_matches = session.exec(select(func.count(Match.id))).first() or 0

    return DashboardStats(
        total_teams=total_teams,
        total_players=total_players,
        total_tournaments=total_tournaments,
        total_matches=total_matches,
    )