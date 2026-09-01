<template>
  <div class="performance-insights">
    <div class="text-h6 text-weight-bold q-mb-md">Performance Insights</div>
    
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
        :key="insight.type"
        flat
        bordered
        :class="getInsightCardClass(insight.priority)"
      >
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-icon :name="getInsightIcon(insight.type)" :color="getInsightColor(insight.priority)" size="24px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-medium">{{ insight.title }}</div>
            <q-space />
            <q-badge :color="getInsightColor(insight.priority)" :label="insight.priority" />
          </div>
          
          <div class="text-body2 text-grey-7">
            {{ insight.description }}
          </div>
          
          <q-btn
            v-if="insight.actionable"
            flat
            label="Take Action"
            color="primary"
            class="q-mt-md"
            size="sm"
            @click="$emit('action', insight)"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PerformanceInsight } from '@/services/performance/performanceApi';

interface Props {
  insights: PerformanceInsight[];
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<{
  action: [insight: PerformanceInsight];
}>();

function getInsightIcon(type: string): string {
  const icons: Record<string, string> = {
    strongest_area: 'trending_up',
    weakest_area: 'trending_down',
    trend_change: 'show_chart',
    consistency: 'calendar_today',
    recommendation: 'lightbulb',
  };
  return icons[type] || 'info';
}

function getInsightColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'negative',
    high: 'orange',
    medium: 'primary',
    low: 'positive',
  };
  return colors[priority] || 'grey';
}

function getInsightCardClass(priority: string): string {
  const classes: Record<string, string> = {
    critical: 'insight-critical',
    high: 'insight-high',
    medium: 'insight-medium',
    low: 'insight-low',
  };
  return classes[priority] || '';
}
</script>

<style scoped>
.performance-insights {
  min-height: 200px;
}

.insight-critical {
  border-left: 4px solid #f44336;
}

.insight-high {
  border-left: 4px solid #ff9800;
}

.insight-medium {
  border-left: 4px solid #2196f3;
}

.insight-low {
  border-left: 4px solid #4caf50;
}
</style>
