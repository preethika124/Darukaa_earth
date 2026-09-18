import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MapPage } from './pages/MapPage';
import { SiteAnalyticsPage } from './pages/SiteAnalyticsPage';
import { CreateProjectFlow } from './pages/CreateProjectFlow';
import { api } from './services/api';
import { Project, Site, DashboardSummary } from './types';

function AppContent() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Core domain data
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedProjects, fetchedSites, fetchedSummary] = await Promise.all([
        api.getProjects(),
        api.getSites(),
        api.getDashboardSummary(),
      ]);
      setProjects(fetchedProjects);
      setSites(fetchedSites);
      setSummary(fetchedSummary);

      // Use the first site only when there is no existing user selection.
      // The functional update keeps this loader stable and prevents a second
      // initial fetch caused by selectedSiteId changing after data arrives.
      if (fetchedSites.length > 0) {
        setSelectedSiteId((currentSiteId) => currentSiteId ?? fetchedSites[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete or archive this project?')) return;
    try {
      await api.deleteProject(projectId);
      success('Project Deleted', 'Project and associated records removed');
      await loadAllData();
    } catch (err: any) {
      error('Deletion Failed', err.message);
    }
  };

  const handleNavigateToSiteAnalytics = (siteId: string) => {
    setSelectedSiteId(siteId);
    setCurrentTab('analytics');
  };

  const handleNavigateToMapWithFilter = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('map');
  };

  const handleProjectCreatedSuccess = async (newProjectId: string) => {
    await loadAllData();
    setSelectedProjectId(newProjectId);
    setCurrentTab('map');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'map') setSelectedProjectId(null);
        }}
        projectsCount={projects.length}
        sitesCount={sites.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onSearch={setSearchQuery} onOpenAuthModal={() => setIsAuthModalOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              projects={projects}
              sites={sites}
              onNavigateToProjects={() => setCurrentTab('projects')}
              onNavigateToMap={() => setCurrentTab('map')}
              onSelectSite={handleNavigateToSiteAnalytics}
              onSelectProject={(id) => {
                setSelectedProjectId(id);
                setCurrentTab('projects');
              }}
              onCreateProject={() => setCurrentTab('create-project')}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsPage
              projects={projects}
              sites={sites}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onSelectSite={handleNavigateToSiteAnalytics}
              onCreateProject={() => setCurrentTab('create-project')}
              onDeleteProject={handleDeleteProject}
              onNavigateToMapWithFilter={handleNavigateToMapWithFilter}
            />
          )}

          {currentTab === 'map' && (
            <MapPage
              projects={projects}
              sites={sites}
              selectedSiteId={selectedSiteId}
              onSelectSite={(s) => setSelectedSiteId(s.id)}
              onNavigateToAnalytics={handleNavigateToSiteAnalytics}
              onRefreshSites={loadAllData}
              filterProjectId={selectedProjectId}
            />
          )}

          {currentTab === 'analytics' && selectedSiteId && (
            <SiteAnalyticsPage
              siteId={selectedSiteId}
              allSites={sites}
              onBack={() => setCurrentTab('map')}
              onSelectAnotherSite={(id) => setSelectedSiteId(id)}
            />
          )}

          {currentTab === 'create-project' && (
            <CreateProjectFlow
              onCancel={() => setCurrentTab('projects')}
              onSuccess={handleProjectCreatedSuccess}
            />
          )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
