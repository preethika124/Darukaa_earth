import json
import math
from typing import Dict, Any, Tuple
from shapely.geometry import shape, mapping, Polygon
from shapely.validation import explain_validity
from geoalchemy2.shape import from_shape, to_shape

class GeospatialService:
    @staticmethod
    def validate_and_parse_polygon(geometry_dict: Dict[str, Any]) -> Tuple[Polygon, float, Tuple[float, float], Tuple[float, float, float, float]]:
        """
        Validates GeoJSON Polygon geometry, calculates area in hectares, centroid, and bounding box.
        """
        try:
            geom = shape(geometry_dict)
        except Exception as e:
            raise ValueError(f"Malformed GeoJSON polygon: {str(e)}")

        if not isinstance(geom, Polygon):
            raise ValueError("Geometry must be of type 'Polygon'")

        if not geom.is_valid:
            reason = explain_validity(geom)
            raise ValueError(f"Invalid polygon geometry (PostGIS topological error): {reason}")

        centroid = (round(geom.centroid.x, 6), round(geom.centroid.y, 6))
        bounds = (
            round(geom.bounds[0], 6),
            round(geom.bounds[1], 6),
            round(geom.bounds[2], 6),
            round(geom.bounds[3], 6),
        )

        # Approximate square meters using average latitude
        lat_rad = math.radians(centroid[1])
        m_per_deg_lat = 111132.954 - 559.822 * math.cos(2 * lat_rad) + 1.175 * math.cos(4 * lat_rad)
        m_per_deg_lon = 111412.84 * math.cos(lat_rad) - 93.5 * math.cos(3 * lat_rad)

        transformed_coords = [
            (pt[0] * m_per_deg_lon, pt[1] * m_per_deg_lat) for pt in geom.exterior.coords
        ]
        meter_poly = Polygon(transformed_coords)
        area_sq_m = meter_poly.area
        area_ha = round(area_sq_m / 10000.0, 2)
        if area_ha <= 0.0:
            area_ha = 0.01

        return geom, area_ha, centroid, bounds

    @staticmethod
    def shapely_to_geoalchemy(geom: Polygon):
        try:
            return from_shape(geom, srid=4326)
        except Exception:
            return json.dumps(mapping(geom))

    @staticmethod
    def geoalchemy_to_geojson(geom_element) -> Dict[str, Any]:
        if isinstance(geom_element, dict):
            return geom_element
        if isinstance(geom_element, str):
            try:
                return json.loads(geom_element)
            except Exception:
                pass
        try:
            shapely_geom = to_shape(geom_element)
            return mapping(shapely_geom)
        except Exception:
            return {"type": "Polygon", "coordinates": []}
