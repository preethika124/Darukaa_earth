import React, { useState, useEffect } from 'react';
import { Site, SiteAnalyticsDetail } from '../types';
import { api } from '../services/api';
import { formatArea, getStatusColor } from '../utils/geospatial';
import {
  CarbonTrendChart,
  BiodiversityTrendChart,
  VegetationTrendChart,
  CarbonVsBiodiversityChart,
} from '../components/charts/EnvironmentalCharts';
import {
  MapPin,
  Trees,
  Leaf,
  Calendar,
  Layers,
  ArrowLeft,
  Download,
  ShieldCheck,
  TrendingUp,
  Activity,
  Award,
} from 'lucide-react';
import { MapboxView } from '../components/MapboxView';

interface SiteAnalyticsPageProps {
  siteId: string;
  allSites: Site[];
  onBack: () => void;
  onSelectAnotherSite: (id: string) => void;
}

export const SiteAnalyticsPage: React.FC<SiteAnalyticsPageProps> = ({
  siteId,
  allSites,
  onBack,
  onSelectAnotherSite,
}) => {
  const [detail, setDetail] = useState<SiteAnalyticsDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<
    'all' | 'carbon' | 'biodiversity' | 'vegetation'
  >('all');

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getSiteAnalytics(siteId);
        if (isMounted) setDetail(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load site analytics');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center py-20">
        <div className="p-4 bg-rose-950/50 border border-rose-500/40 rounded-2xl text-rose-200 text-xs mb-4">
          {error || 'Site analytics record not found.'}
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { site, history, carbon_summary, biodiversity_summary, vegetation_summary } = detail;
  const statusColor = getStatusColor(site.status);

  const exportCSV = () => {
    const headers = [
      'Date',
      'Carbon Stock (tCO2e)',
      'Carbon Sequestered',
      'Biodiversity Score',
      'Species Count',
      'NDVI',
      'Forest Cover',
    ];
    const rows = history.map((h) => [
      h.monitoring_date,
      h.carbon_stock,
      h.carbon_sequestered,
      h.biodiversity_score,
      h.species_count,
      h.vegetation_index,
      `${h.forest_cover}%`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${site.name.replace(/\s+/g, '_')}_analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explorer</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{site.name}</h1>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
            >
              {site.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>
              Project: <strong className="text-emerald-400">{site.project_name}</strong>
            </span>
            <span>•</span>
            <span>
              Location: <strong className="text-slate-200">{site.location}</strong>
            </span>
            <span>•</span>
            <span>
              Area: <strong className="text-slate-200 font-mono">{formatArea(site.area)}</strong>
            </span>
          </p>
        </div>

        {/* Site Switcher & Export */}
        <div className="flex items-center gap-3">
          <select
            value={site.id}
            onChange={(e) => onSelectAnotherSite(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            {allSites.map((s) => (
              <option key={s.id} value={s.id}>
                Switch Site: {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Key Environmental Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Carbon Stock</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
            {site.carbon_stock.toLocaleString()} <span className="text-xs font-normal">tCO2e</span>
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+{carbon_summary.net_gain_percentage}% vs baseline</span>
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Annual Sequestration
          </span>
          <span className="text-xl font-bold text-cyan-400 font-mono mt-1 block">
            {site.carbon_sequestered.toLocaleString()}{' '}
            <span className="text-xs font-normal">t/yr</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            Proj. 2030: {carbon_summary.projected_2030.toLocaleString()} t
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Biodiversity Score
          </span>
          <span className="text-xl font-bold text-teal-300 font-mono mt-1 block">
            {site.biodiversity_score} <span className="text-xs font-normal">/ 100</span>
          </span>
          <span className="text-[10px] text-teal-400 mt-1 block font-mono">
            Rank: Top 5th percentile
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Documented Species
          </span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
            {site.species_count} <span className="text-xs font-normal">species</span>
          </span>
          <span className="text-[10px] text-amber-400/80 mt-1 block">
            {biodiversity_summary.iucn_threatened_species} IUCN Red List taxa
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Vegetation (NDVI)
          </span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">
            {site.vegetation_index}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Dense vigor vegetation</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Canopy Cover</span>
          <span className="text-xl font-bold text-purple-400 font-mono mt-1 block">
            {site.forest_cover}%
          </span>
          <span className="text-[10px] text-purple-300 mt-1 block">
            {vegetation_summary.healthy_canopy_ha} ha closed canopy
          </span>
        </div>
      </div>

      {/* Geospatial Mini-Map & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Geospatial Polygon Boundary (PostGIS WGS84)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{formatArea(site.area)}</span>
          </div>
          <div className="h-64 rounded-xl overflow-hidden border border-slate-800">
            <MapboxView
              sites={[site]}
              selectedSiteId={site.id}
              height="100%"
              initialCenter={site.centroid || [76.5, 11.5]}
              initialZoom={11}
            />
          </div>
        </div>

        {/* Ecological Health Synopsis */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Ecological Health Audit</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {site.description ||
                'Continuous acoustic and satellite monitoring site for primary and regenerating biomass.'}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Soil Carbon Content:</span>
                <span className="font-mono text-emerald-400 font-semibold">3.8% SOM</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Water Retention Index:</span>
                <span className="font-mono text-cyan-400 font-semibold">88 / 100</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Mean Canopy Height:</span>
                <span className="font-mono text-teal-400 font-semibold">24.5 meters</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Last Field Inspection:</span>
            <span className="font-mono text-white">{site.monitoring_date}</span>
          </div>
        </div>
      </div>

      {/* Interactive Chart Section with Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Historical Time-Series Analytics</h2>
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveChartTab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeChartTab === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setActiveChartTab('carbon')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeChartTab === 'carbon'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Carbon
            </button>
            <button
              onClick={() => setActiveChartTab('biodiversity')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeChartTab === 'biodiversity'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Biodiversity
            </button>
            <button
              onClick={() => setActiveChartTab('vegetation')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeChartTab === 'vegetation'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vegetation
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(activeChartTab === 'all' || activeChartTab === 'carbon') && (
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
              <CarbonTrendChart data={history} />
            </div>
          )}

          {(activeChartTab === 'all' || activeChartTab === 'biodiversity') && (
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
              <BiodiversityTrendChart data={history} />
            </div>
          )}

          {(activeChartTab === 'all' || activeChartTab === 'vegetation') && (
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
              <VegetationTrendChart data={history} />
            </div>
          )}

          {(activeChartTab === 'all' || activeChartTab === 'carbon') && (
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
              <CarbonVsBiodiversityChart data={history} />
            </div>
          )}
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden p-5">
        <h3 className="text-sm font-bold text-white mb-3">Monitoring Census History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">Monitoring Date</th>
                <th className="p-3">Carbon Stock (tCO2e)</th>
                <th className="p-3">Sequestration Rate</th>
                <th className="p-3">Biodiversity Index</th>
                <th className="p-3">Species Count</th>
                <th className="p-3">NDVI Index</th>
                <th className="p-3">Forest Cover</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/30">
                  <td className="p-3 text-white font-medium">{record.monitoring_date}</td>
                  <td className="p-3 text-emerald-400">{record.carbon_stock.toLocaleString()}</td>
                  <td className="p-3 text-cyan-400">+{record.carbon_sequestered} t/yr</td>
                  <td className="p-3 text-teal-300">{record.biodiversity_score} / 100</td>
                  <td className="p-3 text-amber-400">{record.species_count} spp</td>
                  <td className="p-3 text-emerald-300">{record.vegetation_index}</td>
                  <td className="p-3 text-purple-300">{record.forest_cover}%</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400">
                      {record.ecosystem_health}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
