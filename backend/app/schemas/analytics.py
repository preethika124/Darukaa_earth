from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from app.schemas.site import SiteResponse

class AnalyticsRecordResponse(BaseModel):
    id: str
    site_id: str
    monitoring_date: str
    carbon_stock: float
    carbon_sequestered: float
    carbon_change: float
    biodiversity_score: float
    species_count: int
    vegetation_index: float
    forest_cover: float
    ecosystem_health: str
    soil_organic_carbon: Optional[float] = None
    water_retention_index: Optional[float] = None
    canopy_height_m: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class CarbonSummary(BaseModel):
    current_stock: float
    annual_sequestration: float
    baseline_stock: float
    net_gain_percentage: float
    projected_2030: float

class BiodiversitySummary(BaseModel):
    current_score: float
    species_richness: int
    baseline_score: float
    iucn_threatened_species: int
    pollinator_abundance_index: int

class VegetationSummary(BaseModel):
    mean_ndvi: float
    canopy_cover_percent: float
    healthy_canopy_ha: float
    change_rate_percent: float

class SiteAnalyticsDetailResponse(BaseModel):
    site: SiteResponse
    history: List[AnalyticsRecordResponse]
    carbon_summary: CarbonSummary
    biodiversity_summary: BiodiversitySummary
    vegetation_summary: VegetationSummary

class DashboardSummaryResponse(BaseModel):
    total_projects: int
    active_projects: int
    total_sites: int
    total_area: float
    total_carbon_stock: float
    avg_biodiversity_score: float
    carbon_trend_history: List[Any]
    biodiversity_trend_history: List[Any]
    project_type_distribution: List[Any]
    status_distribution: List[Any]
    recent_projects: List[Any]

SiteAnalyticsRecordOut = AnalyticsRecordResponse
SiteAnalyticsDetailOut = SiteAnalyticsDetailResponse
DashboardSummaryOut = DashboardSummaryResponse
