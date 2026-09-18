import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    from backend.app.core.config import settings
except ImportError:
    from app.core.config import settings

db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
if not db_url.startswith("postgresql"):
    raise RuntimeError("DATABASE_URL must use PostgreSQL/PostGIS (postgresql:// or postgresql+psycopg2://).")

# Deliberately no SQLite fallback: this application requires PostgreSQL + PostGIS.
engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
