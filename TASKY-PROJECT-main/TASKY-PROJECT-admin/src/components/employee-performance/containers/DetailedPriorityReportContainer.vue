<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <q-btn
          flat
          label="Back to Performance"
          icon="arrow_back"
          @click="handleBackToPerformance"
          class="q-mb-sm"
        />
        <div class="text-h4 text-weight-bold">Detailed Priority Report</div>
        <div class="text-body1 text-grey-6">Task performance by priority level</div>
      </div>

      <div class="row q-gutter-sm">
        <q-select
          v-model="dateRange"
          :options="dateRangeOptions"
          outlined
          dense
          style="width: 180px"
          emit-value
          map-options
        />

        <q-btn
          flat
          label="Export Report"
          icon="download"
          @click="exportDialog.open()"
        />
      </div>
    </div>

    <!-- GLOBAL FILTER BAR -->
    <GlobalFilterBar
      page-type="priority_report"
      @filter-change="handleFilterChange"
      @open-advanced-filters="openAdvancedFilters"
      @open-saved-filters="savedFilterManager.open()"
    />

    <!-- LOADING STATE -->
    <LoadingState v-if="loading" message="Loading priority report..." />

    <!-- ERROR STATE -->
    <ErrorState
      v-else-if="error"
      :message="error"
      @retry="refreshData"
    />

    <!-- REPORT CONTENT -->
    <div v-else class="column q-gutter-lg">
      <!-- KPI CARDS BY PRIORITY -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="q-pa-lg">
            <div class="row items-center justify-between q-mb-sm">
              <q-badge color="negative" label="Critical" />
              <q-icon name="warning" color="negative" size="24px" />
            </div>
            <div class="text-h4 text-weight-bold">
              {{ criticalMetrics?.completionRate || 0 }}%
            </div>
            <div class="text-caption text-grey-6">Completion Rate</div>
            <div class="text-body2 q-mt-sm">
              {{ criticalMetrics?.completedTasks || 0 }}/{{ criticalMetrics?.totalTasks || 0 }} tasks
            </div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="q-pa-lg">
            <div class="row items-center justify-between q-mb-sm">
              <q-badge color="orange" label="High" />
              <q-icon name="priority_high" color="orange" size="24px" />
            </div>
            <div class="text-h4 text-weight-bold">
              {{ highMetrics?.completionRate || 0 }}%
            </div>
            <div class="text-caption text-grey-6">Completion Rate</div>
            <div class="text-body2 q-mt-sm">
              {{ highMetrics?.completedTasks || 0 }}/{{ highMetrics?.totalTasks || 0 }} tasks
            </div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="q-pa-lg">
            <div class="row items-center justify-between q-mb-sm">
              <q-badge color="primary" label="Medium" />
              <q-icon name="remove" color="primary" size="24px" />
            </div>
            <div class="text-h4 text-weight-bold">
              {{ mediumMetrics?.completionRate || 0 }}%
            </div>
            <div class="text-caption text-grey-6">Completion Rate</div>
            <div class="text-body2 q-mt-sm">
              {{ mediumMetrics?.completedTasks || 0 }}/{{ mediumMetrics?.totalTasks || 0 }} tasks
            </div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="q-pa-lg">
            <div class="row items-center justify-between q-mb-sm">
              <q-badge color="positive" label="Low" />
              <q-icon name="low_priority" color="positive" size="24px" />
            </div>
            <div class="text-h4 text-weight-bold">
              {{ lowMetrics?.completionRate || 0 }}%
            </div>
            <div class="text-caption text-grey-6">Completion Rate</div>
            <div class="text-body2 q-mt-sm">
              {{ lowMetrics?.completedTasks || 0 }}/{{ lowMetrics?.totalTasks || 0 }} tasks
            </div>
          </q-card>
        </div>
      </div>

      <!-- COMPLETION RATE TREND -->
      <q-card flat bordered class="q-pa-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Completion Rate Trend by Priority</div>
        
        <CompletionTrendChart
          :data="priorityTrend"
          :loading="loading"
          :error="error"
          height="300"
        />
      </q-card>

      <!-- TASKS DISTRIBUTION -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-6">
          <q-card flat bordered class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">Tasks Distribution by Priority</div>
            
            <PriorityDistributionChart
              :data="priorityMetrics"
              :loading="loading"
              :error="error"
              height="300"
            />
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat bordered class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">Priority Summary</div>
            
            <q-table
              :rows="priorityMetrics"
              :columns="summaryColumns"
              row-key="priority"
              flat
              bordered
              hide-pagination
            >
              <template v-slot:body-cell-priority="props">
                <q-td :props="props">
                  <q-badge :color="getPriorityColor(props.row.priority)">
                    {{ props.row.priority.charAt(0).toUpperCase() + props.row.priority.slice(1) }}
                  </q-badge>
                </q-td>
              </template>
              
              <template v-slot:body-cell-completionRate="props">
                <q-td :props="props">
                  {{ props.row.completionRate }}%
                </q-td>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>

      <!-- TASKS BY PRIORITY TABLE -->
      <q-card flat bordered class="q-pa-lg">
        <PriorityTaskTable
          :tasks="paginatedTasks"
          :loading="loading"
          :pagination="pagination"
          @request="handlePaginationChange"
          @download="handleDownload"
        />
      </q-card>

      <!-- PRIORITY INSIGHTS -->
      <q-card flat bordered class="q-pa-lg">
        <PriorityInsights
          :insights="generatePriorityInsights()"
          :loading="loading"
          :error="error"
        />
      </q-card>
    </div>

    <!-- DIALOGS -->
    <ExportDialog ref="exportDialog" />
    <SavedFilterManager ref="savedFilterManager" page-type="priority_report" :current-filter="currentFilter" @load-preset="handleLoadPreset" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePriorityReport } from '../composables/usePriorityReport';
import type { PriorityMetrics } from '@/services/performance/performanceApi';

// Components
import GlobalFilterBar from '../filters/GlobalFilterBar.vue';
import LoadingState from '../shared/LoadingState.vue';
import ErrorState from '../shared/ErrorState.vue';
import CompletionTrendChart from '../charts/CompletionTrendChart.vue';
import PriorityDistributionChart from '../charts/PriorityDistributionChart.vue';
import PriorityTaskTable from '../tables/PriorityTaskTable.vue';
import PriorityInsights from '../insights/PriorityInsights.vue';
import ExportDialog from '../dialogs/ExportDialog.vue';
import SavedFilterManager from '../filters/SavedFilterManager.vue';

// Composable
const {
  loading,
  error,
  priorityMetrics,
  priorityTrend,
  criticalMetrics,
  highMetrics,
  mediumMetrics,
  lowMetrics,
  pagination,
  paginatedTasks,
  currentFilter,
  loadReportData,
  refreshData,
  handleFilterChange,
  handlePaginationChange,
  handleExport,
  handleBackToPerformance,
} = usePriorityReport('priority_report');

// Local state
const dateRange = ref('this_month');
const dateRangeOptions = [
  { label: 'This Month (May 1-May 31)', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
];

const summaryColumns = [
  {
    name: 'priority',
    required: true,
    label: 'Priority',
    align: 'left' as const,
    field: 'priority',
  },
  {
    name: 'totalTasks',
    required: true,
    label: 'Total Tasks',
    align: 'center' as const,
    field: 'totalTasks',
  },
  {
    name: 'completedTasks',
    required: true,
    label: 'Completed',
    align: 'center' as const,
    field: 'completedTasks',
  },
  {
    name: 'delayedTasks',
    required: true,
    label: 'Delayed',
    align: 'center' as const,
    field: 'delayedTasks',
  },
  {
    name: 'completionRate',
    required: true,
    label: 'Completion %',
    align: 'center' as const,
    field: 'completionRate',
  },
  {
    name: 'avgCompletionTime',
    required: true,
    label: 'Avg Time',
    align: 'center' as const,
    field: 'avgCompletionTime',
    format: (val: number) => `${val.toFixed(1)} days`,
  },
];

// Dialog refs
const exportDialog = ref();
const savedFilterManager = ref();

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'negative',
    high: 'orange',
    medium: 'primary',
    low: 'positive',
  };
  return colors[priority] || 'grey';
}

function generatePriorityInsights() {
  const insights = [];
  
  if (criticalMetrics.value && criticalMetrics.value.completionRate > 90) {
    insights.push({
      id: '1',
      type: 'completion_rate',
      title: 'Critical tasks have the highest completion rate',
      description: `Critical tasks have a ${criticalMetrics.value.completionRate}% completion rate this month.`,
      metrics: {
        'Completion Rate': `${criticalMetrics.value.completionRate}%`,
        'Total Tasks': criticalMetrics.value.totalTasks,
      },
    });
  }
  
  if (mediumMetrics.value && mediumMetrics.value.avgCompletionTime > 2) {
    insights.push({
      id: '2',
      type: 'delay_analysis',
      title: 'Medium priority tasks take the longest',
      description: `Medium priority tasks take an average of ${mediumMetrics.value.avgCompletionTime.toFixed(1)} days to complete.`,
      metrics: {
        'Avg Time': `${mediumMetrics.value.avgCompletionTime.toFixed(1)} days`,
        'Delayed Tasks': mediumMetrics.value.delayedTasks,
      },
    });
  }
  
  if (lowMetrics.value && lowMetrics.value.avgCompletionTime < 1.5) {
    insights.push({
      id: '3',
      type: 'sla_compliance',
      title: 'Low priority tasks have fastest completion',
      description: `Low priority tasks are completed in ${lowMetrics.value.avgCompletionTime.toFixed(1)} days on average.`,
      metrics: {
        'Avg Time': `${lowMetrics.value.avgCompletionTime.toFixed(1)} days`,
        'Completion Rate': `${lowMetrics.value.completionRate}%`,
      },
    });
  }
  
  return insights;
}

function openAdvancedFilters() {
  console.log('Opening advanced filters');
}

function handleDownload() {
  console.log('Downloading table data');
}

function handleLoadPreset(preset: any) {
  console.log('Loading preset:', preset);
  refreshData();
}

onMounted(() => {
  loadReportData();
});
</script>
