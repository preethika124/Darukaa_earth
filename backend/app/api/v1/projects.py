from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.project import Project
from app.models.site import Site
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.site import SiteResponse
from app.services.geospatial_service import GeospatialService

router = APIRouter()

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Project)
    if status and status != "All":
        query = query.filter(Project.status == status)
    if type and type != "All":
        query = query.filter(Project.project_type == type)
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%") | Project.location.ilike(f"%{search}%"))

    projects = query.all()
    results = []
    for p in projects:
        sites = db.query(Site).filter(Site.project_id == p.id).all()
        total_carbon = sum(s.carbon_stock for s in sites)
        avg_bio = int(sum(s.biodiversity_score for s in sites) / len(sites)) if sites else 0
        total_area = sum(s.area for s in sites) or p.total_area

        results.append(
            ProjectResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                project_type=p.project_type,
                status=p.status,
                location=p.location,
                start_date=p.start_date,
                end_date=p.end_date,
                total_area=total_area,
                created_by=p.created_by,
                created_at=p.created_at,
                updated_at=p.updated_at,
                sites_count=len(sites),
                total_carbon_stock=total_carbon,
                avg_biodiversity_score=avg_bio,
            )
        )
    return results

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sites = db.query(Site).filter(Site.project_id == project.id).all()
    total_carbon = sum(s.carbon_stock for s in sites)
    avg_bio = int(sum(s.biodiversity_score for s in sites) / len(sites)) if sites else 0

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        status=project.status,
        location=project.location,
        start_date=project.start_date,
        end_date=project.end_date,
        total_area=project.total_area,
        created_by=project.created_by,
        created_at=project.created_at,
        updated_at=project.updated_at,
        sites_count=len(sites),
        total_carbon_stock=total_carbon,
        avg_biodiversity_score=avg_bio,
    )

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**project_in.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse.from_orm(project)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, project_in: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(project, field, val)

    db.commit()
    db.refresh(project)
    return ProjectResponse.from_orm(project)

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"success": True, "message": "Project and associated sites deleted"}
