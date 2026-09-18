# Database Architecture & PostGIS Schema

PostgreSQL 16 with the PostGIS 3.4 extension is required. SQLite is not supported.

## 1. Relational Entities

The Darukaa.Earth schema is designed around four relational tables:

1. **`users`**:
   - `id`: VARCHAR (Primary Key)
   - `name`: VARCHAR(255)
   - `email`: VARCHAR(255) UNIQUE
   - `password_hash`: VARCHAR(255)
   - `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

2. **`projects`**:
   - `id`: VARCHAR (Primary Key)
   - `name`: VARCHAR(255)
   - `description`: TEXT
   - `project_type`: VARCHAR(50) — 'Carbon', 'Biodiversity', 'Carbon + Biodiversity'
   - `status`: VARCHAR(50) — 'Planning', 'Active', 'Completed', 'Archived'
   - `location`: VARCHAR(255)
   - `start_date`, `end_date`: DATE / VARCHAR
   - `total_area`: DOUBLE PRECISION (hectares)
   - `created_by`: Foreign Key to `users.id`

3. **`sites`** (Spatial Entity):
   - `id`: VARCHAR (Primary Key)
   - `project_id`: Foreign Key to `projects.id` ON DELETE CASCADE
   - `name`: VARCHAR(255)
   - `description`: TEXT
   - `geometry`: `geometry(Polygon, 4326)` (PostGIS spatial geometry)
   - `area`: DOUBLE PRECISION (hectares)
   - `location`: VARCHAR(255)
   - `status`: VARCHAR(50) — 'Active', 'Monitoring', 'Restoration'
   - `carbon_stock`: DOUBLE PRECISION (metric tons CO2e)
   - `carbon_sequestered`: DOUBLE PRECISION (annual tCO2e)
   - `biodiversity_score`: INTEGER (0 to 100)
   - `vegetation_index`: DOUBLE PRECISION (NDVI 0.0 to 1.0)
   - `forest_cover`: DOUBLE PRECISION (percent canopy cover)
   - `species_count`: INTEGER
   - `ecosystem_health`: VARCHAR(50)
   - `monitoring_date`: DATE

4. **`site_analytics`** (Historical Census):
   - `id`: VARCHAR (Primary Key)
   - `site_id`: Foreign Key to `sites.id` ON DELETE CASCADE
   - `monitoring_date`: VARCHAR(50) (YYYY-MM)
   - `carbon_stock`: DOUBLE PRECISION
   - `carbon_sequestered`: DOUBLE PRECISION
   - `carbon_change`: DOUBLE PRECISION (%)
   - `biodiversity_score`: INTEGER
   - `species_count`: INTEGER
   - `vegetation_index`: DOUBLE PRECISION
   - `forest_cover`: DOUBLE PRECISION
   - `ecosystem_health`: VARCHAR(50)

## 2. Spatial Indexing

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE INDEX idx_sites_geometry ON sites USING GIST (geometry);
CREATE INDEX idx_sites_project_id ON sites (project_id);
CREATE INDEX idx_analytics_site_date ON site_analytics (site_id, monitoring_date);
```
