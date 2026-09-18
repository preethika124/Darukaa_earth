import React, { useState } from 'react';
import { MapboxView } from '../components/MapboxView';
import { Project, Site } from '../types';
import { formatArea, getStatusColor } from '../utils/geospatial';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  MapPin,
  Filter,
  Plus,
  Layers,
  Sparkles,
  TreePine,
  Trees,
  Leaf,
  ChevronRight,
  X,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface MapPageProps {
  projects: Project[];
  sites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (site: Site) => void;
  onNavigateToAnalytics: (siteId: string) => void;
  onRefreshSites: () => Promise<void>;
  filterProjectId?: string | null;
}

export const MapPage: React.FC<MapPageProps> = ({
  projects,
  sites,
  selectedSiteId,
  onSelectSite,
  onNavigateToAnalytics,
  onRefreshSites,
  filterProjectId: initialFilterProjectId,
}) => {
  const { success, error } = useToast();
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(
    initialFilterProjectId || 'All',
  );
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [showSaveSiteModal, setShowSaveSiteModal] = useState<boolean>(false);
  const [drawnGeometry, setDrawnGeometry] = useState<any | null>(null);
  const [drawnAreaHa, setDrawnAreaHa] = useState<number>(0);

  // Form states for creating a site from drawn polygon
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteProjectId, setNewSiteProjectId] = useState(projects[0]?.id || '');
  const [newSiteStatus, setNewSiteStatus] = useState<
    'Active' | 'Monitoring' | 'Restoration' | 'Baseline'
  >('Active');
  const [newSiteCarbon, setNewSiteCarbon] = useState('12500');
  const [newSiteBiodiversity, setNewSiteBiodiversity] = useState('85');
  const [newSiteNdvi, setNewSiteNdvi] = useState('0.78');
  const [newSiteSpecies, setNewSiteSpecies] = useState('130');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  const handlePolygonDrawn = (geometry: any, area_ha: number) => {
    setDrawnGeometry(geometry);
    setDrawnAreaHa(area_ha);
    setIsDrawingMode(false);
    setShowSaveSiteModal(true);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawnGeometry) return;

    setIsSubmitting(true);
    try {
      await api.createSite({
        project_id: newSiteProjectId,
        name: newSiteName,
        geometry: drawnGeometry,
        area: drawnAreaHa,
        location: projects.find((p) => p.id === newSiteProjectId)?.location || 'Field Station',
        status: newSiteStatus,
        carbon_stock: parseFloat(newSiteCarbon) || 10000,
        carbon_sequestered: Math.round((parseFloat(newSiteCarbon) || 10000) * 0.045),
        biodiversity_score: parseInt(newSiteBiodiversity) || 80,
        vegetation_index: parseFloat(newSiteNdvi) || 0.75,
        forest_cover: 82,
        species_count: parseInt(newSiteSpecies) || 110,
        ecosystem_health: 'Regenerating',
      });

      success('Geospatial site saved', `${newSiteName} polygon registered in PostGIS`);
      setShowSaveSiteModal(false);
      setNewSiteName('');
      setDrawnGeometry(null);
      await onRefreshSites();
    } catch (err: any) {
      error('Failed to create site', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full flex overflow-hidden">
      {/* Map Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 px-2">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">Project:</span>
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* Draw Polygon Button */}
        <button
          onClick={() => setIsDrawingMode(!isDrawingMode)}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            isDrawingMode
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
          }`}
        >
          {isDrawingMode ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cancel Drawing</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Draw Site Polygon</span>
            </>
          )}
        </button>
      </div>

      {/* Main Mapbox Container */}
      <div className="flex-1 w-full h-full">
        <MapboxView
          sites={sites}
          projects={projects}
          filterProjectId={selectedProjectFilter === 'All' ? null : selectedProjectFilter}
          selectedSiteId={selectedSiteId}
          onSelectSite={onSelectSite}
          onNavigateToAnalytics={onNavigateToAnalytics}
          isDrawingMode={isDrawingMode}
          onPolygonCreated={handlePolygonDrawn}
          onCancelDrawing={() => setIsDrawingMode(false)}
          height="100%"
        />
      </div>

      {/* Right Drawer: Selected Site Inspector */}
      {selectedSite && (
        <div className="w-80 bg-slate-950/95 border-l border-slate-800 p-5 overflow-y-auto flex flex-col justify-between shrink-0 z-20 backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(selectedSite.status).bg} ${getStatusColor(selectedSite.status).text}`}
              >
                {selectedSite.status}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {formatArea(selectedSite.area)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white leading-snug">{selectedSite.name}</h3>
            <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
              <TreePine className="w-3.5 h-3.5" />
              <span>{selectedSite.project_name || 'Project Site'}</span>
            </p>

            <p className="text-xs text-slate-400 mt-2">{selectedSite.location}</p>

            <div className="mt-5 space-y-3">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Carbon Biomass Stock
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {selectedSite.carbon_stock.toLocaleString()}{' '}
                  <span className="text-xs font-normal">tCO2e</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Annual Rate: ~{selectedSite.carbon_sequestered.toLocaleString()} tCO2e/yr
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Biodiversity Index
                </span>
                <span className="text-lg font-bold text-teal-400 font-mono">
                  {selectedSite.biodiversity_score}{' '}
                  <span className="text-xs font-normal">/ 100</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {selectedSite.species_count} Observed Species • {selectedSite.ecosystem_health}
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Remote Sensing NDVI
                </span>
                <span className="text-lg font-bold text-emerald-300 font-mono">
                  {selectedSite.vegetation_index}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {selectedSite.forest_cover}% Dense Canopy Crown
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6">
            <button
              onClick={() => onNavigateToAnalytics(selectedSite.id)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              <span>Detailed Site Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Save Drawn Polygon as New Site */}
      {showSaveSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Register Drawn Polygon in PostGIS</span>
              </h3>
              <button
                onClick={() => setShowSaveSiteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSite} className="space-y-4 mt-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  Calculated Area (WGS84 Ellipsoid):
                </span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  {formatArea(drawnAreaHa)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Project
                </label>
                <select
                  value={newSiteProjectId}
                  onChange={(e) => setNewSiteProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Site / Parcel Name
                </label>
                <input
                  type="text"
                  required
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="e.g., Anamalai Cloud Forest Sector 4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={newSiteStatus}
                    onChange={(e: any) => setNewSiteStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Restoration">Restoration</option>
                    <option value="Baseline">Baseline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Carbon Stock (tCO2e)
                  </label>
                  <input
                    type="number"
                    value={newSiteCarbon}
                    onChange={(e) => setNewSiteCarbon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Biodiversity Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newSiteBiodiversity}
                    onChange={(e) => setNewSiteBiodiversity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vegetation NDVI
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={newSiteNdvi}
                    onChange={(e) => setNewSiteNdvi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSaveSiteModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Database...' : 'Persist Site in PostGIS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
