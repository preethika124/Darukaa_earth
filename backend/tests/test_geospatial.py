import pytest
from app.services.geospatial_service import GeospatialService

def test_valid_polygon_parsing():
    valid_coords = {
        "type": "Polygon",
        "coordinates": [
            [[76.88, 10.35], [76.94, 10.35], [76.95, 10.39], [76.89, 10.40], [76.88, 10.35]]
        ],
    }
    geom, area_ha, centroid, bounds = GeospatialService.validate_and_parse_polygon(valid_coords)
    assert geom.is_valid
    assert area_ha > 0
    assert 76.0 < centroid[0] < 78.0
    assert 10.0 < centroid[1] < 11.0

def test_self_intersecting_polygon_fails():
    # Figure-eight bowtie polygon (self-intersecting)
    bowtie = {
        "type": "Polygon",
        "coordinates": [
            [[0, 0], [0, 2], [2, 0], [2, 2], [0, 0]]
        ],
    }
    with pytest.raises(ValueError) as exc:
        GeospatialService.validate_and_parse_polygon(bowtie)
    assert "Invalid polygon geometry" in str(exc.value)
