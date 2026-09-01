import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    getHeaders() {
      const auth = useAuthStore();
      return { Authorization: `Bearer ${auth.token}` };
    },

    async fetchCalendarData(start?: string, end?: string) {
      this.loading = true;
      try {
        const query = start && end ? `?start=${start}&end=${end}` : '';

        // Fetch in parallel
        const [taskRes, availRes, leaveRes] = await Promise.all([
          fetch(`http://localhost:3001/api/pm/calendar/tasks${query}`, {
            headers: this.getHeaders(),
          }),
          fetch(`http://localhost:3001/api/pm/calendar/availability${query}`, {
            headers: this.getHeaders(),
          }),
          fetch(`http://localhost:3001/api/pm/calendar/leave${query}`, {
            headers: this.getHeaders(),
          }),
        ]);

        const taskData = await taskRes.json();
        const availData = await availRes.json();
        const leaveData = await leaveRes.json();

        const allEvents = [];
        if (taskData.success) allEvents.push(...taskData.events);
        if (availData.success) allEvents.push(...availData.events);
        if (leaveData.success) allEvents.push(...leaveData.events);

        this.events = allEvents;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
