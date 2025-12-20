from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid

class Tournament(SQLModel, table=True):
    __tablename__ = "tournaments"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    league: str = Field(nullable=False, index=True)  # LCK, LPL, LEC, LCS, etc.
    year: int = Field(nullable=False, index=True)
    split: Optional[str] = Field(default=None)  # Spring, Summer, MSI, Worlds
    playoffs: bool = Field(default=False)  # 0=regular season, 1=playoffs
    
    # Relationships
    matches: List["Match"] = Relationship(back_populates="tournament")
    teams: List["Team"] = Relationship(
        back_populates="tournaments",
        link_model="TeamTournament"
    )