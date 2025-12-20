from sqlmodel import Field, SQLModel

class TeamTournament(SQLModel, table=True):
    __tablename__ = "team_tournaments"
    
    team_id: str = Field(foreign_key="teams.id", primary_key=True)
    tournament_id: str = Field(foreign_key="tournaments.id", primary_key=True)