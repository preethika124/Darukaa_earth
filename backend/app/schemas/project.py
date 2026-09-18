from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: str = "Carbon + Biodiversity"
    status: str = "Active"
    location: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_area: float = 0.0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_area: Optional[float] = None

class ProjectResponse(ProjectBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sites_count: Optional[int] = 0
    total_carbon_stock: Optional[float] = 0.0
    avg_biodiversity_score: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

ProjectOut = ProjectResponse
