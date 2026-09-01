/**
 * Performance Analytics API Service
 * 
 * Handles all API calls for the performance analytics module
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tasky_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
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
  return request<DashboardSummary>(`/api/performance/dashboard${params ? `?${params}` : ''}`);
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
  return request<TrendDataPoint[]>(`/api/performance/trends${params ? `?${params}` : ''}`);
}

// Time Allocation
export interface TimeAllocation {
  category: string;
  hours: number;
  percentage: number;
}

export async function getTimeAllocation(filters?: Record<string, any>): Promise<TimeAllocation[]> {
  const params = new URLSearchParams(filters).toString();
  return request<TimeAllocation[]>(`/api/performance/time-allocation${params ? `?${params}` : ''}`);
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
  return request<GoalProgress[]>(`/api/performance/goals${params ? `?${params}` : ''}`);
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
  return request<PerformanceInsight[]>(`/api/performance/insights${params ? `?${params}` : ''}`);
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
