from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.teams import Team
from app.schemas.teams import TeamCreate, TeamUpdate, TeamResponse
from app.api.deps import require_admin

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user=Depends(require_admin),
):

    statement = select(Team).where(Team.team_name == team_data.team_name)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already exists")

    team = Team(**team_data.model_dump())
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.get("/", response_model=List[TeamResponse])
async def read_teams(
    skip: int = 0,
    limit: int = 100,
    session: Annotated[Session, Depends(get_session)] = None,
):
    statement = select(Team).offset(skip).limit(limit)
    teams = session.exec(statement).all()
    return teams


@router.get("/{team_id}", response_model=TeamResponse)
async def read_team(
    team_id: int,
    session: Annotated[Session, Depends(get_session)],
):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    team_data: TeamUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user=Depends(require_admin),
):
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
    team_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user=Depends(require_admin),
):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    session.delete(team)
    session.commit()
    return None
