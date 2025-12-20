from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime, timezone

class Team(SQLModel, table=True):
    __tablename__ = "teams"

    id: Optional[int] = Field(default=None, primary_key=True)
    team_name: str = Field(index=True, unique=True, max_length=100)
    region: Optional[str] = Field(default=None, max_length=50)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
