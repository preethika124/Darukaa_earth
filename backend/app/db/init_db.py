from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.db.session import Base, engine
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.site_analytics import SiteAnalytics
from app.services.geospatial_service import GeospatialService

def init_db(db: Session):
    Base.metadata.create_all(bind=engine)

    # Check if database is already seeded
    existing_user = db.query(User).filter(User.email == "admin@darukaa.earth").first()
    if existing_user:
        return

    print("Seeding Darukaa.Earth database with initial environmental projects...")

    # 1. Admin User
    admin = User(
        name="Chief Climate Officer",
        email="admin@darukaa.earth",
        password_hash=get_password_hash("Admin@123"),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    # 2. Projects & Sites
    # Project 1: Western Ghats Rainforest & Wildlife Corridor
    p1 = Project(
        name="Western Ghats Rainforest & Wildlife Corridor",
        description="Montane evergreen rainforest restoration and native species conservation along the UNESCO biodiversity hotspot.",
        project_type="Carbon + Biodiversity",
        status="Active",
        location="Agumbe & Kudremukh, Karnataka, India",
        start_date="2023-01-15",
        end_date="2035-12-31",
        total_area=1485.6,
        created_by=admin.id,
    )
    db.add(p1)
    db.commit()
    db.refresh(p1)

    # Site 1.1: Agumbe Rainforest Sanctuary
    geom_1_1 = {
        "type": "Polygon",
        "coordinates": [
            [
                [75.085, 13.502],
                [75.115, 13.528],
                [75.142, 13.505],
                [75.120, 13.475],
                [75.085, 13.502]
            ]
        ]
    }
    s1_1 = Site(
        project_id=p1.id,
        name="Agumbe High-Canopy Evergreen Zone",
        description="Primary tropical evergreen rainforest with King Cobra and lion-tailed macaque habitat.",
        geometry=GeospatialService.shapely_to_geoalchemy(GeospatialService.validate_and_parse_polygon(geom_1_1)[0]),
        area=845.2,
        location="Shimoga District, Karnataka",
        status="Active",
        carbon_stock=124500.0,
        carbon_sequestered=5420.0,
        biodiversity_score=94.5,
        vegetation_index=0.84,
        forest_cover=91.5,
        species_count=184,
        ecosystem_health="Pristine",
        monitoring_date="2025-01",
    )
    db.add(s1_1)

    # Site 1.2: Kudremukh Buffer Restoration
    geom_1_2 = {
        "type": "Polygon",
        "coordinates": [
            [
                [75.220, 13.210],
                [75.265, 13.245],
                [75.285, 13.205],
                [75.240, 13.175],
                [75.220, 13.210]
            ]
        ]
    }
    s1_2 = Site(
        project_id=p1.id,
        name="Kudremukh Grassland-Shola Buffer",
        description="Shola-grassland mosaic ecosystem recovering from historical mining disturbance.",
        geometry=GeospatialService.shapely_to_geoalchemy(GeospatialService.validate_and_parse_polygon(geom_1_2)[0]),
        area=640.4,
        location="Chikkamagaluru District, Karnataka",
        status="Monitoring",
        carbon_stock=74200.0,
        carbon_sequestered=3850.0,
        biodiversity_score=88.0,
        vegetation_index=0.76,
        forest_cover=74.0,
        species_count=138,
        ecosystem_health="Regenerating",
        monitoring_date="2025-01",
    )
    db.add(s1_2)
    db.commit()
    db.refresh(s1_1)
    db.refresh(s1_2)

    # Project 2: Sundarbans Blue Carbon & Mangrove Bio-Shield
    p2 = Project(
        name="Sundarbans Blue Carbon & Mangrove Bio-Shield",
        description="Tidal mangrove wetland regeneration enhancing coastal climate resilience and Royal Bengal Tiger estuarine territory.",
        project_type="Carbon",
        status="Active",
        location="South 24 Parganas, West Bengal, India",
        start_date="2023-06-01",
        end_date="2038-05-30",
        total_area=2140.0,
        created_by=admin.id,
    )
    db.add(p2)
    db.commit()
    db.refresh(p2)

    geom_2_1 = {
        "type": "Polygon",
        "coordinates": [
            [
                [88.750, 21.820],
                [88.820, 21.860],
                [88.860, 21.800],
                [88.790, 21.760],
                [88.750, 21.820]
            ]
        ]
    }
    s2_1 = Site(
        project_id=p2.id,
        name="Gosaba Island Mudflat Restoration",
        description="Rhizophora and Avicennia mangrove afforestation with high sediment organic carbon sequestration.",
        geometry=GeospatialService.shapely_to_geoalchemy(GeospatialService.validate_and_parse_polygon(geom_2_1)[0]),
        area=2140.0,
        location="Gosaba Block, Sundarbans",
        status="Active",
        carbon_stock=318400.0,
        carbon_sequestered=14200.0,
        biodiversity_score=86.5,
        vegetation_index=0.78,
        forest_cover=82.0,
        species_count=142,
        ecosystem_health="Pristine",
        monitoring_date="2025-01",
    )
    db.add(s2_1)
    db.commit()
    db.refresh(s2_1)

    # Project 3: Araku Valley Regenerative Agroforestry
    p3 = Project(
        name="Araku Valley Regenerative Agroforestry",
        description="Community-led tribal coffee agroforestry cultivating high-shade canopy cover and endemic bird corridors.",
        project_type="Biodiversity",
        status="Planning",
        location="Visakhapatnam District, Andhra Pradesh, India",
        start_date="2024-02-01",
        end_date="2034-01-31",
        total_area=950.0,
        created_by=admin.id,
    )
    db.add(p3)
    db.commit()
    db.refresh(p3)

    geom_3_1 = {
        "type": "Polygon",
        "coordinates": [
            [
                [82.840, 18.280],
                [82.890, 18.310],
                [82.930, 18.270],
                [82.870, 18.240],
                [82.840, 18.280]
            ]
        ]
    }
    s3_1 = Site(
        project_id=p3.id,
        name="Dumbriguda Shade-Canopy Micro-Catchment",
        description="Multi-strata canopy planting combining native silver oak, jackfruit, and endemic understory coffee.",
        geometry=GeospatialService.shapely_to_geoalchemy(GeospatialService.validate_and_parse_polygon(geom_3_1)[0]),
        area=950.0,
        location="Dumbriguda, Araku Valley",
        status="Restoration",
        carbon_stock=88200.0,
        carbon_sequestered=4600.0,
        biodiversity_score=89.2,
        vegetation_index=0.72,
        forest_cover=68.5,
        species_count=112,
        ecosystem_health="Regenerating",
        monitoring_date="2025-01",
    )
    db.add(s3_1)
    db.commit()
    db.refresh(s3_1)

    # 3. Seed historical time-series analytics for all sites
    all_sites = [s1_1, s1_2, s2_1, s3_1]
    quarters = ["2024-01", "2024-04", "2024-07", "2024-10", "2025-01"]
    factors = [0.82, 0.86, 0.91, 0.96, 1.0]

    for site in all_sites:
        for q, factor in zip(quarters, factors):
            rec = SiteAnalytics(
                site_id=site.id,
                monitoring_date=q,
                carbon_stock=round(site.carbon_stock * factor, 1),
                carbon_sequestered=round(site.carbon_sequestered * factor, 1),
                carbon_change=round((factor - 0.82) * 100, 1),
                biodiversity_score=round(site.biodiversity_score * (0.88 + 0.12 * factor), 1),
                species_count=int(site.species_count * (0.85 + 0.15 * factor)),
                vegetation_index=round(site.vegetation_index * (0.90 + 0.10 * factor), 2),
                forest_cover=round(site.forest_cover * (0.92 + 0.08 * factor), 1),
                ecosystem_health=site.ecosystem_health,
                soil_organic_carbon=round(3.4 * factor, 2),
                water_retention_index=round(78.0 * factor, 1),
                canopy_height_m=round(21.0 * factor, 1),
            )
            db.add(rec)

    db.commit()
    print("Seeded Darukaa.Earth database with 3 projects, 4 geospatial sites, and time-series analytics.")
