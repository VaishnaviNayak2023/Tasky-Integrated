import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/LandingPage.vue'),
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: '', redirect: '/auth/login' },
      { path: 'login', component: () => import('@/pages/auth/Login.vue') },
      { path: 'register/pm', component: () => import('@/pages/auth/RegisterPM.vue') },
      { path: 'register/employee', component: () => import('@/pages/auth/RegisterEmployee.vue') },
      { path: 'forgot-password', component: () => import('@/pages/auth/ForgotPassword.vue') },
      { path: 'reset-password', component: () => import('@/pages/auth/ResetPassword.vue') },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/PMLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/pages/ProjectManagerPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'projects',
        component: () => import('@/pages/ProjectsPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'tasks',
        component: () => import('@/pages/TasksPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'resources',
        component: () => import('@/pages/ResourcesPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'analytics',
        component: () => import('@/pages/AnalyticsPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'calendar',
        component: () => import('@/pages/CalendarPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'organisation',
        component: () => import('@/pages/OrganisationPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'notifications',
        component: () => import('@/pages/NotificationsPage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'performance',
        component: () => import('@/pages/MyPerformancePage.vue'),
        meta: { requiresRole: 'pm' },
      },
      {
        path: 'performance/priority-report',
        component: () => import('@/pages/DetailedPriorityReportPage.vue'),
        meta: { requiresRole: 'pm' },
      },
    ],
  },
  {
    path: '/employee',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/pages/EmployeeDashboard.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'my-tasks',
        component: () => import('@/pages/MyTasks.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'work-log',
        component: () => import('@/pages/WorkLog.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'notifications',
        component: () => import('@/pages/NotificationsPage.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'task-manager',
        component: () => import('@/pages/EmployeeTaskManager.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'planner',
        component: () => import('@/pages/EmployeePlanner.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'daily-tracker',
        component: () => import('@/pages/DailyTracker.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'performance',
        component: () => import('@/pages/MyPerformancePage.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'performance/priority-report',
        component: () => import('@/pages/DetailedPriorityReportPage.vue'),
        meta: { requiresRole: 'employee' },
      },
      {
        path: 'reviews',
        component: () => import('@/pages/EmployeeReviewsPage.vue'),
        meta: { requiresRole: 'employee' },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
