import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

export const usePmTaskStore = defineStore('pmTask', {
  state: () => ({
    tasks: [] as any[],
    currentTask: null as any | null,
    stats: {
      notStarted: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      blocked: 0,
    },
    loading: false,
    error: null as string | null,
  }),

  actions: {
    getHeaders() {
      const auth = useAuthStore();
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      };
    },

    async fetchTasks(filters = {}) {
      this.loading = true;
      try {
        const queryParams = new URLSearchParams(filters as any).toString();
        const response = await fetch(`http://localhost:3001/api/pm/tasks?${queryParams}`, {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.tasks = data.tasks;
          if (data.stats) this.stats = data.stats;
        } else {
          this.error = data.error;
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchTaskById(id: string) {
      this.loading = true;
      try {
        const response = await fetch(`http://localhost:3001/api/pm/tasks/${id}`, {
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.currentTask = data.task;
        } else {
          this.error = data.error;
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async createTask(taskData: any) {
      try {
        const response = await fetch('http://localhost:3001/api/pm/tasks', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (data.success) {
          this.tasks.push(data.task);
          return data.task;
        }
        throw new Error(data.error);
      } catch (err: any) {
        throw err;
      }
    },

    async updateTask(id: string, updates: any) {
      try {
        const response = await fetch(`http://localhost:3001/api/pm/tasks/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (data.success) {
          const index = this.tasks.findIndex((t) => t.id == id);
          if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...data.task };
          }
          if (this.currentTask && this.currentTask.id == id) {
            this.currentTask = { ...this.currentTask, ...data.task };
          }
          return data.task;
        }
        throw new Error(data.error);
      } catch (err: any) {
        throw err;
      }
    },

    async deleteTask(id: number | string) {
      try {
        const response = await fetch(`http://localhost:3001/api/pm/tasks/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
        const data = await response.json();
        if (data.success) {
          this.tasks = this.tasks.filter((t) => t.id != id);
          if (this.currentTask && this.currentTask.id == id) {
            this.currentTask = null;
          }
          return true;
        }
        throw new Error(data.error || 'Failed to delete task');
      } catch (err: any) {
        console.error('Delete task error:', err);
        throw err;
      }
    },

    async refresh() {
      await this.fetchTasks();
    },

    async adjustProgress(id: string, progress: number, notes?: string) {
      try {
        const response = await fetch(`http://localhost:3001/api/pm/tasks/${id}/progress`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ progress, notes }),
        });
        const data = await response.json();
        if (data.success) {
          // Optimistically update
          const task = this.tasks.find((t) => t.id == id);
          if (task) task.progress = progress;
          if (this.currentTask && this.currentTask.id == id) this.currentTask.progress = progress;
          return true;
        }
        throw new Error(data.error);
      } catch (err: any) {
        throw err;
      }
    },

    async assignResource(taskId: string, userIds: string[]) {
      try {
        const response = await fetch(`http://localhost:3001/api/pm/tasks/${taskId}/assign`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ user_ids: userIds }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return true;
      } catch (err: any) {
        throw err;
      }
    },
  },
});
