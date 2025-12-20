from sqlmodel import Field, SQLModel, Relationship
from typing import Optional
from decimal import Decimal

class MatchPlayerStats(SQLModel, table=True):
    __tablename__ = "match_player_stats"
    
    match_id: str = Field(foreign_key="matches.id", primary_key=True)
    player_id: str = Field(foreign_key="players.id", primary_key=True)
    team_id: str = Field(foreign_key="teams.id", nullable=False, index=True)
    side: Optional[str] = Field(default=None)  # Blue or Red
    champion: Optional[str] = Field(default=None)
    result: Optional[bool] = Field(default=None)  # 0=loss, 1=win
    
    # Core stats
    kills: Optional[int] = Field(default=0)
    deaths: Optional[int] = Field(default=0)
    assists: Optional[int] = Field(default=0)
    doublekills: Optional[int] = Field(default=0)
    triplekills: Optional[int] = Field(default=0)
    quadrakills: Optional[int] = Field(default=0)
    pentakills: Optional[int] = Field(default=0)
    
    # First blood
    firstblood: Optional[bool] = Field(default=False)
    firstbloodkill: Optional[bool] = Field(default=False)
    firstbloodassist: Optional[bool] = Field(default=False)
    
    # Gold
    totalgold: Optional[int] = Field(default=0)
    earnedgold: Optional[int] = Field(default=0)
    earned_gpm: Optional[Decimal] = Field(default=0)
    goldspent: Optional[int] = Field(default=0)
    
    # Damage
    damagetochampions: Optional[int] = Field(default=0)
    dpm: Optional[Decimal] = Field(default=0)  # Damage per minute
    damageshare: Optional[Decimal] = Field(default=0)
    
    # Vision
    wardsplaced: Optional[int] = Field(default=0)
    wardskilled: Optional[int] = Field(default=0)
    controlwardsbought: Optional[int] = Field(default=0)
    visionscore: Optional[int] = Field(default=0)
    
    # CS (Creep Score)
    total_cs: Optional[int] = Field(default=0)
    minionkills: Optional[int] = Field(default=0)
    monsterkills: Optional[int] = Field(default=0)
    cspm: Optional[Decimal] = Field(default=0)  # CS per minute
    