from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.api.deps import get_current_active_user, require_admin
from app.core.database import get_session
from app.models.team import Team
from app.models.team_tournament import TeamTournament
from app.models.tournament import Tournament
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
    
    # Enrich teams with tournament information
    enriched_teams = []
    for team in teams:
        # Get tournaments for this team from team_tournaments table
        tournament_statement = (
            select(Tournament.league, Tournament.year, Tournament.split)
            .join(TeamTournament, TeamTournament.tournament_id == Tournament.id)
            .where(TeamTournament.team_id == team.id)
            .distinct()
        )
        tournament_results = session.exec(tournament_statement).all()
        
        # Format tournament names
        tournament_names = [
            f"{league} {year} {split or ''}".strip()
            for league, year, split in tournament_results
        ]
        
        team_dict = team.model_dump()
        team_dict["tournament_names"] = tournament_names
        enriched_teams.append(TeamResponse(**team_dict))
    
    return enriched_teams


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
    # Admin-created team → external_id is ALWAYS NULL
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
