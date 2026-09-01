import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.is_read).length,
  },

  actions: {
    getHeaders() {
      const auth = useAuthStore();
      return { Authorization: `Bearer ${auth.token}` };
    },

    async fetchNotifications() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:3001/api/pm/notifications', {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.notifications = data.notifications;
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id: string) {
      try {
        const response = await fetch(`http://localhost:3001/api/pm/notifications/${id}/read`, {
          method: 'PUT',
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          const n = this.notifications.find((n) => n.id == id);
          if (n) n.is_read = 1;
        }
      } catch (err: any) {
        console.error(err);
      }
    },

    async markAllAsRead() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/notifications/read-all', {
          method: 'PUT',
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.notifications.forEach((n) => (n.is_read = 1));
        }
      } catch (err: any) {
        console.error(err);
      }
    },
  },
});
