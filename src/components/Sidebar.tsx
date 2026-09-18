import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  LineChart,
  PlusCircle,
  FileCode2,
  TreePine,
  Layers,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'projects' | 'map' | 'analytics' | 'create-project';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  sitesCount: number;
  projectsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  sitesCount,
  projectsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'projects' as NavTab,
      label: 'Projects',
      icon: FolderKanban,
      badge: projectsCount,
    },
    {
      id: 'map' as NavTab,
      label: 'Interactive Map',
      icon: MapPin,
      badge: sitesCount,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Site Analytics',
      icon: LineChart,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <TreePine className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white flex items-center gap-1">
            <span>Darukaa</span>
            <span className="text-emerald-400">.Earth</span>
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
            Geospatial Carbon & Bio
          </span>
        </div>
      </div>

      {/* Main Action Button */}
      <div className="p-4">
        <button
          onClick={() => onSelectTab('create-project')}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer group"
        >
          <PlusCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>New Project & Site</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / Architecture */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <a
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 text-xs transition-colors border border-slate-800"
        >
          <div className="flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
            <span>OpenAPI Docs</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v1.0</span>
        </a>

        <div className="px-3 py-2 rounded-lg bg-slate-900/30 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Database:</span>
            <span className="text-emerald-400 font-mono font-medium">PostGIS 3.4</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Map Engine:</span>
            <span className="text-teal-400 font-mono font-medium">Mapbox GL JS</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
