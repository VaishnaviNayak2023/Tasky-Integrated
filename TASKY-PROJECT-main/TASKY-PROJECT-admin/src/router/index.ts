import { defineRouter } from '#q-app';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useAuthStore } from '@/stores/authStore';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  // Navigation guards
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // Initialize auth state from localStorage
    authStore.initializeAuth();

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresRole = to.meta.requiresRole as 'pm' | 'employee' | undefined;

    // Allow landing page and auth routes to be accessible without authentication
    if (to.path === '/' || to.path.startsWith('/auth')) {
      next();
      return;
    }

    if (requiresAuth && !authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next('/auth/login');
    } else if (requiresRole && authStore.userRole !== requiresRole) {
      // Redirect to appropriate dashboard based on role
      if (authStore.userRole === 'pm') {
        next('/dashboard');
      } else if (authStore.userRole === 'employee') {
        next('/dashboard/employee-dashboard');
      } else {
        next('/auth/login');
      }
    } else if (to.path === '/auth/login' && authStore.isAuthenticated) {
      // Redirect authenticated users away from login
      if (authStore.userRole === 'pm') {
        next('/dashboard');
      } else {
        // Redirect employees to separate employee 2 project
        window.location.href = 'http://localhost:9004/';
      }
    } else {
      next();
    }
  });
  return Router;
});
