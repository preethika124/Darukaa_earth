// Core TypeScript interfaces for Darukaa.Earth geospatial platform

export type ProjectType = 'Carbon' | 'Biodiversity' | 'Carbon + Biodiversity';
export type ProjectStatus = 'Planning' | 'Active' | 'Completed' | 'Archived';
export type SiteStatus = 'Active' | 'Monitoring' | 'Restoration' | 'Baseline';
export type EcosystemHealth = 'Pristine' | 'Regenerating' | 'Stable' | 'Vulnerable' | 'Degraded';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface Site {
  id: string;
  project_id: string;
  project_name?: string;
  name: string;
  description: string;
  geometry: GeoJSONGeometry;
  area: number; // in hectares (ha)
  location: string;
  status: SiteStatus;
  created_at: string;
  updated_at: string;
  carbon_stock: number; // in tCO2e
  carbon_sequestered: number; // in tCO2e/year
  biodiversity_score: number; // 0 to 100
  vegetation_index: number; // NDVI -1 to 1 (typically 0.4 - 0.9)
  forest_cover: number; // percentage 0 - 100%
  species_count: number;
  ecosystem_health: EcosystemHealth;
  monitoring_date: string;
  centroid?: [number, number]; // [lng, lat]
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

export interface Project {
  id: string;
  name: string;
  description: string;
  project_type: ProjectType;
  status: ProjectStatus;
  location: string;
  start_date: string;
  end_date: string;
  total_area: number; // sum of site areas in hectares
  created_by: string;
  created_at: string;
  updated_at: string;
  sites_count?: number;
  sites?: Site[];
  total_carbon_stock?: number;
  avg_biodiversity_score?: number;
}

export interface SiteAnalyticsRecord {
  id: string;
  site_id: string;
  monitoring_date: string;
  carbon_stock: number; // tCO2e
  carbon_sequestered: number; // tCO2e/yr
  carbon_change: number; // % or absolute change
  biodiversity_score: number; // 0 - 100
  species_count: number;
  vegetation_index: number; // NDVI
  forest_cover: number; // %
  ecosystem_health: EcosystemHealth;
  soil_organic_carbon?: number; // %
  water_retention_index?: number; // 0 - 100
  canopy_height_m?: number; // meters
}

export interface SiteAnalyticsDetail {
  site: Site;
  history: SiteAnalyticsRecord[];
  carbon_summary: {
    current_stock: number;
    annual_sequestration: number;
    baseline_stock: number;
    net_gain_percentage: number;
    projected_2030: number;
  };
  biodiversity_summary: {
    current_score: number;
    species_richness: number;
    baseline_score: number;
    iucn_threatened_species: number;
    pollinator_abundance_index: number;
  };
  vegetation_summary: {
    mean_ndvi: number;
    canopy_cover_percent: number;
    healthy_canopy_ha: number;
    change_rate_percent: number;
  };
}

export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  total_sites: number;
  total_area: number; // hectares
  total_carbon_stock: number; // tCO2e
  avg_biodiversity_score: number;
  carbon_trend_history: {
    date: string;
    total_carbon_stock: number;
    annual_sequestration: number;
  }[];
  biodiversity_trend_history: {
    date: string;
    avg_score: number;
    total_species: number;
  }[];
  project_type_distribution: {
    type: ProjectType;
    count: number;
    area: number;
  }[];
  status_distribution: {
    status: ProjectStatus;
    count: number;
  }[];
  recent_projects: Project[];
}

export interface PolygonValidationResult {
  valid: boolean;
  message?: string;
  area_ha?: number;
  area_sqkm?: number;
  centroid?: [number, number];
  bbox?: [number, number, number, number];
}
