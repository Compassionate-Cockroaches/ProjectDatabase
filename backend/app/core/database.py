from sqlmodel import Session, SQLModel, create_engine
from typing import Generator
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True
)

# Create all tables
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Dependency to get database session
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session