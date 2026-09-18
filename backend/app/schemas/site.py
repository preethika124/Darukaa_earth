from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any, Tuple
from datetime import datetime

class GeoJSONPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class SiteBase(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    area: float
    location: str
    status: str = "Active"
    carbon_stock: float = 0.0
    carbon_sequestered: float = 0.0
    biodiversity_score: float = 0.0
    vegetation_index: float = 0.0
    forest_cover: float = 0.0
    species_count: int = 0
    ecosystem_health: str = "Stable"
    monitoring_date: Optional[str] = None

class SiteCreate(SiteBase):
    geometry: GeoJSONPolygon

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    geometry: Optional[GeoJSONPolygon] = None
    area: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = None
    carbon_stock: Optional[float] = None
    carbon_sequestered: Optional[float] = None
    biodiversity_score: Optional[float] = None
    vegetation_index: Optional[float] = None
    forest_cover: Optional[float] = None
    species_count: Optional[int] = None
    ecosystem_health: Optional[str] = None

class SiteResponse(SiteBase):
    id: str
    geometry: GeoJSONPolygon
    centroid: Optional[Tuple[float, float]] = None
    bbox: Optional[Tuple[float, float, float, float]] = None
    project_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

SiteOut = SiteResponse
