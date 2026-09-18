import React, { useState } from 'react';
import { Project, Site, ProjectStatus, ProjectType } from '../types';
import { formatArea, getProjectTypeColor, getStatusColor } from '../utils/geospatial';
import {
  FolderKanban,
  MapPin,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Trees,
  Leaf,
  LayoutGrid,
  List,
} from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  sites: Site[];
  onSelectProject: (projectId: string) => void;
  onSelectSite: (siteId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onNavigateToMapWithFilter: (projectId: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  sites,
  onSelectProject,
  onSelectSite,
  onCreateProject,
  onDeleteProject,
  onNavigateToMapWithFilter,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesType = typeFilter === 'All' || p.project_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectSites = sites.filter((s) => s.project_id === selectedProjectId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Environmental Projects</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage carbon sequestration initiatives, ecological corridors, and multi-site
            conservation programs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onCreateProject}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project name or location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Types</option>
            <option value="Carbon">Carbon</option>
            <option value="Biodiversity">Biodiversity</option>
            <option value="Carbon + Biodiversity">Carbon + Biodiversity</option>
          </select>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or create a new environmental conservation
            project.
          </p>
          <button
            onClick={onCreateProject}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
          >
            Create Project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const statusColor = getStatusColor(project.status);
            const typeColor = getProjectTypeColor(project.project_type);

            return (
              <div
                key={project.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
                    >
                      {project.status}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${typeColor.bg} ${typeColor.text} border ${typeColor.border}`}
                    >
                      {project.project_type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{project.location}</span>
                  </p>

                  <p className="text-xs text-slate-300 line-clamp-2 mt-3 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">
                        Total Area
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 font-mono">
                        {formatArea(project.total_area)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">
                        Monitored Sites
                      </span>
                      <span className="text-xs font-semibold text-cyan-400 font-mono">
                        {project.sites_count || 0} Geospatial Sites
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onNavigateToMapWithFilter(project.id)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View on Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProjectId(project.id)}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Sites ({sites.filter((s) => s.project_id === project.id).length})
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Project Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Total Area</th>
                <th className="p-3.5">Sites</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProjects.map((project) => {
                const statusColor = getStatusColor(project.status);
                const typeColor = getProjectTypeColor(project.project_type);
                return (
                  <tr key={project.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-semibold text-white">{project.name}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${typeColor.bg} ${typeColor.text}`}
                      >
                        {project.project_type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${statusColor.bg} ${statusColor.text}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{project.location}</td>
                    <td className="p-3.5 font-mono text-emerald-400">
                      {formatArea(project.total_area)}
                    </td>
                    <td className="p-3.5 font-mono">{project.sites_count || 0}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onNavigateToMapWithFilter(project.id)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        Map
                      </button>
                      <button
                        onClick={() => setSelectedProjectId(project.id)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-mono uppercase">
                  {selectedProject.project_type}
                </span>
                <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedProject.description}</p>

            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Location</span>
                <p className="text-xs text-white font-medium mt-0.5">{selectedProject.location}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Total Area</span>
                <p className="text-xs text-emerald-400 font-mono font-medium mt-0.5">
                  {formatArea(selectedProject.total_area)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Start - End</span>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {selectedProject.start_date} → {selectedProject.end_date}
                </p>
              </div>
            </div>

            {/* Sites within this project */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Associated Sites ({projectSites.length})
                </h4>
                <button
                  onClick={() => {
                    const id = selectedProject.id;
                    setSelectedProjectId(null);
                    onNavigateToMapWithFilter(id);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <span>Draw or View Sites on Map</span>
                  <span>→</span>
                </button>
              </div>

              {projectSites.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  No sites added yet. Open the map to draw polygon boundaries for this project.
                </div>
              ) : (
                <div className="space-y-2">
                  {projectSites.map((site) => (
                    <div
                      key={site.id}
                      onClick={() => {
                        setSelectedProjectId(null);
                        onSelectSite(site.id);
                      }}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <h5 className="text-xs font-semibold text-white">{site.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatArea(site.area)} • {site.carbon_stock.toLocaleString()} tCO2e •
                          Bio: {site.biodiversity_score}/100
                        </p>
                      </div>
                      <span className="text-xs text-emerald-400 font-semibold">
                        View Analytics →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
