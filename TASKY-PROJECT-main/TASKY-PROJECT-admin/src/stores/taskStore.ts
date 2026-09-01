import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

interface Task {
  id: number | string;
  title: string;
  description: string;
  project_id: number;
  project_name: string;
  priority: string;
  status: string;
  deadline: string;
  progress: number;
  expected_effort: number;
  actual_effort: number;
  assignees: any[];
  is_visible: number;
  created_at: string;
  // Add alias properties for compatibility
  projectId?: number;
  expectedEffort?: number;
  assignedResources?: any[];
}

interface Project {
  id: number;
  name: string;
  color: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  role_name: string;
  employee_code: string;
}

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    currentRole: 'pm',
    currentEmployeeId: '',
    employees: [] as Employee[],
    projectsList: [] as Project[],
    tasks: [] as Task[],
    workLogs: [] as any[],
    loading: false,
    error: null as string | null,
    currentEmployeeData: null as any, // Store full employee data including max_hours_per_week
  }),
  getters: {
    employeeAnalytics: (state) => {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      if (!userId) return null;

      const empTasks = state.tasks.filter((t: Task) => {
        return t.assignees && t.assignees.some((a: any) => a.id === userId);
      });

      const completed = empTasks.filter((t: Task) => t.status === 'completed').length;
      const inProgress = empTasks.filter((t: Task) => t.status === 'in-progress').length;
      const notStarted = empTasks.filter((t: Task) => t.status === 'not-started').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const overdueTasks = empTasks.filter((t: Task) => {
        if (t.status === 'completed') return false;
        if (!t.deadline) return false;
        return new Date(t.deadline) < today;
      });

      const upcomingDeadlines = empTasks
        .filter((t: Task) => t.status !== 'completed' && t.deadline)
        .map((t: Task) => {
          const deadline = new Date(t.deadline);
          const daysUntil = Math.ceil(
            (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          return { task: t, daysUntil };
        })
        .filter((d: any) => d.daysUntil >= 0 && d.daysUntil <= 7)
        .sort((a: any, b: any) => a.daysUntil - b.daysUntil);

      // Calculate workload based on employee's actual max_hours_per_week
      const maxHoursPerWeek = state.currentEmployeeData?.max_hours_per_week || 40;
      const totalExpectedEffort = empTasks
        .filter((t: Task) => t.status !== 'completed')
        .reduce((acc: number, t: Task) => acc + (t.expected_effort || 0), 0);
      const workload = totalExpectedEffort; // Total hours for active tasks
      const utilization = (workload / maxHoursPerWeek) * 100;

      // Calculate hours logged from work logs
      const hoursLogged = state.workLogs
        .filter((l: any) => l.user_id === userId)
        .reduce((acc: number, log: any) => acc + (log.hours_spent || 0), 0);

      // Check if daily update is pending (no work log in last 24 hours for active tasks)
      const hasRecentWorkLog = state.workLogs.some((l: any) => {
        if (l.user_id !== userId) return false;
        const logDate = new Date(l.log_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return logDate >= yesterday;
      });
      const dailyUpdatePending =
        empTasks.some((t: Task) => t.status === 'in-progress') && !hasRecentWorkLog;

      return {
        totalTasks: empTasks.length,
        completedTasks: completed,
        pendingTasks: empTasks.length - completed,
        inProgressTasks: inProgress,
        notStartedTasks: notStarted,
        hoursLogged: hoursLogged,
        dailyUpdatePending: dailyUpdatePending,
        isOverloaded: utilization > 100,
        workload: workload,
        utilization: Math.round(utilization),
        maxHoursPerWeek: maxHoursPerWeek,
        overdueTasks: overdueTasks.length,
        upcomingDeadlines,
      };
    },
  },
  actions: {
    async fetchEmployees() {
      try {
        const authStore = useAuthStore();
        const response = await fetch('http://localhost:3001/api/users', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          this.employees = data.users;
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    },

    async fetchProjects() {
      try {
        const authStore = useAuthStore();
        const response = await fetch('http://localhost:3001/api/pm/projects', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          this.projectsList = data.projects;
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    },

    async fetchEmployeeTasks() {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      if (!userId) return;

      try {
        // Fetch employee data including max_hours_per_week
        const empResponse = await fetch(`http://localhost:3001/api/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        const empData = await empResponse.json();
        if (empData.success) {
          this.currentEmployeeData = empData.user;
        }

        // Fetch tasks
        const response = await fetch(`http://localhost:3001/api/tasks/employee/${userId}`);
        const data = await response.json();
        if (data.success) {
          this.tasks = data.tasks;
        }

        // Fetch work logs
        const logsResponse = await fetch(`http://localhost:3001/api/employee/work-logs/${userId}`);
        const logsData = await logsResponse.json();
        if (logsData.success) {
          this.workLogs = logsData.logs || [];
        }
      } catch (error) {
        console.error('Error fetching employee tasks:', error);
      }
    },

    switchRole(role: 'pm' | 'employee', empId?: string) {
      this.currentRole = role;
      if (empId) this.currentEmployeeId = empId;
    },

    getTasksByEmployee(empId: string) {
      return this.tasks.filter((t: Task) => {
        return t.assignees && t.assignees.some((a: any) => a.id === parseInt(empId));
      });
    },

    getWorkLogsByEmployee(empId: string) {
      return this.workLogs.filter((l: any) => l.employeeId === empId);
    },

    getProjectById(id: string | number) {
      return this.projectsList.find((p: Project) => p.id === parseInt(String(id)));
    },

    getTaskById(id: string | number) {
      return this.tasks.find((t: Task) => t.id === parseInt(String(id)));
    },

    getEmployeeById(id: string | number) {
      return this.employees.find((e: Employee) => e.id === parseInt(String(id)));
    },

    getProgressUpdatesByTask(taskId: string) {
      return this.workLogs
        .filter((l: any) => l.taskId === taskId)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    async addTask(taskData: any) {
      try {
        const authStore = useAuthStore();
        const response = await fetch('http://localhost:3001/api/employee/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            ...taskData,
            user_id: authStore.user?.id,
          }),
        });
        const data = await response.json();
        if (data.success) {
          this.tasks.push(data.task);
          return data.task;
        }
        throw new Error(data.error);
      } catch (error) {
        console.error('Error adding task:', error);
        throw error;
      }
    },

    async updateTask(taskId: number, updates: any) {
      try {
        const authStore = useAuthStore();
        const response = await fetch(`http://localhost:3001/api/employee/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (data.success) {
          const index = this.tasks.findIndex((t: Task) => t.id === taskId);
          if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...data.task };
          }
          return data.task;
        }
        throw new Error(data.error);
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    },

    async addWorkLog(logData: any) {
      try {
        const authStore = useAuthStore();
        const response = await fetch('http://localhost:3001/api/employee/work-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            ...logData,
            user_id: authStore.user?.id,
          }),
        });
        const data = await response.json();
        if (data.success) {
          this.workLogs.push(data.log);
          return data.log;
        }
        throw new Error(data.error);
      } catch (error) {
        console.error('Error adding work log:', error);
        throw error;
      }
    },

    async submitTaskForReview(taskId: number, completionComment: string, reviewerId: number) {
      try {
        const authStore = useAuthStore();
        const response = await fetch(
          `http://localhost:3001/api/employee/tasks/${taskId}/submit-review`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({
              completion_comment: completionComment,
              reviewer_id: reviewerId,
            }),
          },
        );
        const data = await response.json();
        if (data.success) {
          const index = this.tasks.findIndex((t: Task) => t.id === taskId);
          if (index !== -1) {
            (this.tasks[index] as any).status = 'in-review';
            (this.tasks[index] as any).progress = 100;
          }
          return data;
        }
        throw new Error(data.error);
      } catch (error) {
        console.error('Error submitting task for review:', error);
        throw error;
      }
    },

    async approveTaskReview(taskId: number, reviewComment: string) {
      try {
        const authStore = useAuthStore();
        const response = await fetch(
          `http://localhost:3001/api/employee/tasks/${taskId}/approve-review`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ review_comment: reviewComment }),
          },
        );
        const data = await response.json();
        if (data.success) {
          const index = this.tasks.findIndex((t: Task) => t.id === taskId);
          if (index !== -1) {
            (this.tasks[index] as any).status = 'completed';
            (this.tasks[index] as any).progress = 100;
          }
          return data;
        }
        throw new Error(data.error);
      } catch (error) {
        console.error('Error approving task review:', error);
        throw error;
      }
    },

    async requestTaskChanges(taskId: number, reviewComment: string) {
      try {
        const authStore = useAuthStore();
        const response = await fetch(
          `http://localhost:3001/api/employee/tasks/${taskId}/request-changes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ review_comment: reviewComment }),
          },
        );
        const data = await response.json();
        if (data.success) {
          const index = this.tasks.findIndex((t: Task) => t.id === taskId);
          if (index !== -1) {
            (this.tasks[index] as any).status = 'in-progress';
            (this.tasks[index] as any).progress = 75;
          }
          return data;
        }
        throw new Error(data.error);
      } catch (error) {
        console.error('Error requesting task changes:', error);
        throw error;
      }
    },

    async fetchPendingReviews(userId: number) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/employee/reviews/pending?user_id=${userId}`,
        );
        const data = await response.json();
        if (data.success) {
          return data.reviews;
        }
        return [];
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        return [];
      }
    },

    async fetchReviewHistory(userId: number) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/employee/reviews/history?user_id=${userId}`,
        );
        const data = await response.json();
        if (data.success) {
          return data.reviews;
        }
        return [];
      } catch (error) {
        console.error('Error fetching review history:', error);
        return [];
      }
    },
  },
});
