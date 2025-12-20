from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
import uuid

class Player(SQLModel, table=True):
    __tablename__ = "players"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    external_id: Optional[str] = Field(default=None, unique=True, index=True)
    player_name: str = Field(nullable=False, index=True)
    position: Optional[str] = Field(default=None)  # Top, Jungle, Mid, Bot, Support
    