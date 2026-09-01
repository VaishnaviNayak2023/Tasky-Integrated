/**
 * Priority Report Store
 * 
 * Responsibilities:
 * - Priority metrics
 * - Charts
 * - Table data
 * - Export state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as performanceApi from '@/services/performance/performanceApi';
import type {
  PriorityMetrics,
  PriorityTrendData,
  TaskByPriority,
} from '@/services/performance/performanceApi';

export const usePriorityReportStore = defineStore('priorityReport', () => {
  // State
  const priorityMetrics = ref<PriorityMetrics[]>([]);
  const priorityTrend = ref<PriorityTrendData[]>([]);
  const tasksByPriority = ref<TaskByPriority[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentFilters = ref<Record<string, any>>({});
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  // Computed
  const criticalMetrics = computed(() =>
    priorityMetrics.value.find((m) => m.priority === 'critical')
  );
  const highMetrics = computed(() =>
    priorityMetrics.value.find((m) => m.priority === 'high')
  );
  const mediumMetrics = computed(() =>
    priorityMetrics.value.find((m) => m.priority === 'medium')
  );
  const lowMetrics = computed(() =>
    priorityMetrics.value.find((m) => m.priority === 'low')
  );

  const totalTasks = computed(() =>
    priorityMetrics.value.reduce((sum, m) => sum + m.totalTasks, 0)
  );
  const totalCompleted = computed(() =>
    priorityMetrics.value.reduce((sum, m) => sum + m.completedTasks, 0)
  );
  const totalDelayed = computed(() =>
    priorityMetrics.value.reduce((sum, m) => sum + m.delayedTasks, 0)
  );

  const overallCompletionRate = computed(() => {
    if (totalTasks.value === 0) return 0;
    return Math.round((totalCompleted.value / totalTasks.value) * 100);
  });

  const paginatedTasks = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const end = start + pagination.value.rowsPerPage;
    return tasksByPriority.value.slice(start, end);
  });

  // Actions
  async function fetchPriorityMetrics(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      priorityMetrics.value = await performanceApi.getPriorityReport(filters);
      currentFilters.value = filters || {};
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch priority metrics:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPriorityTrend(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      priorityTrend.value = await performanceApi.getPriorityTrend(filters);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch priority trend:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchTasksByPriority(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      tasksByPriority.value = await performanceApi.getTasksByPriority(filters);
      pagination.value.rowsNumber = tasksByPriority.value.length;
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch tasks by priority:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadAllReportData(filters?: Record<string, any>) {
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([
        fetchPriorityMetrics(filters),
        fetchPriorityTrend(filters),
        fetchTasksByPriority(filters),
      ]);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to load report data:', err);
    } finally {
      loading.value = false;
    }
  }

  function updatePagination(newPagination: { page: number; rowsPerPage: number }) {
    pagination.value = {
      ...pagination.value,
      ...newPagination,
    };
  }

  function updateFilters(filters: Record<string, any>) {
    currentFilters.value = filters;
    pagination.value.page = 1; // Reset to first page when filters change
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    priorityMetrics.value = [];
    priorityTrend.value = [];
    tasksByPriority.value = [];
    loading.value = false;
    error.value = null;
    currentFilters.value = {};
    pagination.value = {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    };
  }

  return {
    // State
    priorityMetrics,
    priorityTrend,
    tasksByPriority,
    loading,
    error,
    currentFilters,
    pagination,

    // Computed
    criticalMetrics,
    highMetrics,
    mediumMetrics,
    lowMetrics,
    totalTasks,
    totalCompleted,
    totalDelayed,
    overallCompletionRate,
    paginatedTasks,

    // Actions
    fetchPriorityMetrics,
    fetchPriorityTrend,
    fetchTasksByPriority,
    loadAllReportData,
    updatePagination,
    updateFilters,
    clearError,
    reset,
  };
});
