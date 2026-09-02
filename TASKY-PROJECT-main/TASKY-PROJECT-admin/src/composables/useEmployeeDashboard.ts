import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { taskService, projectService, userService, workLogService } from '../services/apiClient';

/**
 * Composable for Employee Dashboard data fetching and business logic
 * Extracted from EmployeeDashboard.vue to make the page thin
 */
export function useEmployeeDashboard() {
  const authStore = useAuthStore();
  const taskStore = useTaskStore();

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

    analytics.value = {
      totalTasks: empTasks.length,
      completedTasks: completed,
      inProgressTasks: inProgress,
      notStartedTasks: notStarted,
      hoursLogged: hoursLogged,
      overdueTasks: overdueTasks.length,
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
      pendingReviews.value = await taskStore.fetchPendingReviews(Number(currentEmployee.value.id));
    }
  }

  /**
   * Load review history
   */
  async function loadReviewHistory() {
    if (currentEmployee.value?.id) {
      reviewHistory.value = await taskStore.fetchReviewHistory(Number(currentEmployee.value.id));
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
    getTaskById,
    getProjectById,
    getEmployeeById,
    getProgressUpdatesByTask,
  };
}
