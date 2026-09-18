from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.site import Site
from app.models.site_analytics import SiteAnalytics
from app.schemas.analytics import SiteAnalyticsDetailResponse
from app.api.v1.sites import serialize_site

router = APIRouter()

@router.get("/{site_id}/analytics", response_model=SiteAnalyticsDetailResponse)
def get_site_analytics(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    history = db.query(SiteAnalytics).filter(SiteAnalytics.site_id == site.id).order_by(SiteAnalytics.monitoring_date.asc()).all()
    baseline_stock = history[0].carbon_stock if history else site.carbon_stock * 0.8
    net_gain = round(((site.carbon_stock - baseline_stock) / baseline_stock) * 100, 1) if baseline_stock else 0.0

    return {
        "site": serialize_site(site, db),
        "history": history,
        "carbon_summary": {
            "current_stock": site.carbon_stock,
            "annual_sequestration": site.carbon_sequestered,
            "baseline_stock": baseline_stock,
            "net_gain_percentage": net_gain,
            "projected_2030": site.carbon_stock + site.carbon_sequestered * 6,
        },
        "biodiversity_summary": {
            "current_score": site.biodiversity_score,
            "species_richness": site.species_count,
            "baseline_score": history[0].biodiversity_score if history else 70,
            "iucn_threatened_species": max(3, int(site.species_count * 0.08)),
            "pollinator_abundance_index": 88,
        },
        "vegetation_summary": {
            "mean_ndvi": site.vegetation_index,
            "canopy_cover_percent": site.forest_cover,
            "healthy_canopy_ha": round(site.area * (site.forest_cover / 100), 1),
            "change_rate_percent": 4.8,
        },
    }
