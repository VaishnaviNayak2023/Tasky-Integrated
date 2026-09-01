/**
 * Priority Report Composable
 * 
 * Provides business logic and data management for the Detailed Priority Report
 */

import { ref, computed, onMounted } from 'vue';
import { usePriorityReportStore } from '@/stores/priorityReportStore';
import { useFilterStore } from '@/stores/filterStore';
import FilterEngine from '@/services/performance/FilterEngine';

export function usePriorityReport(pageType: string = 'priority_report') {
  const priorityReportStore = usePriorityReportStore();
  const filterStore = useFilterStore();

  const loading = computed(() => priorityReportStore.loading);
  const error = computed(() => priorityReportStore.error);

  const priorityMetrics = computed(() => priorityReportStore.priorityMetrics);
  const priorityTrend = computed(() => priorityReportStore.priorityTrend);
  const tasksByPriority = computed(() => priorityReportStore.tasksByPriority);

  const criticalMetrics = computed(() => priorityReportStore.criticalMetrics);
  const highMetrics = computed(() => priorityReportStore.highMetrics);
  const mediumMetrics = computed(() => priorityReportStore.mediumMetrics);
  const lowMetrics = computed(() => priorityReportStore.lowMetrics);

  const totalTasks = computed(() => priorityReportStore.totalTasks);
  const totalCompleted = computed(() => priorityReportStore.totalCompleted);
  const totalDelayed = computed(() => priorityReportStore.totalDelayed);
  const overallCompletionRate = computed(() => priorityReportStore.overallCompletionRate);

  const pagination = computed(() => priorityReportStore.pagination);
  const paginatedTasks = computed(() => priorityReportStore.paginatedTasks);

  const currentFilter = computed(() => filterStore.currentFilter);
  const hasActiveFilters = computed(() => filterStore.hasActiveFilters);

  async function loadReportData(filters?: Record<string, any>) {
    await priorityReportStore.loadAllReportData(filters);
  }

  async function refreshData() {
    const queryParams = FilterEngine.toQueryParams(currentFilter.value);
    await loadReportData(queryParams);
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

  function handlePaginationChange(props: { pagination: { page: number; rowsPerPage: number } }) {
    priorityReportStore.updatePagination(props.pagination);
  }

  function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
    // Export logic will be handled by the export service
    console.log('Exporting report as:', format);
  }

  function handleBackToPerformance() {
    // Navigate back to performance dashboard
    console.log('Navigating back to performance dashboard');
  }

  onMounted(() => {
    filterStore.syncWithURL();
    filterStore.loadPresets(pageType);
  });

  return {
    // State
    loading,
    error,

    // Data
    priorityMetrics,
    priorityTrend,
    tasksByPriority,

    // Metrics by priority
    criticalMetrics,
    highMetrics,
    mediumMetrics,
    lowMetrics,

    // Summary metrics
    totalTasks,
    totalCompleted,
    totalDelayed,
    overallCompletionRate,

    // Pagination
    pagination,
    paginatedTasks,

    // Filters
    currentFilter,
    hasActiveFilters,

    // Actions
    loadReportData,
    refreshData,
    handleFilterChange,
    handleClearFilters,
    handlePaginationChange,
    handleExport,
    handleBackToPerformance,
  };
}
