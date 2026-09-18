from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime, timezone
import uuid
from app.db.session import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(String, primary_key=True, default=lambda: f"site_{uuid.uuid4().hex[:10]}")
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Native WGS84 PostGIS polygon.  PostgreSQL/PostGIS is a hard requirement.
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=False)
    
    area = Column(Float, nullable=False, default=0.0)
    location = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="Active", index=True)
    
    carbon_stock = Column(Float, default=0.0, nullable=False)
    carbon_sequestered = Column(Float, default=0.0, nullable=False)
    biodiversity_score = Column(Float, default=0.0, nullable=False)
    vegetation_index = Column(Float, default=0.0, nullable=False)
    forest_cover = Column(Float, default=0.0, nullable=False)
    species_count = Column(Integer, default=0, nullable=False)
    ecosystem_health = Column(String(50), default="Stable", nullable=False)
    monitoring_date = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="sites")
    analytics = relationship("SiteAnalytics", back_populates="site", cascade="all, delete-orphan")
