from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid

class Team(SQLModel, table=True):
    __tablename__ = "teams"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    external_id: Optional[str] = Field(default=None, unique=True, index=True)
    team_name: str = Field(nullable=False, index=True)

    # Relationships
    players: List["Player"] = Relationship(back_populates="team")
    tournaments: List["Tournament"] = Relationship(
        back_populates="teams",
        link_model="TeamTournament"
    )
    match_stats: List["MatchPlayerStats"] = Relationship(back_populates="team")