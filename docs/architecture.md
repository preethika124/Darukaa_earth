# Darukaa.Earth — System Architecture

## 1. Executive Overview

Darukaa.Earth is a geospatial data analytics platform engineered for carbon credit accounting, ecological corridor monitoring, and biodiversity measurement. It bridges satellite telemetry, PostGIS spatial data modeling, and environmental time-series visualization.

```
+-------------------------------------------------------------------------------+
|                             Darukaa.Earth Client UI                           |
|  - React 19 + TypeScript + Tailwind CSS                                       |
|  - Mapbox GL JS (with OpenStreetMap fallback)                                 |
|  - Highcharts Environmental Visualizer (Carbon, Bio, NDVI, Correlation)       |
|  - Turf.js spatial analysis & client polygon validation                      |
+-------------------------------------------------------------------------------+
                                      |  HTTPS / REST / JSON
                                      v
+-------------------------------------------------------------------------------+
|                       API Gateway & Application Server                         |
|  - FastAPI REST Controllers with OpenAPI 3.0                                  |
|  - JWT Stateless Bearer Authentication & PBKDF2 / Bcrypt Password Hashing     |
|  - PostGIS Polygon Validation (Topological Kinks & WGS84 Centroid)            |
+-------------------------------------------------------------------------------+
                                      |  SQL / GeoAlchemy2 / WKB
                                      v
+-------------------------------------------------------------------------------+
|                       PostgreSQL 16 + PostGIS 3.4 Spatial DB                   |
|  - users, projects, sites (GEOMETRY(Polygon, 4326)), site_analytics           |
|  - Spatial GIST Index on geometry for sub-millisecond bounding box queries    |
+-------------------------------------------------------------------------------+
```

## 2. Geospatial Architecture

1. **Coordinate Reference System:** EPSG:4326 (WGS84 lon/lat).
2. **PostGIS Storage:** Sites are stored in a dedicated `GEOMETRY(Polygon, 4326)` column with automated GIST indexing.
3. **Topological Invariants:**
   - Polygons must be closed (first coordinate equals last coordinate).
   - Polygons must have at least 4 coordinate pairs.
   - Self-intersecting rings ("bowties") are rejected at both the client boundary (Turf.js) and the server API (Shapely `is_valid` / PostGIS `ST_IsValid`).
4. **Hectare Area Calculation:** Computed using spherical geodesics via `ST_Area(geography)` in PostGIS or Turf geodesic polygons in the frontend.

## 3. Environmental Metrics

- **Carbon Stock ($tCO_2e$):** Total accumulated terrestrial biomass and soil organic carbon (SOM).
- **Annual Sequestration ($tCO_2e/yr$):** Annual net increment from vegetation growth.
- **Biodiversity Score (0-100):** Weighted composite index derived from acoustic bio-loggers, eDNA soil sweeps, and IUCN red-list species richness.
- **Vegetation Index (NDVI):** Sentinel-2 multispectral surface reflectance ($0.0 - 1.0$).
