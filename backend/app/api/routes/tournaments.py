from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.models.tournament import Tournament
from app.models.team_tournament import TeamTournament
from app.models.match import Match
from app.schemas.tournament import TournamentResponse, TournamentCreate, TournamentUpdate, TournamentWithStats
from app.api.deps import get_current_active_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

@router.get("/", response_model=List[TournamentResponse])
async def list_tournaments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    year: int = Query(None, description="Filter by year"),
    league: str = Query(None, description="Filter by league (LCK, LPL, LEC, etc.)"),
    playoffs: bool = Query(None, description="Filter by playoffs"),
    session: Annotated[Session, Depends(get_session)] = None
):
    """Get all tournaments (Public access)"""
    statement = select(Tournament).offset(skip).limit(limit)
    
    # Add filters
    if year:
        statement = statement.where(Tournament.year == year)
    if league:
        statement = statement.where(Tournament.league == league)
    if playoffs is not None:
        statement = statement.where(Tournament.playoffs == playoffs)
    
    # Order by year and split
    statement = statement.order_by(Tournament.year.desc(), Tournament.split)
    
    tournaments = session.exec(statement).all()
    return tournaments

@router.get("/{tournament_id}", response_model=TournamentWithStats)
async def get_tournament(
    tournament_id: str,
    session: Annotated[Session, Depends(get_session)]
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
        total_matches=total_matches
    )

@router.post("/", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
async def create_tournament(
    tournament_data: TournamentCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(require_admin)]
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
    current_user: Annotated[User, Depends(require_admin)]
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
    current_user: Annotated[User, Depends(require_admin)]
):
    """Delete tournament (Admin only)"""
    tournament = session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    session.delete(tournament)
    session.commit()
    return None