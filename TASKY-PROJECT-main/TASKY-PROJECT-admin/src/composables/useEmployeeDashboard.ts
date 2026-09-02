import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { useQuasar } from 'quasar';
import { taskService, projectService, userService, workLogService } from '../services/apiClient';

/**
 * Composable for Employee Dashboard data fetching and business logic
 * Extracted from EmployeeDashboard.vue to make the page thin
 */
export function useEmployeeDashboard() {
  const authStore = useAuthStore();
  const taskStore = useTaskStore();
  const $q = useQuasar();

  // Direct database storage
  const myTasks = ref<any[]>([]);
  const projectsList = ref<any[]>([]);
  const employees = ref<any[]>([]);
  const workLogs = ref<any[]>([]);
  const analytics = ref<any>(null);
  const userPoints = ref(100);
  const showPointsNotification = ref(false);
  const pointsNotificationMessage = ref('');
  const pendingReviews = ref<any[]>([]);
  const reviewHistory = ref<any[]>([]);

  const currentEmployee = computed(() => authStore.user);

  /**
   * Fetch all required data from database
   */
  async function fetchFromDatabase() {
    if (!currentEmployee.value?.id) return;

    try {
      // Fetch tasks using API service
      const tasksResponse = await taskService.getEmployeeTasks(currentEmployee.value.id);
      if (tasksResponse.success) {
        myTasks.value = tasksResponse.data || [];
      }

      // Fetch projects using API service
      const projectsResponse = await projectService.getList();
      if (projectsResponse.success) {
        projectsList.value = projectsResponse.data || [];
      }

      // Fetch employees using API service
      const employeesResponse = await userService.getEmployees();
      if (employeesResponse.success) {
        employees.value = employeesResponse.data || [];
      }

      // Fetch work logs using API service
      const logsResponse = await workLogService.getByUser(currentEmployee.value.id);
      if (logsResponse.success) {
        workLogs.value = logsResponse.data || [];
      }

      // Fetch user points using API service
      const userResponse = await userService.getById(currentEmployee.value.id);
      if (userResponse.success && userResponse.data) {
        userPoints.value = userResponse.data.points || 0;
      }

      // Calculate analytics from database data
      calculateAnalytics();
    } catch (error) {
      console.error('Error fetching from database:', error);
    }
  }

  /**
   * Calculate analytics from fetched data
   */
  function calculateAnalytics() {
    const empTasks = myTasks.value;
    // Filter completed tasks to only show those with completed reviews
    const completedWithReview = empTasks.filter(
      (t: any) =>
        t.status === 'completed' &&
        reviewHistory.value.some(
          (r: any) => r.task_id === t.id && (r.status === 'review-done' || r.status === 'finalized'),
        ),
    ).length;
    const completed = completedWithReview;
    const inProgress = empTasks.filter((t: any) => t.status === 'in-progress').length;
    const notStarted = empTasks.filter((t: any) => t.status === 'not-started').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = empTasks.filter((t: any) => {
      if (t.status === 'completed') return false;
      if (!t.deadline) return false;
      return new Date(t.deadline) < today;
    });

    const hoursLogged = workLogs.value.reduce(
      (acc: number, log: any) => acc + (log.hours_spent || 0),
      0,
    );

    // Calculate workload
    const workload = empTasks.reduce((acc: number, t: any) => {
      const effort = t.expected_effort || 8;
      const progress = t.progress || 0;
      return acc + (effort * (100 - progress) / 100);
    }, 0);

    const isOverloaded = workload > 40; // 40 hours per week threshold

    // Calculate upcoming deadlines
    const upcomingDeadlines = empTasks
      .filter((t: any) => t.status !== 'completed' && t.deadline)
      .map((t: any) => {
        const deadline = new Date(t.deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { task: t, daysUntil };
      })
      .filter((item: any) => item.daysUntil >= 0)
      .sort((a: any, b: any) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    // Check daily update pending
    const todayStr = today.toISOString().split('T')[0];
    const dailyUpdatePending = !workLogs.value.some((log: any) => log.log_date === todayStr);

    analytics.value = {
      totalTasks: empTasks.length,
      completedTasks: completed,
      inProgressTasks: inProgress,
      notStartedTasks: notStarted,
      hoursLogged: hoursLogged,
      overdueTasks: overdueTasks.length,
      workload: workload,
      isOverloaded: isOverloaded,
      upcomingDeadlines: upcomingDeadlines,
      dailyUpdatePending: dailyUpdatePending,
    };
  }

  /**
   * Get recent work logs
   */
  const recentWorkLogs = computed(() => {
    const sorted = [...workLogs.value].sort(
      (a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
    );
    return sorted.slice(0, 5);
  });

  /**
   * Load pending reviews
   */
  async function loadPendingReviews() {
    if (currentEmployee.value?.id) {
      const response = await taskService.getPendingReviews(currentEmployee.value.id);
      if (response.success) {
        pendingReviews.value = response.data || [];
      }
    }
  }

  /**
   * Load review history
   */
  async function loadReviewHistory() {
    if (currentEmployee.value?.id) {
      const response = await taskService.getReviewHistory(currentEmployee.value.id);
      if (response.success) {
        reviewHistory.value = response.data || [];
      }
    }
  }

  /**
   * Create self-assigned task
   */
  async function createSelfAssignedTask(taskData: any) {
    if (!currentEmployee.value?.id) return false;

    try {
      const payload = {
        ...taskData,
        assignee_ids: [currentEmployee.value.id],
        created_by: currentEmployee.value.id,
      };

      const response = await taskService.createEmployeeTask(payload);
      if (response.success) {
        $q.notify({ type: 'positive', message: 'Task created successfully' });
        await fetchFromDatabase();
        return true;
      } else {
        $q.notify({ type: 'negative', message: response.error || 'Failed to create task' });
        return false;
      }
    } catch (error: any) {
      $q.notify({ type: 'negative', message: error.message || 'Error creating task' });
      return false;
    }
  }

  /**
   * Update task progress
   */
  async function updateTaskProgress(taskId: string | number, progress: number, status: string, hoursSpent: number) {
    try {
      const response = await taskService.updateEmployeeTask(taskId, {
        progress,
        status,
      });

      if (response.success) {
        // Create work log entry
        if (hoursSpent > 0) {
          await workLogService.create({
            task_id: taskId,
            user_id: currentEmployee.value?.id,
            log_date: new Date().toISOString().split('T')[0],
            hours_spent: hoursSpent,
            status: 'completed',
          });
        }

        $q.notify({ type: 'positive', message: 'Progress updated successfully' });
        await fetchFromDatabase();
        return true;
      } else {
        $q.notify({ type: 'negative', message: response.error || 'Failed to update progress' });
        return false;
      }
    } catch (error: any) {
      $q.notify({ type: 'negative', message: error.message || 'Error updating progress' });
      return false;
    }
  }

  /**
   * Submit task for review
   */
  async function submitForReview(taskId: string | number, completionComment: string, reviewerId: number | null) {
    try {
      const response = await taskService.submitForReview(taskId, {
        completion_comment: completionComment,
        reviewer_id: reviewerId,
      });

      if (response.success) {
        $q.notify({ type: 'positive', message: 'Task submitted for review' });
        await fetchFromDatabase();
        await loadReviewHistory();
        return true;
      } else {
        $q.notify({ type: 'negative', message: response.error || 'Failed to submit for review' });
        return false;
      }
    } catch (error: any) {
      $q.notify({ type: 'negative', message: error.message || 'Error submitting for review' });
      return false;
    }
  }

  /**
   * Approve review
   */
  async function approveReview(taskId: string | number, reviewComment: string) {
    try {
      const response = await taskService.approveReview(taskId, {
        review_comment: reviewComment,
      });

      if (response.success) {
        $q.notify({ type: 'positive', message: 'Review approved' });
        await fetchFromDatabase();
        await loadPendingReviews();
        return true;
      } else {
        $q.notify({ type: 'negative', message: response.error || 'Failed to approve review' });
        return false;
      }
    } catch (error: any) {
      $q.notify({ type: 'negative', message: error.message || 'Error approving review' });
      return false;
    }
  }

  /**
   * Request changes on review
   */
  async function requestChanges(taskId: string | number, reviewComment: string) {
    try {
      const response = await taskService.requestChanges(taskId, {
        review_comment: reviewComment,
      });

      if (response.success) {
        $q.notify({ type: 'positive', message: 'Changes requested' });
        await fetchFromDatabase();
        await loadPendingReviews();
        return true;
      } else {
        $q.notify({ type: 'negative', message: response.error || 'Failed to request changes' });
        return false;
      }
    } catch (error: any) {
      $q.notify({ type: 'negative', message: error.message || 'Error requesting changes' });
      return false;
    }
  }

  /**
   * Helper functions
   */
  function getTaskById(id: string | number) {
    return myTasks.value.find((t: any) => t.id === id);
  }

  function getProjectById(id: string | number) {
    return projectsList.value.find((p: any) => p.id === id);
  }

  function getEmployeeById(id: string | number) {
    const emp = employees.value.find((e: any) => e.id === id);
    if (emp) {
      return {
        ...emp,
        name: `${emp.first_name} ${emp.last_name}`,
      };
    }
    return null;
  }

  function getProgressUpdatesByTask(taskId: string | number) {
    return workLogs.value.filter((l: any) => l.task_id === taskId);
  }

  onMounted(async () => {
    await fetchFromDatabase();
    loadPendingReviews();
    loadReviewHistory();
  });

  return {
    // State
    myTasks,
    projectsList,
    employees,
    workLogs,
    analytics,
    userPoints,
    showPointsNotification,
    pointsNotificationMessage,
    pendingReviews,
    reviewHistory,
    currentEmployee,
    recentWorkLogs,

    // Functions
    fetchFromDatabase,
    calculateAnalytics,
    loadPendingReviews,
    loadReviewHistory,
    createSelfAssignedTask,
    updateTaskProgress,
    submitForReview,
    approveReview,
    requestChanges,
    getTaskById,
    getProjectById,
    getEmployeeById,
    getProgressUpdatesByTask,
  };
}
