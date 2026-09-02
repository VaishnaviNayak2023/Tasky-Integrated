/**
 * Centralized API Client
 * Handles all HTTP requests with proper error handling, authentication, and configuration
 */
import { buildApiUrl, API_CONFIG } from '../constants/apiConfig';

/**
 * API Request options
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * API Response
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Get default headers for API requests
 */
function getDefaultHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Make an API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_CONFIG.TIMEOUT,
  } = options;
  
  const url = buildApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...getDefaultHeaders(),
        ...headers,
      },
      signal: controller.signal,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP error! status: ${response.status}`,
      };
    }
    
    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'An unknown error occurred',
    };
  }
}

/**
 * API Client with convenience methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },
  
  /**
   * POST request
   */
  post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
  },
  
  /**
   * PUT request
   */
  put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
  },
  
  /**
   * DELETE request
   */
  delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
  
  /**
   * PATCH request
   */
  patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
  },
};

/**
 * Specific API service modules
 */
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
  
  registerPM: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER_PM, data),
  
  registerEmployee: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER_EMPLOYEE, data),
  
  forgotPassword: (email: string) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
  
  logout: () =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
};

export const userService = {
  getAll: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.USERS.ALL),
  
  getById: (id: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.USERS.BY_ID(id)),
  
  getEmployees: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.USERS.EMPLOYEES),
};

export const projectService = {
  getList: (params?: any) =>
    apiClient.get(API_CONFIG.ENDPOINTS.PROJECTS.LIST, params),
  
  getById: (id: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id)),
  
  getDetails: (id: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.PROJECTS.DETAILS(id)),
  
  create: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.PROJECTS.CREATE, data),
  
  update: (id: string | number, data: any) =>
    apiClient.put(API_CONFIG.ENDPOINTS.PROJECTS.UPDATE(id), data),
  
  delete: (id: string | number) =>
    apiClient.delete(API_CONFIG.ENDPOINTS.PROJECTS.DELETE(id)),
};

export const taskService = {
  // PM Tasks
  getPmTasks: (params?: any) =>
    apiClient.get(API_CONFIG.ENDPOINTS.PM_TASKS.LIST, params),
  
  getPmTaskById: (id: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.PM_TASKS.BY_ID(id)),
  
  createPmTask: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.PM_TASKS.CREATE, data),
  
  updatePmTask: (id: string | number, data: any) =>
    apiClient.put(API_CONFIG.ENDPOINTS.PM_TASKS.UPDATE(id), data),
  
  deletePmTask: (id: string | number) =>
    apiClient.delete(API_CONFIG.ENDPOINTS.PM_TASKS.DELETE(id)),
  
  updateTaskProgress: (id: string | number, data: any) =>
    apiClient.put(API_CONFIG.ENDPOINTS.PM_TASKS.PROGRESS(id), data),
  
  assignTask: (id: string | number, data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.PM_TASKS.ASSIGN(id), data),
  
  finalizeReview: (id: string | number, data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.PM_TASKS.FINALIZE_REVIEW(id), data),
  
  // Employee Tasks
  getEmployeeTasks: (userId: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.BY_USER(userId)),
  
  createEmployeeTask: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.CREATE, data),
  
  updateEmployeeTask: (id: string | number, data: any) =>
    apiClient.put(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.UPDATE(id), data),
  
  submitForReview: (id: string | number, data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.SUBMIT_REVIEW(id), data),
  
  approveReview: (id: string | number, data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.APPROVE_REVIEW(id), data),
  
  requestChanges: (id: string | number, data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.REQUEST_CHANGES(id), data),
  
  getPendingReviews: (userId: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.PENDING_REVIEWS(userId)),
  
  getReviewHistory: (userId: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.EMPLOYEE_TASKS.REVIEW_HISTORY(userId)),
};

export const workLogService = {
  getByUser: (userId: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.WORK_LOGS.BY_USER(userId)),
  
  create: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.WORK_LOGS.CREATE, data),
  
  getCalendar: (userId: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.WORK_LOGS.CALENDAR(userId)),
};

export const resourceService = {
  getList: (params?: any) =>
    apiClient.get(API_CONFIG.ENDPOINTS.RESOURCES.LIST, params),
  
  getStats: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.RESOURCES.STATS),
  
  getById: (id: string | number) =>
    apiClient.get(API_CONFIG.ENDPOINTS.RESOURCES.BY_ID(id)),
  
  getConflicts: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.RESOURCES.CONFLICTS),
  
  getAvailability: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.RESOURCES.AVAILABILITY),
  
  rebalance: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.RESOURCES.REBALANCE, data),
};

export const analyticsService = {
  getOverview: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.OVERVIEW),
  
  getProjectProgress: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.PROJECT_PROGRESS),
  
  getTaskDistribution: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.TASK_DISTRIBUTION),
  
  getResourceWorkload: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.RESOURCE_WORKLOAD),
  
  getDeadlineRisks: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.DEADLINE_RISKS),
  
  getProjectPerformance: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.PROJECT_PERFORMANCE),
  
  getDailyLogCompliance: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.DAILY_LOG_COMPLIANCE),
};

export const dashboardService = {
  getStats: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.STATS),
  
  getAttention: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.ATTENTION),
  
  getDailyProgress: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.DAILY_PROGRESS),
};

export const calendarService = {
  getTasks: (params?: any) =>
    apiClient.get(API_CONFIG.ENDPOINTS.CALENDAR.TASKS, params),
  
  getAvailability: (params?: any) =>
    apiClient.get(API_CONFIG.ENDPOINTS.CALENDAR.AVAILABILITY, params),
  
  getLeave: (params?: any) =>
    apiClient.get(API_CONFIG.ENDPOINTS.CALENDAR.LEAVE, params),
};

export const notificationService = {
  getList: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST),
  
  markAsRead: (id: string | number) =>
    apiClient.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  
  markAllAsRead: () =>
    apiClient.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
};

export const orgService = {
  getDetails: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ORG.DETAILS),
  
  getInviteCodes: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.ORG.INVITE_CODES),
  
  createInviteCode: (data: any) =>
    apiClient.post(API_CONFIG.ENDPOINTS.ORG.CREATE_INVITE, data),
  
  deleteInviteCode: (id: string | number) =>
    apiClient.delete(API_CONFIG.ENDPOINTS.ORG.DELETE_INVITE(id)),
};
