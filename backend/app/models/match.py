from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
from datetime import date
import uuid

class Match(SQLModel, table=True):
    __tablename__ = "matches"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    external_id: Optional[str] = Field(default=None, unique=True, index=True)
    tournament_id: str = Field(foreign_key="tournaments.id", nullable=False, index=True)
    game_number: Optional[int] = Field(default=None)
    game_length: Optional[int] = Field(default=None)  # Duration in seconds
    patch: Optional[str] = Field(default=None)  # Game version
    match_date: Optional[date] = Field(default=None, index=True)
    data_completeness: Optional[str] = Field(default=None)
    url: Optional[str] = Field(default=None)
    
    # Relationships
    tournament: "Tournament" = Relationship(back_populates="matches")
    player_stats: List["MatchPlayerStats"] = Relationship(back_populates="match")