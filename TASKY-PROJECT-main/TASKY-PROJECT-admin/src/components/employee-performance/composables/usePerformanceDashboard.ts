/**
 * Performance Dashboard Composable
 * 
 * Provides business logic and data management for the My Performance dashboard
 */

import { ref, computed, onMounted } from 'vue';
import { usePerformanceStore } from '@/stores/performanceStore';
import { useFilterStore } from '@/stores/filterStore';
import FilterEngine from '@/services/performance/FilterEngine';

export function usePerformanceDashboard(pageType: string = 'my_performance') {
  const performanceStore = usePerformanceStore();
  const filterStore = useFilterStore();

  const loading = computed(() => performanceStore.loading);
  const error = computed(() => performanceStore.error);

  const productivityScore = computed(() => performanceStore.productivityScore);
  const completionRate = computed(() => performanceStore.completionRate);
  const onTimeRate = computed(() => performanceStore.onTimeRate);
  const focusScore = computed(() => performanceStore.focusScore);

  const productivityTrend = computed(() => performanceStore.productivityTrend);
  const timeAllocation = computed(() => performanceStore.timeAllocation);
  const goalProgress = computed(() => performanceStore.goalProgress);
  const performanceInsights = computed(() => performanceStore.performanceInsights);

  const totalAssignedTasks = computed(() => performanceStore.totalAssignedTasks);
  const totalCompletedTasks = computed(() => performanceStore.totalCompletedTasks);
  const totalDelayedTasks = computed(() => performanceStore.totalDelayedTasks);
  const avgCompletionTime = computed(() => performanceStore.avgCompletionTime);

  const achievedGoals = computed(() => performanceStore.achievedGoals);
  const inProgressGoals = computed(() => performanceStore.inProgressGoals);

  const criticalInsights = computed(() => performanceStore.criticalInsights);
  const actionableInsights = computed(() => performanceStore.actionableInsights);

  // Additional metrics for new components
  const tasksAssignedToday = computed(() => performanceStore.tasksAssignedTodayComputed || 0);
  const tasksCompletedToday = computed(() => performanceStore.tasksCompletedTodayComputed || 0);
  const reopenedTasks = computed(() => performanceStore.reopenedTasksComputed || 0);
  const revisionRequests = computed(() => performanceStore.revisionRequestsComputed || 0);
  const firstTimeCompletion = computed(() => performanceStore.firstTimeCompletionComputed || 0);
  const avgSubtaskAccuracy = computed(() => performanceStore.avgSubtaskAccuracyComputed || 0);
  const priorityPerformanceData = computed(() => performanceStore.priorityPerformanceDataComputed || []);
  const achievementsData = computed(() => performanceStore.achievementsDataComputed || []);

  const currentFilter = computed(() => filterStore.currentFilter);
  const hasActiveFilters = computed(() => filterStore.hasActiveFilters);

  async function loadDashboardData(filters?: Record<string, any>) {
    await performanceStore.loadAllDashboardData(filters);
    
    // Load mock data for new components
    loadMockData();
  }

  function loadMockData() {
    // Mock data for Daily Consistency
    performanceStore.tasksAssignedToday = 5;
    performanceStore.tasksCompletedToday = 4;

    // Mock data for Task Quality Metrics
    performanceStore.reopenedTasks = 2;
    performanceStore.revisionRequests = 3;
    performanceStore.firstTimeCompletion = 85;
    performanceStore.avgSubtaskAccuracy = 92;

    // Mock data for Priority Performance
    performanceStore.priorityPerformanceData = [
      {
        priority: 'critical',
        totalTasks: 10,
        completedTasks: 8,
        delayedTasks: 2,
        completionRate: 80,
        avgCompletionTime: 3.5,
      },
      {
        priority: 'high',
        totalTasks: 25,
        completedTasks: 22,
        delayedTasks: 3,
        completionRate: 88,
        avgCompletionTime: 4.2,
      },
      {
        priority: 'medium',
        totalTasks: 30,
        completedTasks: 28,
        delayedTasks: 2,
        completionRate: 93,
        avgCompletionTime: 5.8,
      },
      {
        priority: 'low',
        totalTasks: 15,
        completedTasks: 14,
        delayedTasks: 1,
        completionRate: 93,
        avgCompletionTime: 7.2,
      },
    ];

    // Mock data for Achievements
    performanceStore.achievementsData = [
      {
        id: '1',
        title: 'Task Master',
        description: 'Complete 100 tasks',
        icon: 'workspace_premium',
        unlocked: true,
      },
      {
        id: '2',
        title: 'Early Bird',
        description: 'Complete 50 tasks before deadline',
        icon: 'schedule',
        unlocked: true,
      },
      {
        id: '3',
        title: 'Perfect Week',
        description: '7 days streak of completing all tasks',
        icon: 'emoji_events',
        unlocked: false,
      },
      {
        id: '4',
        title: 'Quality Expert',
        description: '95% first-time completion rate',
        icon: 'verified',
        unlocked: false,
      },
    ];
  }

  async function refreshData() {
    const queryParams = FilterEngine.toQueryParams(currentFilter.value);
    await loadDashboardData(queryParams);
  }

  function handleFilterChange(filters: Record<string, any>) {
    filterStore.setFilter(FilterEngine.createEmptyFilter());
    
    // Convert simple filters to FilterGroup format
    const conditions = Object.entries(filters).map(([field, value]) => ({
      field,
      operator: 'eq' as const,
      value,
    }));

    filterStore.setFilter({
      operator: 'AND',
      conditions,
    });

    filterStore.updateURL();
    refreshData();
  }

  function handleClearFilters() {
    filterStore.clearFilter();
    filterStore.updateURL();
    refreshData();
  }

  function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
    // Export logic will be handled by the export service
    console.log('Exporting data as:', format);
  }

  function handleShareSummary() {
    // Share logic will be implemented
    console.log('Sharing summary');
  }

  onMounted(() => {
    filterStore.syncWithURL();
    filterStore.loadPresets(pageType);
  });

  return {
    // State
    loading,
    error,

    // KPIs
    productivityScore,
    completionRate,
    onTimeRate,
    focusScore,

    // Data
    productivityTrend,
    timeAllocation,
    goalProgress,
    performanceInsights,

    // Computed metrics
    totalAssignedTasks,
    totalCompletedTasks,
    totalDelayedTasks,
    avgCompletionTime,

    // Goals
    achievedGoals,
    inProgressGoals,

    // Insights
    criticalInsights,
    actionableInsights,

    // Additional metrics
    tasksAssignedToday,
    tasksCompletedToday,
    reopenedTasks,
    revisionRequests,
    firstTimeCompletion,
    avgSubtaskAccuracy,
    priorityPerformanceData,
    achievementsData,

    // Filters
    currentFilter,
    hasActiveFilters,

    // Actions
    loadDashboardData,
    refreshData,
    handleFilterChange,
    handleClearFilters,
    handleExport,
    handleShareSummary,
  };
}
