from pydantic import BaseModel
from typing import Optional, List

class PlayerBase(BaseModel):
    player_name: str
    position: Optional[str] = None
    external_id: Optional[str] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    player_name: Optional[str] = None
    position: Optional[str] = None
    external_id: Optional[str] = None

class PlayerResponse(PlayerBase):
    id: str
    team_names: Optional[List[str]] = None  # Teams the player has played for
    
    class Config:
        from_attributes = True

class PlayerWithStats(PlayerResponse):
    """Player with aggregated career statistics"""
    total_games: int = 0
    total_wins: int = 0
    total_kills: int = 0
    total_deaths: int = 0
    total_assists: int = 0
    avg_kda: float = 0.0
    win_rate: float = 0.0
