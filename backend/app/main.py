from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.init_db import init_db
from app.api.v1 import auth, projects, sites, analytics, dashboard

# Create database tables and seed initial data if needed
try:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    init_db(db)
    db.close()
except Exception as e:
    print(f"Notice: DB startup initialization note ({e})")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production Geospatial Analytics API for Darukaa.Earth Carbon and Biodiversity monitoring.",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(sites.router, prefix="/api/sites", tags=["Geospatial Sites"])
app.include_router(analytics.router, prefix="/api/sites", tags=["Analytics & Timeseries"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Executive Dashboard"])

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Darukaa.Earth Geospatial API",
        "version": settings.VERSION,
    }
