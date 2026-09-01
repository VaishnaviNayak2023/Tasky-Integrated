import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    overview: null as any,
    projectProgress: [] as any[],
    taskDistribution: null as any,
    resourceWorkload: [] as any[],
    deadlineRisks: [] as any[],
    projectPerformance: [] as any[],
    dailyLogCompliance: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    getHeaders() {
      const auth = useAuthStore();
      return { Authorization: `Bearer ${auth.token}` };
    },

    async fetchOverview() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/pm/analytics/overview', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) this.overview = data.overview;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchProjectProgress() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/analytics/project-progress', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) this.projectProgress = data.projects;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async fetchTaskDistribution() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/analytics/task-distribution', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.taskDistribution = {
            status: data.statusDistribution,
            priority: data.priorityDistribution,
            total: data.total,
          };
        }
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async fetchResourceWorkload() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/analytics/resource-workload', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) this.resourceWorkload = data.byProject;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async fetchDeadlineRisks() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/analytics/deadline-risks', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) this.deadlineRisks = data.risks;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async fetchProjectPerformance() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/analytics/project-performance', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) this.projectPerformance = data.projects;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async fetchDailyLogCompliance() {
      try {
        const response = await fetch(
          'http://localhost:3001/api/pm/analytics/daily-log-compliance',
          {
            headers: this.getHeaders(),
          },
        );
        const data = await response.json();
        if (data.success) this.dailyLogCompliance = data.compliance;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async loadAll() {
      this.loading = true;
      await Promise.all([
        this.fetchOverview(),
        this.fetchProjectProgress(),
        this.fetchTaskDistribution(),
        this.fetchResourceWorkload(),
        this.fetchDeadlineRisks(),
        this.fetchProjectPerformance(),
        this.fetchDailyLogCompliance(),
      ]);
      this.loading = false;
    },
  },
});
