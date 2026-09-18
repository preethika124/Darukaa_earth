import React, { useState } from 'react';
import { Project, Site, ProjectType, ProjectStatus } from '../types';
import { formatArea, validatePolygon } from '../utils/geospatial';
import { MapboxView } from '../components/MapboxView';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  FolderKanban,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  TreePine,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CreateProjectFlowProps {
  onCancel: () => void;
  onSuccess: (newProjectId: string) => void;
}

interface DraftSite {
  id: string;
  name: string;
  geometry: any;
  area: number;
  location: string;
  status: 'Active' | 'Monitoring' | 'Restoration';
  carbon_stock: number;
  carbon_sequestered: number;
  biodiversity_score: number;
  vegetation_index: number;
  forest_cover: number;
  species_count: number;
}

export const CreateProjectFlow: React.FC<CreateProjectFlowProps> = ({ onCancel, onSuccess }) => {
  const { success, error } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Step 1: Project Metadata
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Carbon + Biodiversity');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [location, setLocation] = useState('Nilgiri Biosphere, Western Ghats');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2034-12-31');

  // Step 2, 3, 4: Multiple Sites List
  const [draftSites, setDraftSites] = useState<DraftSite[]>([]);
  const [isDrawingSite, setIsDrawingSite] = useState<boolean>(false);

  // New site temp fields
  const [siteName, setSiteName] = useState('');
  const [siteStatus, setSiteStatus] = useState<'Active' | 'Monitoring' | 'Restoration'>('Active');
  const [siteCarbon, setSiteCarbon] = useState('18400');
  const [siteBiodiversity, setSiteBiodiversity] = useState('88');
  const [siteNdvi, setSiteNdvi] = useState('0.82');
  const [siteSpecies, setSiteSpecies] = useState('145');
  const [drawnGeo, setDrawnGeo] = useState<any | null>(null);
  const [drawnArea, setDrawnArea] = useState<number>(0);

  const handlePolygonDrawn = (geometry: any, area_ha: number) => {
    setDrawnGeo(geometry);
    setDrawnArea(area_ha);
    setIsDrawingSite(false);
  };

  const handleAddDraftSite = () => {
    if (!drawnGeo) {
      error('Boundary Required', 'Please draw a polygon boundary on the map first.');
      return;
    }
    if (!siteName.trim()) {
      error('Site Name Required', 'Please provide a name for this site parcel.');
      return;
    }

    const newSite: DraftSite = {
      id: Math.random().toString(36).substring(2, 9),
      name: siteName,
      geometry: drawnGeo,
      area: drawnArea,
      location: location,
      status: siteStatus,
      carbon_stock: parseFloat(siteCarbon) || 12000,
      carbon_sequestered: Math.round((parseFloat(siteCarbon) || 12000) * 0.045),
      biodiversity_score: parseInt(siteBiodiversity) || 85,
      vegetation_index: parseFloat(siteNdvi) || 0.78,
      forest_cover: 80,
      species_count: parseInt(siteSpecies) || 120,
    };

    setDraftSites([...draftSites, newSite]);
    success('Site Added to Project', `${siteName} (${formatArea(drawnArea)}) prepared for saving.`);

    // Reset form for next site
    setSiteName('');
    setDrawnGeo(null);
    setDrawnArea(0);
  };

  const handleRemoveDraftSite = (id: string) => {
    setDraftSites(draftSites.filter((s) => s.id !== id));
  };

  const totalCalculatedArea = draftSites.reduce((sum, s) => sum + s.area, 0);

  const handleFinalSubmit = async () => {
    if (!name.trim()) {
      error('Validation Error', 'Project name is required');
      setCurrentStep(1);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Create Project
      const createdProject = await api.createProject({
        name,
        description,
        project_type: projectType,
        status,
        location,
        start_date: startDate,
        end_date: endDate,
        total_area: totalCalculatedArea || 500,
      });

      // 2. Persist each site associated with this project
      for (const draft of draftSites) {
        await api.createSite({
          project_id: createdProject.id,
          name: draft.name,
          geometry: draft.geometry,
          area: draft.area,
          location: draft.location,
          status: draft.status,
          carbon_stock: draft.carbon_stock,
          carbon_sequestered: draft.carbon_sequestered,
          biodiversity_score: draft.biodiversity_score,
          vegetation_index: draft.vegetation_index,
          forest_cover: draft.forest_cover,
          species_count: draft.species_count,
          ecosystem_health: 'Regenerating',
        });
      }

      success(
        'Project Successfully Created',
        `${name} and ${draftSites.length} geographical site(s) saved to PostGIS.`,
      );
      onSuccess(createdProject.id);
    } catch (err: any) {
      error('Failed to create project', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Wizard Progress Steps */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create Environmental Project
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete project setup: establish project charter, define geographical site boundaries on
          the map, and commit to PostGIS.
        </p>

        <div className="flex items-center justify-between mt-6 max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Project Information' },
            { num: 2, label: 'Add Sites & Polygons' },
            { num: 3, label: 'Review & Commit' },
          ].map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === step.num
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400'
                      : currentStep > step.num
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {currentStep > step.num ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={`text-xs font-medium ${currentStep === step.num ? 'text-white' : 'text-slate-400'}`}
                >
                  {step.label}
                </span>
              </div>
              {idx < 2 && <div className="flex-1 h-px bg-slate-800 mx-4" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Project Information */}
      {currentStep === 1 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-emerald-400" />
            <span>Step 1: Project Metadata & Charter</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Western Ghats Ecological Corridor Expansion"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe conservation goals, methodology (ARR, REDD+, Agroforestry), ecological indicators..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e: any) => setProjectType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Carbon">Carbon</option>
                  <option value="Biodiversity">Biodiversity</option>
                  <option value="Carbon + Biodiversity">Carbon + Biodiversity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operational Status
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Location / Biome
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Palakkad Gap, Kerala"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  End / Crediting Period Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!name.trim()) {
                  error('Name Required', 'Please enter a project name to continue.');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <span>Continue to Add Sites</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Sites & Draw Polygons */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Step 2 & 3: Interactive Geospatial Site Creation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Draw one or more site polygons on the map. Each polygon is verified against
                  PostGIS WGS84 coordinates.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Total Project Area
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatArea(totalCalculatedArea)}
                </span>
              </div>
            </div>

            {/* Map Container for drawing */}
            <div className="h-96 rounded-xl overflow-hidden border border-slate-800 relative">
              <MapboxView
                sites={draftSites as any}
                isDrawingMode={isDrawingSite}
                onPolygonCreated={handlePolygonDrawn}
                onCancelDrawing={() => setIsDrawingSite(false)}
                height="100%"
              />

              {!isDrawingSite && (
                <div className="absolute top-4 left-4 z-20">
                  <button
                    onClick={() => setIsDrawingSite(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{drawnGeo ? 'Redraw Polygon' : 'Start Drawing Polygon'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Site Metadata Input Form when polygon is drawn */}
            {drawnGeo && (
              <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">Polygon Captured:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatArea(drawnArea)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="e.g. Sector A - Riparian Forest"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Carbon Stock (tCO2e)
                    </label>
                    <input
                      type="number"
                      value={siteCarbon}
                      onChange={(e) => setSiteCarbon(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Biodiversity Score (0-100)
                    </label>
                    <input
                      type="number"
                      value={siteBiodiversity}
                      onChange={(e) => setSiteBiodiversity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddDraftSite}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
                  >
                    + Add This Site to Project
                  </button>
                </div>
              </div>
            )}

            {/* List of draft sites added so far */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Sites Added to Project ({draftSites.length})
              </h4>
              {draftSites.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                  No site polygons added yet. Click "Start Drawing Polygon" above to add your first
                  site boundary.
                </div>
              ) : (
                <div className="space-y-2">
                  {draftSites.map((ds) => (
                    <div
                      key={ds.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-xs font-semibold text-white">{ds.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatArea(ds.area)} • {ds.carbon_stock.toLocaleString()} tCO2e • Bio{' '}
                          {ds.biodiversity_score}/100
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveDraftSite(ds.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Step 1</span>
            </button>
            <button
              onClick={() => {
                if (draftSites.length === 0) {
                  error('Site Required', 'Please add at least one site polygon before reviewing.');
                  return;
                }
                setCurrentStep(3);
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <span>Review & Commit Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Final Commit */}
      {currentStep === 3 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
              Step 4 & 5: Review
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{name}</h2>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Project Type
              </span>
              <span className="text-xs font-bold text-emerald-400">{projectType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Status</span>
              <span className="text-xs font-bold text-teal-400">{status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Location</span>
              <span className="text-xs font-medium text-white">{location}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Total Monitored Area
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {formatArea(totalCalculatedArea)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Sites to be Persisted in PostGIS ({draftSites.length})
            </h4>
            <div className="space-y-2">
              {draftSites.map((ds, idx) => (
                <div
                  key={ds.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-white block">{ds.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ds.carbon_stock.toLocaleString()} tCO2e • Bio {ds.biodiversity_score}/100 •
                        NDVI {ds.vegetation_index}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    {formatArea(ds.area)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Edit Sites</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xl shadow-emerald-900/40 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? 'Persisting to PostGIS...' : 'Save & Publish Project'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
