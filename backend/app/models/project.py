from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: f"proj_{uuid.uuid4().hex[:10]}")
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String(50), nullable=False, default="Carbon + Biodiversity")
    status = Column(String(50), nullable=False, default="Active", index=True)
    location = Column(String(255), nullable=False)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    total_area = Column(Float, default=0.0, nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")
