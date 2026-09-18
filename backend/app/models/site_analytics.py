from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.db.session import Base

class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(String, primary_key=True, default=lambda: f"an_{uuid.uuid4().hex[:10]}")
    site_id = Column(String, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    monitoring_date = Column(String(50), nullable=False, index=True)
    
    carbon_stock = Column(Float, nullable=False)
    carbon_sequestered = Column(Float, nullable=False)
    carbon_change = Column(Float, default=0.0)
    biodiversity_score = Column(Integer, nullable=False)
    species_count = Column(Integer, nullable=False)
    vegetation_index = Column(Float, nullable=False)
    forest_cover = Column(Float, nullable=False)
    ecosystem_health = Column(String(50), default="Stable")
    soil_organic_carbon = Column(Float, default=0.0, nullable=True)
    water_retention_index = Column(Float, default=0.0, nullable=True)
    canopy_height_m = Column(Float, default=0.0, nullable=True)

    site = relationship("Site", back_populates="analytics")

