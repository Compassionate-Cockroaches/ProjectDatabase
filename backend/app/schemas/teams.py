from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TeamBase(BaseModel):
    team_name: str
    region: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    team_name: Optional[str] = None
    region: Optional[str] = None

class TeamResponse(TeamBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
