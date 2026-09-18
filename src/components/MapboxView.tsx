import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Site, Project } from '../types';
import { validatePolygon, getStatusColor, formatArea } from '../utils/geospatial';
import {
  Layers,
  Maximize2,
  AlertTriangle,
  Eye,
  Compass,
  Plus,
  Check,
  RefreshCw,
} from 'lucide-react';

interface MapboxViewProps {
  sites: Site[];
  selectedSiteId?: string | null;
  onSelectSite?: (site: Site) => void;
  onNavigateToAnalytics?: (siteId: string) => void;
  // Drawing mode props
  isDrawingMode?: boolean;
  onPolygonCreated?: (geometry: any, area_ha: number) => void;
  onCancelDrawing?: () => void;
  filterProjectId?: string | null;
  projects?: Project[];
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const MapboxView: React.FC<MapboxViewProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  onNavigateToAnalytics,
  isDrawingMode = false,
  onPolygonCreated,
  onCancelDrawing,
  filterProjectId,
  projects = [],
  height = '100%',
  initialCenter = [76.5, 11.5], // Western Ghats / India default
  initialZoom = 6.5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'outdoors'>('satellite');
  const [drawnArea, setDrawnArea] = useState<number | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [tempGeometry, setTempGeometry] = useState<any | null>(null);
  const [tokenNotice, setTokenNotice] = useState<boolean>(false);

  const filteredSites = filterProjectId
    ? sites.filter((s) => s.project_id === filterProjectId)
    : sites;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token =
      import.meta.env.VITE_MAPBOX_TOKEN ||
      'pk.eyJ1Ijoic2FpOTA2IiwiYSI6ImNsdWVkMzB5ZDBoc3kyam54eWR2aXN0OTIifQ.sample_or_demo_token';

    // Mapbox access token setting
    try {
      mapboxgl.accessToken = token;
    } catch (e) {
      console.warn('Mapbox token error', e);
    }

    const styleUrl =
      mapStyle === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : mapStyle === 'dark'
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/outdoors-v12';

    // Custom fallback style if Mapbox token is invalid or blocked
    const fallbackStyle: any = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors | Darukaa.Earth',
        },
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    let mapInstance: mapboxgl.Map;

    try {
      mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style:
          token.startsWith('pk.') && !token.includes('sample_public_token')
            ? styleUrl
            : fallbackStyle,
        center: initialCenter,
        zoom: initialZoom,
        pitch: 25,
      });
    } catch (err) {
      console.warn('Falling back to raster style:', err);
      mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: fallbackStyle,
        center: initialCenter,
        zoom: initialZoom,
      });
    }

    mapInstance.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    mapInstance.on('load', () => {
      mapRef.current = mapInstance;
      setMapLoaded(true);
    });

    mapInstance.on('error', (e) => {
      // If mapbox style failed to load due to 401 unauthorized token, fallback smoothly
      if (e?.error && (e.error as any).status === 401) {
        setTokenNotice(true);
        if (mapInstance && mapInstance.getStyle()?.sources && !mapInstance.getSource('osm-tiles')) {
          try {
            mapInstance.setStyle(fallbackStyle);
          } catch (styleErr) {
            console.error('Fallback style failure', styleErr);
          }
        }
      }
    });

    return () => {
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Draw Control when isDrawingMode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (isDrawingMode) {
      if (!drawRef.current) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
          },
          defaultMode: 'draw_polygon',
        });
        map.addControl(draw, 'top-left');
        drawRef.current = draw;

        const handleDrawChange = () => {
          const data = draw.getAll();
          if (data.features.length > 0) {
            const latestFeature = data.features[data.features.length - 1];
            const validation = validatePolygon(latestFeature.geometry as any);
            if (!validation.valid) {
              setDrawError(validation.message || 'Invalid polygon boundary');
              setDrawnArea(null);
              setTempGeometry(null);
            } else {
              setDrawError(null);
              setDrawnArea(validation.area_ha || 0);
              setTempGeometry(latestFeature.geometry);
            }
          } else {
            setDrawnArea(null);
            setTempGeometry(null);
            setDrawError(null);
          }
        };

        map.on('draw.create', handleDrawChange);
        map.on('draw.update', handleDrawChange);
        map.on('draw.delete', handleDrawChange);
      }
    } else {
      if (drawRef.current) {
        map.removeControl(drawRef.current);
        drawRef.current = null;
        setDrawnArea(null);
        setDrawError(null);
        setTempGeometry(null);
      }
    }
  }, [isDrawingMode, mapLoaded]);

  // Render Site Polygons on the Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const sourceId = 'darukaa-sites-source';
    const fillLayerId = 'darukaa-sites-fill';
    const lineLayerId = 'darukaa-sites-line';
    const labelLayerId = 'darukaa-sites-label';

    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filteredSites.map((site) => {
        const color = getStatusColor(site.status).hex;
        return {
          type: 'Feature',
          id: site.id,
          properties: {
            id: site.id,
            name: site.name,
            project_id: site.project_id,
            project_name: site.project_name || 'Project',
            area: site.area,
            status: site.status,
            carbon_stock: site.carbon_stock,
            carbon_sequestered: site.carbon_sequestered,
            biodiversity_score: site.biodiversity_score,
            vegetation_index: site.vegetation_index,
            species_count: site.species_count,
            ecosystem_health: site.ecosystem_health,
            color: color,
            isSelected: site.id === selectedSiteId,
          },
          geometry: site.geometry as any,
        };
      }),
    };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojsonData);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
      });

      // Fill layer
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['case', ['boolean', ['get', 'isSelected'], false], 0.55, 0.35],
        },
      });

      // Line / Border layer
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['case', ['boolean', ['get', 'isSelected'], false], 3.5, 2],
          'line-opacity': 0.9,
        },
      });

      // Click Interaction on Polygons
      map.on('click', fillLayerId, (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties as any;
        const site = filteredSites.find((s) => s.id === props.id);

        if (site && onSelectSite) {
          onSelectSite(site);
        }

        // Display interactive popup
        if (popupRef.current) popupRef.current.remove();

        const coordinates = e.lngLat;
        const popupHtml = `
          <div class="p-3.5 max-w-xs font-sans text-slate-100 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                props.status === 'Active'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-blue-500/20 text-blue-300'
              }">${props.status}</span>
              <span class="text-xs text-slate-400 font-mono">${formatArea(props.area)}</span>
            </div>
            <h3 class="font-bold text-base text-white leading-tight mb-1">${props.name}</h3>
            <p class="text-xs text-emerald-400 font-medium mb-3 flex items-center gap-1">
              <span>🌿 ${props.project_name}</span>
            </p>
            <div class="grid grid-cols-2 gap-2 text-xs bg-slate-800/80 p-2 rounded-lg mb-3">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase">Carbon Stock</span>
                <span class="font-semibold text-emerald-300">${props.carbon_stock.toLocaleString()} tCO2e</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase">Biodiversity</span>
                <span class="font-semibold text-teal-300">${props.biodiversity_score} / 100</span>
              </div>
            </div>
            <button id="view-analytics-btn-${props.id}" class="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <span>View Analytics</span>
              <span>→</span>
            </button>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: true,
          className: 'darukaa-mapbox-popup',
        })
          .setLngLat(coordinates)
          .setHTML(popupHtml)
          .addTo(map);

        popupRef.current = popup;

        // Attach event listener for View Analytics button inside popup
        setTimeout(() => {
          const btn = document.getElementById(`view-analytics-btn-${props.id}`);
          if (btn && onNavigateToAnalytics) {
            btn.onclick = () => {
              onNavigateToAnalytics(props.id);
            };
          }
        }, 50);
      });

      // Cursor pointer on hover
      map.on('mouseenter', fillLayerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', fillLayerId, () => {
        map.getCanvas().style.cursor = '';
      });
    }
  }, [filteredSites, selectedSiteId, mapLoaded]);

  // Fit bounds to selected site or filtered sites
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (selectedSiteId) {
      const site = sites.find((s) => s.id === selectedSiteId);
      if (site && site.bbox) {
        map.fitBounds(
          [
            [site.bbox[0], site.bbox[1]],
            [site.bbox[2], site.bbox[3]],
          ],
          { padding: 80, duration: 1200 },
        );
      }
    } else if (filterProjectId && filteredSites.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredSites.forEach((site) => {
        if (site.bbox) {
          bounds.extend([site.bbox[0], site.bbox[1]]);
          bounds.extend([site.bbox[2], site.bbox[3]]);
        }
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, duration: 1200 });
      }
    }
  }, [selectedSiteId, filterProjectId, mapLoaded]);

  const handleConfirmDrawnPolygon = () => {
    if (tempGeometry && drawnArea && onPolygonCreated) {
      onPolygonCreated(tempGeometry, drawnArea);
      if (drawRef.current) {
        drawRef.current.deleteAll();
      }
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 shadow-xl bg-slate-950"
      style={{ height }}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Mapbox Token Notice Banner if applicable */}
      {tokenNotice && (
        <div className="absolute top-3 left-3 z-30 max-w-md bg-slate-900/95 border border-amber-500/40 text-amber-200 text-xs p-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Using high-resolution open GIS raster tiles. Configure{' '}
            <code className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white">
              VITE_MAPBOX_TOKEN
            </code>{' '}
            for custom Mapbox vectors.
          </span>
        </div>
      )}

      {/* Map Controls Floating Widget */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl">
        <div className="flex items-center gap-1 text-xs text-slate-300 font-medium px-2 py-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Style:</span>
        </div>
        <button
          onClick={() => setMapStyle('satellite')}
          className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
            mapStyle === 'satellite'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapStyle('dark')}
          className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
            mapStyle === 'dark'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setMapStyle('outdoors')}
          className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
            mapStyle === 'outdoors'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Terrain
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 px-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{filteredSites.length} Sites Loaded</span>
        </div>
      </div>

      {/* Interactive Drawing Instructions & Action Bar */}
      {isDrawingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-emerald-500/50 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl max-w-md w-11/12 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-sm font-semibold text-white">Interactive Polygon Drawing</h4>
            </div>
            {drawnArea !== null && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {formatArea(drawnArea)}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300">
            Click on the map to place polygon vertices. Close the polygon by clicking the starting
            node.
          </p>

          {drawError && (
            <div className="text-xs bg-rose-950/80 border border-rose-500/50 text-rose-200 p-2 rounded-lg flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{drawError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              onClick={onCancelDrawing}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDrawnPolygon}
              disabled={!tempGeometry || !!drawError}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                tempGeometry && !drawError
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Polygon & Create Site</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
