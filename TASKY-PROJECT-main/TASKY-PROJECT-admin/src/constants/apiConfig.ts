/**
 * API Configuration
 * Centralized API endpoints and configuration
 * Should be environment-specific in production
 */
export const API_CONFIG = {
  // API Base URL - should be environment-specific
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER_PM: '/auth/register-pm',
      REGISTER_EMPLOYEE: '/auth/register-employee',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      LOGOUT: '/auth/logout',
    },
    
    // Users
    USERS: {
      ALL: '/users/all',
      BY_ID: (id: string | number) => `/users/${id}`,
      EMPLOYEES: '/users',
    },
    
    // Projects
    PROJECTS: {
      LIST: '/pm/projects',
      BY_ID: (id: string | number) => `/pm/projects/${id}`,
      DETAILS: (id: string | number) => `/pm/projects/${id}/details`,
      CREATE: '/pm/projects',
      UPDATE: (id: string | number) => `/pm/projects/${id}`,
      DELETE: (id: string | number) => `/pm/projects/${id}`,
    },
    
    // Tasks (PM)
    PM_TASKS: {
      LIST: '/pm/tasks',
      BY_ID: (id: string | number) => `/pm/tasks/${id}`,
      CREATE: '/pm/tasks',
      UPDATE: (id: string | number) => `/pm/tasks/${id}`,
      DELETE: (id: string | number) => `/pm/tasks/${id}`,
      PROGRESS: (id: string | number) => `/pm/tasks/${id}/progress`,
      ASSIGN: (id: string | number) => `/pm/tasks/${id}/assign`,
      FINALIZE_REVIEW: (id: string | number) => `/pm/tasks/${id}/finalize-review`,
    },
    
    // Tasks (Employee)
    EMPLOYEE_TASKS: {
      BY_USER: (userId: string | number) => `/tasks/employee/${userId}`,
      CREATE: '/employee/tasks',
      UPDATE: (id: string | number) => `/employee/tasks/${id}`,
      SUBMIT_REVIEW: (id: string | number) => `/employee/tasks/${id}/submit-review`,
      APPROVE_REVIEW: (id: string | number) => `/employee/reviews/${id}/complete`,
      REQUEST_CHANGES: (id: string | number) => `/employee/tasks/${id}/request-changes`,
      PENDING_REVIEWS: (userId: string | number) => `/employee/reviews/pending?user_id=${userId}`,
      REVIEW_HISTORY: (userId: string | number) => `/employee/reviews/history?user_id=${userId}`,
    },
    
    // Work Logs
    WORK_LOGS: {
      BY_USER: (userId: string | number) => `/employee/work-logs/${userId}`,
      CREATE: '/employee/work-log',
      CALENDAR: (userId: string | number) => `/employee/work-logs/${userId}/calendar`,
    },
    
    // Resources
    RESOURCES: {
      LIST: '/pm/resources',
      STATS: '/pm/resources/stats',
      BY_ID: (id: string | number) => `/pm/resources/${id}`,
      CONFLICTS: '/pm/resources/conflicts',
      AVAILABILITY: '/pm/resources/availability',
      REBALANCE: '/pm/resources/rebalance',
    },
    
    // Analytics
    ANALYTICS: {
      OVERVIEW: '/pm/analytics/overview',
      PROJECT_PROGRESS: '/pm/analytics/project-progress',
      TASK_DISTRIBUTION: '/pm/analytics/task-distribution',
      RESOURCE_WORKLOAD: '/pm/analytics/resource-workload',
      DEADLINE_RISKS: '/pm/analytics/deadline-risks',
      PROJECT_PERFORMANCE: '/pm/analytics/project-performance',
      DAILY_LOG_COMPLIANCE: '/pm/analytics/daily-log-compliance',
    },
    
    // Dashboard
    DASHBOARD: {
      STATS: '/pm/dashboard/stats',
      ATTENTION: '/pm/dashboard/attention',
      DAILY_PROGRESS: '/pm/dashboard/daily-progress',
    },
    
    // Calendar
    CALENDAR: {
      TASKS: '/pm/calendar/tasks',
      AVAILABILITY: '/pm/calendar/availability',
      LEAVE: '/pm/calendar/leave',
    },
    
    // Notifications
    NOTIFICATIONS: {
      LIST: '/pm/notifications',
      MARK_READ: (id: string | number) => `/pm/notifications/${id}/read`,
      MARK_ALL_READ: '/pm/notifications/read-all',
    },
    
    // Organization
    ORG: {
      DETAILS: '/pm/org',
      INVITE_CODES: '/pm/org/invite-codes',
      CREATE_INVITE: '/pm/org/invite-code',
      DELETE_INVITE: (id: string | number) => `/pm/org/invite-code/${id}`,
    },
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
} as const;

/**
 * Build full API URL for an endpoint
 */
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return API_CONFIG.BASE_URL;
}
