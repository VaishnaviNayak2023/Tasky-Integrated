<template>
  <div class="priority-insights">
    <div class="text-h6 text-weight-bold q-mb-md">Priority Insights</div>
    
    <div v-if="loading" class="column items-center justify-center q-pa-xl">
      <q-spinner color="primary" size="40px" />
      <div class="text-body1 text-grey-6 q-mt-md">Loading insights...</div>
    </div>
    
    <div v-else-if="error" class="column items-center justify-center q-pa-xl">
      <q-icon name="error_outline" size="40px" color="negative" />
      <div class="text-body1 text-negative q-mt-md">Failed to load insights</div>
    </div>
    
    <div v-else-if="insights.length === 0" class="column items-center justify-center q-pa-xl">
      <q-icon name="lightbulb_outline" size="40px" color="grey-4" />
      <div class="text-body1 text-grey-6 q-mt-md">No insights available</div>
    </div>
    
    <div v-else class="column q-gutter-md">
      <q-card
        v-for="insight in insights"
        :key="insight.id"
        flat
        bordered
        class="insight-card"
      >
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-icon :name="getInsightIcon(insight.type)" color="primary" size="24px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-medium">{{ insight.title }}</div>
          </div>
          
          <div class="text-body2 text-grey-7">
            {{ insight.description }}
          </div>
          
          <div v-if="insight.metrics" class="row q-gutter-md q-mt-md">
            <div v-for="(value, key) in insight.metrics" :key="key" class="metric-item">
              <div class="text-caption text-grey-6">{{ formatMetricKey(key) }}</div>
              <div class="text-body1 text-weight-medium">{{ value }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PriorityInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  metrics?: Record<string, any>;
}

interface Props {
  insights: PriorityInsight[];
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

function getInsightIcon(type: string): string {
  const icons: Record<string, string> = {
    completion_rate: 'check_circle',
    delay_analysis: 'schedule',
    workload_balance: 'balance',
    sla_compliance: 'verified',
    risk_prediction: 'warning',
  };
  return icons[type] || 'info';
}

function formatMetricKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
</script>

<style scoped>
.priority-insights {
  min-height: 200px;
}

.insight-card {
  border-left: 4px solid #2196f3;
}

.metric-item {
  min-width: 100px;
}
</style>
