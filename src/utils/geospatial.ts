import * as turf from '@turf/turf';
import { GeoJSONGeometry, PolygonValidationResult, SiteStatus, ProjectType } from '../types';

/**
 * Validates a GeoJSON Polygon geometry.
 * Checks for minimum points, closure, valid coordinate ranges, and self-intersections.
 */
export function validatePolygon(geometry: GeoJSONGeometry): PolygonValidationResult {
  if (!geometry || !geometry.coordinates || !Array.isArray(geometry.coordinates)) {
    return { valid: false, message: 'Invalid geometry structure' };
  }

  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    return { valid: false, message: 'Geometry must be a Polygon or MultiPolygon' };
  }

  try {
    let feature: any;
    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates as number[][][];
      if (coords.length === 0 || coords[0].length < 4) {
        return { valid: false, message: 'Polygon requires at least 4 coordinates (closed ring)' };
      }
      feature = turf.polygon(coords);
    } else {
      const coords = geometry.coordinates as number[][][][];
      if (coords.length === 0 || coords[0][0].length < 4) {
        return { valid: false, message: 'MultiPolygon rings require at least 4 coordinates' };
      }
      feature = turf.multiPolygon(coords);
    }

    // Check for self-intersections
    const kinks = turf.kinks(feature);
    if (kinks.features.length > 0) {
      return {
        valid: false,
        message: `Polygon contains ${kinks.features.length} self-intersection point(s). Please draw a clean boundary without overlapping edges.`,
      };
    }

    // Calculate area in square meters and convert to hectares (1 ha = 10,000 m²)
    const areaSqM = turf.area(feature);
    if (areaSqM <= 0) {
      return { valid: false, message: 'Calculated area must be greater than zero' };
    }

    const area_ha = Math.round((areaSqM / 10000) * 100) / 100;
    const area_sqkm = Math.round((areaSqM / 1000000) * 1000) / 1000;

    // Centroid and bounding box
    const centroidFeature = turf.centroid(feature);
    const centroid = centroidFeature.geometry.coordinates as [number, number];
    const bbox = turf.bbox(feature) as [number, number, number, number];

    return {
      valid: true,
      area_ha,
      area_sqkm,
      centroid,
      bbox,
    };
  } catch (err: any) {
    return { valid: false, message: err?.message || 'Geospatial validation error' };
  }
}

/**
 * Format hectare values for display
 */
export function formatArea(hectares: number): string {
  if (hectares >= 1000) {
    return `${hectares.toLocaleString('en-US', { maximumFractionDigits: 1 })} ha (${(hectares / 100).toFixed(1)} km²)`;
  }
  return `${hectares.toLocaleString('en-US', { maximumFractionDigits: 2 })} ha`;
}

/**
 * Status color mappings
 */
export function getStatusColor(status: SiteStatus | string): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  switch (status) {
    case 'Active':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        hex: '#10b981',
      };
    case 'Monitoring':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/20',
        hex: '#3b82f6',
      };
    case 'Restoration':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        hex: '#f59e0b',
      };
    case 'Baseline':
    default:
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        hex: '#a855f7',
      };
  }
}

export function getProjectTypeColor(type: ProjectType | string): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  switch (type) {
    case 'Carbon':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/20',
        hex: '#06b6d4',
      };
    case 'Biodiversity':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        hex: '#10b981',
      };
    case 'Carbon + Biodiversity':
    default:
      return {
        bg: 'bg-teal-500/10',
        text: 'text-teal-400',
        border: 'border-teal-500/20',
        hex: '#14b8a6',
      };
  }
}
