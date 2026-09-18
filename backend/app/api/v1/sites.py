from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.site import Site
from app.models.project import Project
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse
from app.services.geospatial_service import GeospatialService

router = APIRouter()

def serialize_site(s: Site, db: Session) -> SiteResponse:
    geojson_geom = GeospatialService.geoalchemy_to_geojson(s.geometry)
    _, _, centroid, bounds = GeospatialService.validate_and_parse_polygon(geojson_geom)
    project = db.query(Project).filter(Project.id == s.project_id).first()

    return SiteResponse(
        id=s.id,
        project_id=s.project_id,
        name=s.name,
        description=s.description,
        geometry=geojson_geom,
        area=s.area,
        location=s.location,
        status=s.status,
        carbon_stock=s.carbon_stock,
        carbon_sequestered=s.carbon_sequestered,
        biodiversity_score=s.biodiversity_score,
        vegetation_index=s.vegetation_index,
        forest_cover=s.forest_cover,
        species_count=s.species_count,
        ecosystem_health=s.ecosystem_health,
        monitoring_date=s.monitoring_date,
        centroid=centroid,
        bbox=bounds,
        project_name=project.name if project else "Unknown Project",
        created_at=s.created_at,
        updated_at=s.updated_at,
    )

@router.get("", response_model=List[SiteResponse])
def get_sites(
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Site)
    if project_id and project_id != "All":
        query = query.filter(Site.project_id == project_id)
    if status and status != "All":
        query = query.filter(Site.status == status)
    if search:
        query = query.filter(Site.name.ilike(f"%{search}%") | Site.location.ilike(f"%{search}%"))

    sites = query.all()
    return [serialize_site(s, db) for s in sites]

@router.get("/{site_id}", response_model=SiteResponse)
def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return serialize_site(site, db)

@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(site_in: SiteCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == site_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Parent project not found")

    try:
        geom, calculated_area, _, _ = GeospatialService.validate_and_parse_polygon(site_in.geometry.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    geo_shape = GeospatialService.shapely_to_geoalchemy(geom)

    site = Site(
        project_id=site_in.project_id,
        name=site_in.name,
        description=site_in.description,
        geometry=geo_shape,
        area=site_in.area or calculated_area,
        location=site_in.location,
        status=site_in.status,
        carbon_stock=site_in.carbon_stock,
        carbon_sequestered=site_in.carbon_sequestered,
        biodiversity_score=site_in.biodiversity_score,
        vegetation_index=site_in.vegetation_index,
        forest_cover=site_in.forest_cover,
        species_count=site_in.species_count,
        ecosystem_health=site_in.ecosystem_health,
        monitoring_date=site_in.monitoring_date,
    )
    db.add(site)

    # Recalculate parent project area
    project.total_area += site.area
    db.commit()
    db.refresh(site)

    return serialize_site(site, db)

@router.delete("/{site_id}")
def delete_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    project = db.query(Project).filter(Project.id == site.project_id).first()
    if project:
        project.total_area = max(0.0, project.total_area - site.area)

    db.delete(site)
    db.commit()
    return {"success": True, "message": "Site deleted"}
