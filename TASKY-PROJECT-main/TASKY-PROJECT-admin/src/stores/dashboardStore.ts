import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      atRiskProjects: 0,
      overloadedResources: 0,
      overdueTasks: 0,
      pendingReviews: 0,
    },
    attentionItems: {
      delayedProjects: [] as any[],
      overloadedResources: [] as any[],
      overdueTasks: [] as any[],
    },
    dailyProgress: [] as any[],
    users: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    getHeaders() {
      const auth = useAuthStore();
      return { Authorization: `Bearer ${auth.token}` };
    },

    async fetchDashboardStats() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/pm/dashboard/stats', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.stats = data.stats;
        } else {
          this.error = data.error;
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchAttentionItems() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/pm/dashboard/attention', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.attentionItems = data.attention;
        } else {
          this.error = data.error;
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchDailyProgress() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/pm/dashboard/daily-progress', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.dailyProgress = data.logs;
        } else {
          this.error = data.error;
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/users/all', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        console.log('Fetch users response:', data);
        if (data.success) {
          this.users = data.users;
          console.log('Users set in store:', this.users);
        } else {
          this.error = data.error;
          console.error('Fetch users error:', data.error);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Fetch users exception:', err);
      } finally {
        this.loading = false;
      }
    },

    async loadAll() {
      await Promise.all([
        this.fetchDashboardStats(),
        this.fetchAttentionItems(),
        this.fetchDailyProgress(),
        this.fetchUsers(),
      ]);
    },
  },
});
