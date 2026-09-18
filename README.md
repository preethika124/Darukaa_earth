# Darukaa.Earth — Geospatial Carbon & Biodiversity Analytics

A high-performance geospatial data analytics and environmental monitoring dashboard built for carbon project developers, conservation ecologists, and sustainability auditors.

---

## 🌿 Overview

Darukaa.Earth unites satellite imagery, PostGIS spatial boundary mapping, interactive polygon drawing, and multi-parameter ecological analytics (Carbon Stock, Annual Sequestration, Shannon Biodiversity Indices, NDVI vegetation trends, and Canopy Coverage).

### Key Features

- **Geospatial Map Viewer**: Mapbox GL JS map explorer with drawing tools (`@mapbox/mapbox-gl-draw`), site polygon overlays, dynamic zooming to fit site boundaries, and automatic OpenStreetMap fallback when Mapbox tokens are not provided.
- **PostGIS Topological Validation**: Real-time validation of polygon closure, coordinates, and prevention of self-intersecting rings via Turf.js and Shapely.
- **Executive Analytics Dashboard**: High-level portfolio statistics, carbon trends, biodiversity scores, project status breakdowns, and recent project feeds.
- **Multi-Step Project & Multi-Site Creator**: Interactive 5-step wizard allowing operators to define a project charter, draw multiple site boundaries on the map, input environmental metrics, and commit all data atomically.
- **Interactive Highcharts Visualizers**:
  - Carbon Stock & Annual Sequestration Time-Series
  - Biodiversity Score & Species Richness Trends
  - Sentinel-2 NDVI & Forest Canopy Cover Changes
  - Carbon vs. Biodiversity Correlation Scatter Plot
- **JWT Authentication & Role Control**: User registration, login, profile retrieval, and secure bearer token authorization.
- **Interactive Swagger / OpenAPI Docs**: Interactive API documentation served live at `/api/docs`.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Mapbox GL JS, Highcharts, Turf.js, Lucide Icons
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0, GeoAlchemy2, Shapely, Pydantic v2
- **Spatial Database**: PostgreSQL 16 + PostGIS 3.4
- **CI/CD**: GitHub Actions CI

---

## 🚀 Quickstart

### 1. Launching the App

```bash
npm install
cd backend
# Use Python 3.11+; Python 3.14 requires current dependency versions.
python -m venv venv
# Windows: venv\\Scripts\\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload

# In a second terminal, from the repository root:
npm run dev
```

Open **http://localhost:3000** in your browser to access the dashboard.
Open **http://localhost:8000/api/docs** to explore the interactive OpenAPI documentation.

PostgreSQL with the PostGIS extension must be running and `DATABASE_URL` must be configured before starting FastAPI.
Create the database extension once (as a database administrator):

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2. Demo Credentials

- **Admin**: `admin@darukaa.earth` / `Admin@123`
- **Analyst**: `analyst@darukaa.earth` / `Analyst@123`
