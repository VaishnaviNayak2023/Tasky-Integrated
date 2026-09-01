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

  const currentFilter = computed(() => filterStore.currentFilter);
  const hasActiveFilters = computed(() => filterStore.hasActiveFilters);

  async function loadDashboardData(filters?: Record<string, any>) {
    await performanceStore.loadAllDashboardData(filters);
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
