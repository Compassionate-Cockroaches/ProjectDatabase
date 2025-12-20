from pydantic import BaseModel
from typing import Optional

class TeamBase(BaseModel):
    team_name: str
    region: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    team_name: Optional[str] = None
    external_id: Optional[str] = None

class TeamResponse(TeamBase):
    id: str

    class Config:
        from_attributes = True
