from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime, timezone

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    email: str = Field(unique=True, index=True, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=100)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default="public", max_length=20)  # admin, analyst, public
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))