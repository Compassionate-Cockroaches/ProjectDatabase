from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class MatchPlayerStatsBase(BaseModel):
    player_id: str
    team_id: str
    side: Optional[str] = None
    champion: Optional[str] = None
    result: Optional[bool] = None
    
    # Core stats
    kills: Optional[int] = 0
    deaths: Optional[int] = 0
    assists: Optional[int] = 0
    doublekills: Optional[int] = 0
    triplekills: Optional[int] = 0
    quadrakills: Optional[int] = 0
    pentakills: Optional[int] = 0
    
    # First blood
    firstblood: Optional[bool] = False
    firstbloodkill: Optional[bool] = False
    firstbloodassist: Optional[bool] = False
    
    # Gold
    totalgold: Optional[int] = 0
    earnedgold: Optional[int] = 0
    earned_gpm: Optional[Decimal] = 0
    goldspent: Optional[int] = 0
    
    # Damage
    damagetochampions: Optional[int] = 0
    dpm: Optional[Decimal] = 0
    damageshare: Optional[Decimal] = 0
    
    # Vision
    wardsplaced: Optional[int] = 0
    wardskilled: Optional[int] = 0
    controlwardsbought: Optional[int] = 0
    visionscore: Optional[int] = 0
    
    # CS
    total_cs: Optional[int] = 0
    minionkills: Optional[int] = 0
    monsterkills: Optional[int] = 0
    cspm: Optional[Decimal] = 0

class MatchPlayerStatsCreate(MatchPlayerStatsBase):
    match_id: str

class MatchPlayerStatsResponse(MatchPlayerStatsBase):
    match_id: str
    player_name: Optional[str] = None  # Joined from player table
    team_name: Optional[str] = None  # Joined from team table
    
    class Config:
        from_attributes = True