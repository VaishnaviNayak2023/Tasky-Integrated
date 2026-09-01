import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export const useResourceStore = defineStore('resource', {
  state: () => ({
    resources: [] as any[],
    currentResource: null as any | null,
    conflicts: [] as any[],
    availability: {
      available: [],
      unavailable: [],
      counts: { available: 0, unavailable: 0 },
    },
    stats: {
      totalResources: 0,
      overloaded: 0,
      avgUtilization: 0,
    },
    loading: false,
    error: null as string | null,
  }),

  getters: {
    overloadedResources: (state) =>
      state.resources.filter((r) => r.workload_status === 'overloaded'),
  },

  actions: {
    getHeaders() {
      const auth = useAuthStore();
      const token = auth.token || localStorage.getItem('tasky_token');
      console.log('ResourceStore getHeaders - token exists:', !!token);
      return { Authorization: `Bearer ${token}` };
    },

    async fetchResources(search = '') {
      this.loading = true;
      this.error = null;
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const headers = this.getHeaders();
        console.log('Fetching resources from:', `http://localhost:3001/api/pm/resources${query}`);
        console.log('Headers:', headers);
        const response = await fetch(`http://localhost:3001/api/pm/resources${query}`, {
          headers: headers,
        });
        const data = await response.json();
        console.log('Resources API response:', data);
        if (data.success) {
          this.resources = data.resources;
          console.log('Resources set in store:', this.resources.length, 'items');
        } else {
          this.error = data.error;
          console.error('Resources API error:', data.error);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Resources fetch exception:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('http://localhost:3001/api/pm/resources/stats', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        console.log('Resources stats API response:', data);
        if (data.success) {
          this.stats = data.stats;
          console.log('Stats set in store:', this.stats);
        } else {
          this.error = data.error;
          console.error('Resources stats API error:', data.error);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Resources stats fetch exception:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchResourceById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        console.log('Fetching resource by ID:', id);
        const response = await fetch(`http://localhost:3001/api/pm/resources/${id}`, {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        console.log('Resource by ID response:', data);
        if (data.success) {
          this.currentResource = data.resource;
        } else {
          this.error = data.error;
          console.error('Resource by ID error:', data.error);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Resource by ID exception:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchConflicts() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Fetching conflicts from:', 'http://localhost:3001/api/pm/resources/conflicts');
        const response = await fetch('http://localhost:3001/api/pm/resources/conflicts', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        console.log('Conflicts API response:', data);
        if (data.success) {
          this.conflicts = data.conflicts;
        } else {
          this.error = data.error;
          console.error('Conflicts API error:', data.error);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Conflicts fetch exception:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchAvailability() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Fetching availability from:', 'http://localhost:3001/api/pm/resources/availability');
        const response = await fetch('http://localhost:3001/api/pm/resources/availability', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        console.log('Availability API response:', data);
        if (data.success) {
          this.availability = {
            available: data.available,
            unavailable: data.unavailable,
            counts: data.counts,
          };
        } else {
          this.error = data.error;
          console.error('Availability API error:', data.error);
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Availability fetch exception:', err);
      } finally {
        this.loading = false;
      }
    },

    async rebalanceWorkloads() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/pm/resources/rebalance', {
          method: 'POST',
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          // Re-fetch everything to update UI
          await this.fetchResources();
          await this.fetchConflicts();
          await this.fetchAvailability();
          return data;
        } else {
          this.error = data.error;
          throw new Error(data.error);
        }
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
