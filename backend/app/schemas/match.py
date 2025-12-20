from pydantic import BaseModel
from typing import Optional
from datetime import date

class MatchBase(BaseModel):
    tournament_id: str
    game_number: Optional[int] = None
    game_length: Optional[int] = None
    patch: Optional[str] = None
    match_date: Optional[date] = None
    data_completeness: Optional[str] = None
    url: Optional[str] = None
    external_id: Optional[str] = None

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    tournament_id: Optional[str] = None
    game_number: Optional[int] = None
    game_length: Optional[int] = None
    patch: Optional[str] = None
    match_date: Optional[date] = None
    data_completeness: Optional[str] = None
    url: Optional[str] = None
    external_id: Optional[str] = None

class MatchResponse(MatchBase):
    id: str
    
    class Config:
        from_attributes = True