/**
 * Performance Store
 * 
 * Responsibilities:
 * - Dashboard data
 * - KPI cards
 * - Insights
 * - Goals
 * - Trends
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as performanceApi from '@/services/performance/performanceApi';
import type {
  DashboardSummary,
  TrendDataPoint,
  TimeAllocation,
  GoalProgress,
  PerformanceInsight,
} from '@/services/performance/performanceApi';

export const usePerformanceStore = defineStore('performance', () => {
  // State
  const dashboardSummary = ref<DashboardSummary | null>(null);
  const productivityTrend = ref<TrendDataPoint[]>([]);
  const timeAllocation = ref<TimeAllocation[]>([]);
  const goalProgress = ref<GoalProgress[]>([]);
  const performanceInsights = ref<PerformanceInsight[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentFilters = ref<Record<string, any>>({});

  // Computed
  const productivityScore = computed(() => dashboardSummary.value?.productivityScore ?? 0);
  const completionRate = computed(() => dashboardSummary.value?.completionRate ?? 0);
  const onTimeRate = computed(() => dashboardSummary.value?.onTimeRate ?? 0);
  const focusScore = computed(() => dashboardSummary.value?.focusScore ?? 0);

  const totalAssignedTasks = computed(() =>
    productivityTrend.value.reduce((sum, point) => sum + point.assigned, 0)
  );
  const totalCompletedTasks = computed(() =>
    productivityTrend.value.reduce((sum, point) => sum + point.completed, 0)
  );
  const totalDelayedTasks = computed(() =>
    productivityTrend.value.reduce((sum, point) => sum + point.delayed, 0)
  );

  const avgCompletionTime = computed(() => {
    if (productivityTrend.value.length === 0) return 0;
    const totalTime = productivityTrend.value.reduce((sum, point) => sum + point.completed, 0);
    return totalTime / productivityTrend.value.length;
  });

  const totalTimeSpent = computed(() =>
    timeAllocation.value.reduce((sum, item) => sum + item.hours, 0)
  );

  const achievedGoals = computed(() =>
    goalProgress.value.filter((goal) => goal.status === 'achieved')
  );
  const inProgressGoals = computed(() =>
    goalProgress.value.filter((goal) => goal.status === 'in_progress')
  );

  const criticalInsights = computed(() =>
    performanceInsights.value.filter((insight) => insight.priority === 'critical')
  );
  const actionableInsights = computed(() =>
    performanceInsights.value.filter((insight) => insight.actionable)
  );

  // Actions
  async function fetchDashboardSummary(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      dashboardSummary.value = await performanceApi.getDashboardSummary(filters);
      currentFilters.value = filters || {};
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch dashboard summary:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchProductivityTrend(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      productivityTrend.value = await performanceApi.getProductivityTrend(filters);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch productivity trend:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchTimeAllocation(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      timeAllocation.value = await performanceApi.getTimeAllocation(filters);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch time allocation:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchGoalProgress(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      goalProgress.value = await performanceApi.getGoalProgress(filters);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch goal progress:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPerformanceInsights(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      performanceInsights.value = await performanceApi.getPerformanceInsights(filters);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch performance insights:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadAllDashboardData(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      console.log('Loading dashboard data with filters:', filters);
      await Promise.all([
        fetchDashboardSummary(filters),
        fetchProductivityTrend(filters),
        fetchTimeAllocation(filters),
        fetchGoalProgress(filters),
        fetchPerformanceInsights(filters),
      ]);
      console.log('Dashboard data loaded successfully');
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to load dashboard data:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
    } finally {
      loading.value = false;
    }
  }

  function updateFilters(filters: Record<string, any>) {
    currentFilters.value = filters;
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    dashboardSummary.value = null;
    productivityTrend.value = [];
    timeAllocation.value = [];
    goalProgress.value = [];
    performanceInsights.value = [];
    loading.value = false;
    error.value = null;
    currentFilters.value = {};
  }

  return {
    // State
    dashboardSummary,
    productivityTrend,
    timeAllocation,
    goalProgress,
    performanceInsights,
    loading,
    error,
    currentFilters,

    // Computed
    productivityScore,
    completionRate,
    onTimeRate,
    focusScore,
    totalAssignedTasks,
    totalCompletedTasks,
    totalDelayedTasks,
    avgCompletionTime,
    totalTimeSpent,
    achievedGoals,
    inProgressGoals,
    criticalInsights,
    actionableInsights,

    // Actions
    fetchDashboardSummary,
    fetchProductivityTrend,
    fetchTimeAllocation,
    fetchGoalProgress,
    fetchPerformanceInsights,
    loadAllDashboardData,
    updateFilters,
    clearError,
    reset,
  };
});
