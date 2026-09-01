<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">My Performance</div>
        <div class="text-body1 text-grey-6">Your personal work trends and progress</div>
      </div>

      <div class="row q-gutter-sm">
        <q-select
          v-model="timePeriod"
          :options="timePeriodOptions"
          outlined
          dense
          style="width: 150px"
          emit-value
          map-options
          @update:model-value="handleTimePeriodChange"
        />

        <q-btn
          flat
          label="Export Report"
          icon="download"
          @click="exportDialog.open()"
        />

        <q-btn
          flat
          label="Share Summary"
          icon="share"
          @click="shareDialog.open()"
        />
      </div>
    </div>

    <!-- GLOBAL FILTER BAR -->
    <GlobalFilterBar
      page-type="my_performance"
      @filter-change="handleFilterChange"
      @open-advanced-filters="openAdvancedFilters"
      @open-saved-filters="savedFilterManager.open()"
    />

    <!-- LOADING STATE -->
    <LoadingState v-if="loading" message="Loading performance data..." />

    <!-- ERROR STATE -->
    <ErrorState
      v-else-if="error"
      :message="error"
      @retry="refreshData"
    />

    <!-- DASHBOARD CONTENT -->
    <div v-else class="column q-gutter-lg">
      <!-- KPI CARDS -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <KpiCard
            label="Productivity Score"
            :value="`${productivityScore}%`"
            subtitle="Overall performance"
            icon="trending_up"
            icon-color="positive"
            text-color="text-positive"
            avatar-bg="bg-green-1"
            :sparkline-data="generateSparklineData()"
            comparison="+5%"
            comparison-type="positive"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <KpiCard
            label="Completion Rate"
            :value="`${completionRate}%`"
            subtitle="Of assigned tasks"
            icon="check_circle"
            icon-color="primary"
            text-color="text-primary"
            avatar-bg="bg-blue-1"
            :sparkline-data="generateSparklineData()"
            comparison="+3%"
            comparison-type="positive"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <KpiCard
            label="On-Time Rate"
            :value="`${onTimeRate}%`"
            subtitle="Completed on schedule"
            icon="schedule"
            icon-color="primary"
            text-color="text-primary"
            avatar-bg="bg-blue-1"
            :sparkline-data="generateSparklineData()"
            comparison="+2%"
            comparison-type="positive"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <KpiCard
            label="Focus Score"
            :value="`${focusScore}%`"
            subtitle="Deep work consistency"
            icon="psychology"
            icon-color="purple"
            text-color="text-purple"
            avatar-bg="bg-purple-1"
            :sparkline-data="generateSparklineData()"
            comparison="+4%"
            comparison-type="positive"
          />
        </div>
      </div>

      <!-- PRODUCTIVITY TREND CHART -->
      <q-card flat bordered class="q-pa-lg">
        <div class="row justify-between q-mb-md">
          <div>
            <div class="text-h6 text-weight-bold">Productivity Trend</div>
            <div class="text-body2 text-grey-6">Tasks completed vs assigned</div>
          </div>
        </div>

        <ProductivityTrendChart
          :data="productivityTrend"
          :loading="loading"
          :error="error"
          height="300"
        />

        <div class="row q-gutter-lg q-mt-md">
          <div class="text-body2">
            <strong>Assigned:</strong> {{ totalAssignedTasks }}
          </div>
          <div class="text-body2">
            <strong>Completed:</strong> {{ totalCompletedTasks }}
          </div>
          <div class="text-body2">
            <strong>Delayed:</strong> {{ totalDelayedTasks }}
          </div>
          <div class="text-body2">
            <strong>Avg Completion Time:</strong> {{ avgCompletionTime.toFixed(1) }} days
          </div>
        </div>
      </q-card>

      <!-- WORKLOAD VS OUTPUT -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-7">
          <q-card flat bordered class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">Workload vs Output</div>
            
            <div class="row q-gutter-md q-mb-md">
              <div class="col">
                <div class="text-caption text-grey-6">Assigned Work</div>
                <div class="text-h5 text-weight-bold">{{ totalAssignedTasks }}h</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">Completed Work</div>
                <div class="text-h5 text-weight-bold">{{ totalCompletedTasks }}h</div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">Remaining Work</div>
                <div class="text-h5 text-weight-bold">{{ totalDelayedTasks }}h</div>
              </div>
            </div>

            <q-linear-progress
              :value="completionRate / 100"
              rounded
              size="20px"
              color="primary"
              track-color="grey-3"
              class="q-mb-md"
            />

            <div class="text-body2 text-grey-6">
              You are {{ completionRate > 80 ? '16%' : '0%' }} more efficient than last month
            </div>
          </q-card>
        </div>

        <div class="col-12 col-lg-5">
          <q-card flat bordered class="q-pa-lg">
            <div class="text-h6 text-weight-bold q-mb-md">Time Allocation</div>
            
            <TimeAllocationChart
              :data="timeAllocation"
              :loading="loading"
              :error="error"
              height="300"
            />
          </q-card>
        </div>
      </div>

      <!-- PERFORMANCE INSIGHTS -->
      <q-card flat bordered class="q-pa-lg">
        <PerformanceInsights
          :insights="performanceInsights"
          :loading="loading"
          :error="error"
          @action="handleInsightAction"
        />
      </q-card>

      <!-- GOAL PROGRESS -->
      <q-card flat bordered class="q-pa-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Goal Progress</div>
        
        <div v-if="goalProgress.length === 0" class="column items-center justify-center q-pa-xl">
          <EmptyState
            title="No Goals Set"
            message="Set personal goals to track your progress"
            action-label="Set Goals"
            action-icon="add"
            @action="handleSetGoals"
          />
        </div>
        
        <div v-else class="column q-gutter-md">
          <div v-for="goal in goalProgress" :key="goal.id" class="q-mb-md">
            <div class="row justify-between q-mb-sm">
              <div class="text-body1 text-weight-medium">{{ goal.goalName }}</div>
              <div class="text-body2">
                {{ goal.currentValue }}/{{ goal.targetValue }}
                <q-badge :color="goal.status === 'achieved' ? 'positive' : 'primary'">
                  {{ goal.status }}
                </q-badge>
              </div>
            </div>
            
            <q-linear-progress
              :value="goal.percentage / 100"
              rounded
              size="8px"
              :color="goal.status === 'achieved' ? 'positive' : 'primary'"
              track-color="grey-3"
            />
          </div>
        </div>
      </q-card>
    </div>

    <!-- DIALOGS -->
    <ExportDialog ref="exportDialog" />
    <ShareReportDialog ref="shareDialog" @share="handleShare" />
    <SavedFilterManager ref="savedFilterManager" page-type="my_performance" :current-filter="currentFilter" @load-preset="handleLoadPreset" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePerformanceDashboard } from '../composables/usePerformanceDashboard';
import FilterEngine from '@/services/performance/FilterEngine';

// Components
import GlobalFilterBar from '../filters/GlobalFilterBar.vue';
import KpiCard from '../shared/KpiCard.vue';
import LoadingState from '../shared/LoadingState.vue';
import ErrorState from '../shared/ErrorState.vue';
import EmptyState from '../shared/EmptyState.vue';
import ProductivityTrendChart from '../charts/ProductivityTrendChart.vue';
import TimeAllocationChart from '../charts/TimeAllocationChart.vue';
import PerformanceInsights from '../insights/PerformanceInsights.vue';
import ExportDialog from '../dialogs/ExportDialog.vue';
import ShareReportDialog from '../dialogs/ShareReportDialog.vue';
import SavedFilterManager from '../filters/SavedFilterManager.vue';

// Composable
const {
  loading,
  error,
  productivityScore,
  completionRate,
  onTimeRate,
  focusScore,
  productivityTrend,
  timeAllocation,
  goalProgress,
  performanceInsights,
  totalAssignedTasks,
  totalCompletedTasks,
  totalDelayedTasks,
  avgCompletionTime,
  currentFilter,
  loadDashboardData,
  refreshData,
  handleFilterChange,
  handleClearFilters,
  handleExport,
  handleShareSummary,
} = usePerformanceDashboard('my_performance');

// Local state
const timePeriod = ref('this_month');
const timePeriodOptions = [
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
];

// Dialog refs
const exportDialog = ref();
const shareDialog = ref();
const savedFilterManager = ref();

function generateSparklineData(): number[] {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
}

function handleTimePeriodChange(period: string) {
  timePeriod.value = period;
  const filters = { timePeriod: period };
  handleFilterChange(filters);
}

function openAdvancedFilters() {
  // Open advanced filter builder
  console.log('Opening advanced filters');
}

function handleInsightAction(insight: any) {
  console.log('Insight action:', insight);
}

function handleSetGoals() {
  console.log('Setting goals');
}

function handleLoadPreset(preset: any) {
  console.log('Loading preset:', preset);
  refreshData();
}

onMounted(() => {
  loadDashboardData();
});
</script>
