from pydantic import BaseModel
from typing import Optional

class TournamentBase(BaseModel):
    league: str
    year: int
    split: Optional[str] = None
    playoffs: bool = False

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(BaseModel):
    league: Optional[str] = None
    year: Optional[int] = None
    split: Optional[str] = None
    playoffs: Optional[bool] = None

class TournamentResponse(TournamentBase):
    id: str
    
    class Config:
        from_attributes = True

class TournamentWithStats(TournamentResponse):
    """Tournament with additional statistics"""
    total_teams: int = 0
    total_matches: int = 0