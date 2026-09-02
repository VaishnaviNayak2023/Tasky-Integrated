/**
 * Performance Analytics API Service
 * 
 * Handles all API calls for the performance analytics module
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tasky_token');
  const user = JSON.parse(localStorage.getItem('tasky_user') || '{}');

  // Add userId to query parameters if not already present
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (!url.searchParams.has('userId') && user.id) {
    url.searchParams.append('userId', user.id);
  }

  console.log('API Request:', url.toString());

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  console.log('API Response:', response.status, response.statusText);

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = 'Request failed';

    if (contentType && contentType.includes('application/json')) {
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = 'Failed to parse error response';
      }
    } else {
      const text = await response.text();
      errorMessage = text || 'Request failed';
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON but received: ${text.substring(0, 100)}...`);
  }

  return response.json() as Promise<T>;
}

// Dashboard Summary
export interface DashboardSummary {
  productivityScore: number;
  completionRate: number;
  onTimeRate: number;
  focusScore: number;
}

export async function getDashboardSummary(filters?: Record<string, any>): Promise<DashboardSummary> {
  const params = new URLSearchParams(filters).toString();
  console.log('Fetching dashboard summary with params:', params);
  const response = await request<any>(`/api/performance/me${params ? `?${params}` : ''}`);
  console.log('Dashboard summary response:', response);

  // Map backend response to frontend interface
  return {
    productivityScore: parseFloat(response.kpis?.find((k: any) => k.id === 'productivity')?.value || 0),
    completionRate: parseFloat(response.kpis?.find((k: any) => k.id === 'completion_rate')?.value || 0),
    onTimeRate: parseFloat(response.kpis?.find((k: any) => k.id === 'on_time_rate')?.value || 0),
    focusScore: parseFloat(response.kpis?.find((k: any) => k.id === 'focus_score')?.value || 0),
  };
}

// Productivity Trend
export interface TrendDataPoint {
  period: string;
  assigned: number;
  completed: number;
  delayed: number;
}

export async function getProductivityTrend(filters?: Record<string, any>): Promise<TrendDataPoint[]> {
  const params = new URLSearchParams(filters).toString();
  try {
    const response = await request<any>(`/api/performance/me/trends${params ? `?${params}` : ''}`);

    // Map backend response to frontend interface
    return response.data?.map((item: any) => ({
      period: item.period,
      assigned: item.assigned,
      completed: item.completed,
      delayed: item.blocked_tasks || 0,
    })) || [];
  } catch (error) {
    console.error('Failed to fetch productivity trend:', error);
    return [];
  }
}

// Time Allocation
export interface TimeAllocation {
  category: string;
  hours: number;
  percentage: number;
}

export async function getTimeAllocation(filters?: Record<string, any>): Promise<TimeAllocation[]> {
  const params = new URLSearchParams(filters).toString();
  try {
    const response = await request<any>(`/api/performance/me/time-allocation${params ? `?${params}` : ''}`);

    // Map backend response to frontend interface
    return response.data?.map((item: any) => ({
      category: item.category,
      hours: item.hours,
      percentage: item.percentage,
    })) || [];
  } catch (error) {
    console.error('Failed to fetch time allocation:', error);
    return [];
  }
}

// Goal Progress
export interface GoalProgress {
  id: string;
  goalName: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  status: string;
  percentage: number;
}

export async function getGoalProgress(filters?: Record<string, any>): Promise<GoalProgress[]> {
  const params = new URLSearchParams(filters).toString();
  try {
    const response = await request<any>(`/api/performance/me/goals${params ? `?${params}` : ''}`);

    // Map backend response to frontend interface
    return response.map((item: any) => ({
      id: item.id,
      goalName: item.name,
      goalType: item.type,
      targetValue: parseFloat(item.targetValue),
      currentValue: parseFloat(item.currentValue),
      status: item.status,
      percentage: item.progress || 0,
    })) || [];
  } catch (error) {
    console.error('Failed to fetch goal progress:', error);
    return [];
  }
}

// Performance Insights
export interface PerformanceInsight {
  type: 'strongest_area' | 'weakest_area' | 'trend_change' | 'consistency' | 'recommendation';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionable: boolean;
}

export async function getPerformanceInsights(filters?: Record<string, any>): Promise<PerformanceInsight[]> {
  const params = new URLSearchParams(filters).toString();
  const response = await request<any>(`/api/performance/me/insights${params ? `?${params}` : ''}`);

  // Map backend response to frontend interface
  return response.map((item: any) => ({
    type: item.type,
    title: item.title,
    description: item.description,
    priority: item.priority,
    actionable: item.actionability !== 'Long-Term Development',
  })) || [];
}

// Detailed Priority Report
export interface PriorityMetrics {
  priority: string;
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
  completionRate: number;
  avgCompletionTime: number;
}

export async function getPriorityReport(filters?: Record<string, any>): Promise<PriorityMetrics[]> {
  const params = new URLSearchParams(filters).toString();
  return request<PriorityMetrics[]>(`/api/performance/priority-report${params ? `?${params}` : ''}`);
}

// Priority Trend
export interface PriorityTrendData {
  period: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export async function getPriorityTrend(filters?: Record<string, any>): Promise<PriorityTrendData[]> {
  const params = new URLSearchParams(filters).toString();
  return request<PriorityTrendData[]>(`/api/performance/priority-trend${params ? `?${params}` : ''}`);
}

// Tasks by Priority
export interface TaskByPriority {
  id: string;
  name: string;
  project: string;
  assignee: string;
  priority: string;
  status: string;
  createdAt: string;
  dueDate: string;
  completionTime: number | null;
}

export async function getTasksByPriority(filters?: Record<string, any>): Promise<TaskByPriority[]> {
  const params = new URLSearchParams(filters).toString();
  return request<TaskByPriority[]>(`/api/performance/tasks-by-priority${params ? `?${params}` : ''}`);
}

// Export Report
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeCharts: boolean;
  includeInsights: boolean;
  includeFilters: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export async function exportReport(options: ExportOptions, filters?: Record<string, any>): Promise<Blob> {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE_URL}/api/performance/export${params ? `?${params}` : ''}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('tasky_token')}`,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Export failed');
  }

  return response.blob();
}

// Saved Filter Presets
export interface FilterPreset {
  id: string;
  name: string;
  pageType: string;
  isDefault: boolean;
  isFavorite: boolean;
  isShared: boolean;
  filterJson: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export async function getFilterPresets(pageType: string): Promise<FilterPreset[]> {
  return request<FilterPreset[]>(`/api/performance/filter-presets?pageType=${pageType}`);
}

export async function createFilterPreset(preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>): Promise<FilterPreset> {
  return request<FilterPreset>('/api/performance/filter-presets', {
    method: 'POST',
    body: JSON.stringify(preset),
  });
}

export async function updateFilterPreset(id: string, preset: Partial<FilterPreset>): Promise<FilterPreset> {
  return request<FilterPreset>(`/api/performance/filter-presets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(preset),
  });
}

export async function deleteFilterPreset(id: string): Promise<void> {
  return request<void>(`/api/performance/filter-presets/${id}`, {
    method: 'DELETE',
  });
}

// Metadata APIs for dynamic dropdowns
export async function getPriorities(): Promise<string[]> {
  return request<string[]>('/api/metadata/priorities');
}

export async function getStatuses(): Promise<string[]> {
  return request<string[]>('/api/metadata/statuses');
}

export async function getProjects(): Promise<Array<{ id: string; name: string }>> {
  return request<Array<{ id: string; name: string }>>('/api/metadata/projects');
}

export async function getTeams(): Promise<Array<{ id: string; name: string }>> {
  return request<Array<{ id: string; name: string }>>('/api/metadata/teams');
}

export async function getAssignees(): Promise<Array<{ id: string; name: string; employeeCode: string }>> {
  return request<Array<{ id: string; name: string; employeeCode: string }>>('/api/metadata/assignees');
}
