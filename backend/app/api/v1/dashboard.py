from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.project import Project
from app.models.site import Site
from app.schemas.analytics import DashboardSummaryResponse

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    sites = db.query(Site).all()

    total_projects = len(projects)
    active_projects = len([p for p in projects if p.status == "Active"])
    total_sites = len(sites)
    total_area = round(sum(s.area for s in sites), 1)
    total_carbon = round(sum(s.carbon_stock for s in sites), 1)
    avg_bio = int(sum(s.biodiversity_score for s in sites) / total_sites) if total_sites else 0

    dates = ["2023-01", "2023-04", "2023-07", "2023-10", "2024-01", "2024-04", "2024-07", "2024-10"]
    carbon_trend_history = [
        {
            "date": d,
            "total_carbon_stock": int(total_carbon * (0.78 + (i / len(dates)) * 0.22)),
            "annual_sequestration": int(total_carbon * 0.045),
        }
        for i, d in enumerate(dates)
    ]

    biodiversity_trend_history = [
        {
            "date": d,
            "avg_score": int(avg_bio * (0.85 + (i / len(dates)) * 0.15)),
            "total_species": int(920 * (0.85 + (i / len(dates)) * 0.15)),
        }
        for i, d in enumerate(dates)
    ]

    type_counts = {}
    for p in projects:
        if p.project_type not in type_counts:
            type_counts[p.project_type] = {"count": 0, "area": 0.0}
        type_counts[p.project_type]["count"] += 1
        type_counts[p.project_type]["area"] += p.total_area

    project_type_dist = [
        {"type": k, "count": v["count"], "area": round(v["area"], 1)}
        for k, v in type_counts.items()
    ]

    status_dist = [
        {"status": "Active", "count": active_projects},
        {"status": "Planning", "count": len([p for p in projects if p.status == "Planning"])},
        {"status": "Completed", "count": len([p for p in projects if p.status == "Completed"])},
        {"status": "Archived", "count": len([p for p in projects if p.status == "Archived"])},
    ]

    recent_projects = [
        {
            "id": p.id,
            "name": p.name,
            "project_type": p.project_type,
            "status": p.status,
            "location": p.location,
            "total_area": p.total_area,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in projects[:5]
    ]

    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "total_sites": total_sites,
        "total_area": total_area,
        "total_carbon_stock": total_carbon,
        "avg_biodiversity_score": avg_bio,
        "carbon_trend_history": carbon_trend_history,
        "biodiversity_trend_history": biodiversity_trend_history,
        "project_type_distribution": project_type_dist,
        "status_distribution": status_dist,
        "recent_projects": recent_projects,
    }
