import { AuthResponse, DashboardSummary, Project, Site, SiteAnalyticsDetail } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('darukaa_token');
  }

  public setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('darukaa_token', token);
    } else {
      localStorage.removeItem('darukaa_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      // Trigger auth event or callback
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.detail || 'API request failed');
    }

    return data;
  }

  // Authentication
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/auth/me');
  }

  logout(): void {
    this.setToken(null);
  }

  // Projects
  async getProjects(params?: {
    status?: string;
    type?: string;
    search?: string;
  }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    return this.request<Project[]>(`/projects${qs ? `?${qs}` : ''}`);
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectSites(projectId: string): Promise<Site[]> {
    return this.request<Site[]>(`/projects/${projectId}/sites`);
  }

  // Sites & Geospatial
  async getSites(params?: {
    project_id?: string;
    status?: string;
    search?: string;
  }): Promise<Site[]> {
    const query = new URLSearchParams();
    if (params?.project_id) query.append('project_id', params.project_id);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    return this.request<Site[]>(`/sites${qs ? `?${qs}` : ''}`);
  }

  async getSite(id: string): Promise<Site> {
    return this.request<Site>(`/sites/${id}`);
  }

  async createSite(site: Partial<Site>): Promise<Site> {
    return this.request<Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(site),
    });
  }

  async updateSite(id: string, site: Partial<Site>): Promise<Site> {
    return this.request<Site>(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(site),
    });
  }

  async deleteSite(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/sites/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getSiteAnalytics(siteId: string): Promise<SiteAnalyticsDetail> {
    return this.request<SiteAnalyticsDetail>(`/sites/${siteId}/analytics`);
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }
}

export const api = new ApiClient();
