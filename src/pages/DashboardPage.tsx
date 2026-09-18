import React from 'react';
import { DashboardSummary, Project, Site } from '../types';
import { formatArea, getProjectTypeColor, getStatusColor } from '../utils/geospatial';
import {
  FolderKanban,
  MapPin,
  Trees,
  Leaf,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  projects: Project[];
  sites: Site[];
  onNavigateToProjects: () => void;
  onNavigateToMap: () => void;
  onSelectSite: (siteId: string) => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  projects,
  sites,
  onNavigateToProjects,
  onNavigateToMap,
  onSelectSite,
  onSelectProject,
  onCreateProject,
}) => {
  if (!summary) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  // Aggregate highcharts options for dashboard overview
  const carbonChartOptions: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      height: 260,
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Cumulative Carbon Stock Trajectory',
      align: 'left',
      style: { color: '#f8fafc', fontSize: '13px' },
    },
    subtitle: {
      text: 'Monitored tCO2e accumulated across all active project sites',
      align: 'left',
      style: { color: '#94a3b8', fontSize: '11px' },
    },
    xAxis: {
      categories: summary.carbon_trend_history.map((h) => h.date),
      labels: { style: { color: '#94a3b8', fontSize: '10px' } },
      lineColor: '#334155',
    },
    yAxis: {
      title: { text: 'tCO2e', style: { color: '#10b981', fontSize: '11px' } },
      gridLineColor: '#1e293b',
      labels: { style: { color: '#94a3b8', fontSize: '10px' } },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      style: { color: '#fff' },
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [
      {
        name: 'Carbon Stock (tCO2e)',
        type: 'areaspline',
        data: summary.carbon_trend_history.map((h) => h.total_carbon_stock),
        color: '#10b981',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(16, 185, 129, 0.35)'],
            [1, 'rgba(16, 185, 129, 0.0)'],
          ],
        },
      },
    ],
  };

  const projectDistributionOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: 260,
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Portfolio by Project Type',
      align: 'left',
      style: { color: '#f8fafc', fontSize: '13px' },
    },
    subtitle: {
      text: 'Area distribution across conservation themes',
      align: 'left',
      style: { color: '#94a3b8', fontSize: '11px' },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      pointFormat: '<b>{point.y} ha</b> ({point.percentage:.1f}%)',
    },
    legend: {
      itemStyle: { color: '#cbd5e1', fontSize: '11px' },
    },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: '60%',
        depth: 20,
        dataLabels: { enabled: false },
        showInLegend: true,
      },
    },
    series: [
      {
        name: 'Area',
        type: 'pie',
        data: summary.project_type_distribution.map((d) => ({
          name: d.type,
          y: d.area,
          color:
            d.type === 'Carbon' ? '#06b6d4' : d.type === 'Biodiversity' ? '#10b981' : '#14b8a6',
        })),
      },
    ],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Executive Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Production Geospatial Engine
            </span>
            <span className="text-xs text-slate-400">PostGIS SRID 4326</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Environmental Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time tracking of biomass carbon stocks, verified sequestration yields, and
            biodiversity indices across conservation corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToMap}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Map Explorer</span>
          </button>
          <button
            onClick={onCreateProject}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>+ Create Project</span>
          </button>
        </div>
      </div>

      {/* 6 Executive Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Projects
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">
              {summary.total_projects}
            </span>
            <FolderKanban className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 font-mono">100% Verified</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Active Projects
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {summary.active_projects}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">In progress</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Sites
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">{summary.total_sites}</span>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[10px] text-cyan-400 mt-1 font-mono">Geo Polygons</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Area
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white font-mono">
              {summary.total_area.toLocaleString()}
            </span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-[10px] text-teal-400 mt-1 font-mono">Hectares (ha)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Carbon Stored
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {(summary.total_carbon_stock / 1000).toFixed(1)}k
            </span>
            <Trees className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-300 mt-1 font-mono">tCO2e sequestered</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Biodiversity Score
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-teal-300 font-mono">
              {summary.avg_biodiversity_score}
            </span>
            <Leaf className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-[10px] text-teal-400 mt-1 font-mono">/ 100 Index</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <HighchartsReact highcharts={Highcharts} options={carbonChartOptions} />
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <HighchartsReact highcharts={Highcharts} options={projectDistributionOptions} />
        </div>
      </div>

      {/* Recent Projects & Sites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects List */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-emerald-400" />
              <span>Monitored Projects</span>
            </h3>
            <button
              onClick={onNavigateToProjects}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>View All ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => {
              const typeColor = getProjectTypeColor(project.project_type);
              const statusColor = getStatusColor(project.status);
              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor.bg} ${statusColor.text}`}
                      >
                        {project.status}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColor.bg} ${typeColor.text}`}
                      >
                        {project.project_type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                      {project.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{project.location}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-xs font-mono font-semibold text-emerald-400">
                      {formatArea(project.total_area)}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                      {project.sites_count || 0} sites
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Monitored Sites List */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Geospatial Sites</span>
            </h3>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Explore Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {sites.slice(0, 4).map((site) => (
              <div
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h5 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {site.name}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {site.carbon_stock.toLocaleString()} tCO2e • {site.biodiversity_score}/100 Bio
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
