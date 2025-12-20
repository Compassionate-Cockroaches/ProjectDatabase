from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, users, teams, players, tournaments, matches, analytics
from app.core.config import settings
from app.core.database import create_db_and_tables

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables on startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(teams.router, prefix="/api")
app.include_router(players.router, prefix="/api")
app.include_router(tournaments.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


# Root endpoints
@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}