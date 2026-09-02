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
      const token = auth.token || localStorage.getItem('tasky_token');
      return { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
    },

    async fetchNotifications() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('http://localhost:3001/api/pm/notifications', {
          headers: this.getHeaders(),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          this.notifications = data.notifications || [];
        } else {
          this.error = data.error || 'Failed to fetch notifications';
        }
      } catch (err: any) {
        this.error = err.message;
        console.error('Fetch notifications error:', err);
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
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          const n = this.notifications.find((n) => n.id == id);
          if (n) n.is_read = 1;
        } else {
          console.error('Mark as read failed:', data.error);
        }
      } catch (err: any) {
        console.error('Mark as read error:', err);
      }
    },

    async markAllAsRead() {
      try {
        const response = await fetch('http://localhost:3001/api/pm/notifications/read-all', {
          method: 'PUT',
          headers: this.getHeaders(),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          this.notifications.forEach((n) => (n.is_read = 1));
        } else {
          console.error('Mark all as read failed:', data.error);
        }
      } catch (err: any) {
        console.error('Mark all as read error:', err);
      }
    },
  },
});
