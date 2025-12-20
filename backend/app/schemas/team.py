from pydantic import BaseModel
from typing import Optional

class TeamBase(BaseModel):
    team_name: str
    external_id: Optional[str] = None

class TeamCreate(TeamBase):
    team_name: str

class TeamUpdate(BaseModel):
    team_name: Optional[str] = None
    external_id: Optional[str] = None

class TeamResponse(TeamBase):
    id: str
    
    class Config:
        from_attributes = True