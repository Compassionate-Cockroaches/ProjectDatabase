from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid

class Team(SQLModel, table=True):
    __tablename__ = "teams"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    external_id: Optional[str] = Field(default=None, unique=True, index=True)
    team_name: str = Field(nullable=False, index=True)
