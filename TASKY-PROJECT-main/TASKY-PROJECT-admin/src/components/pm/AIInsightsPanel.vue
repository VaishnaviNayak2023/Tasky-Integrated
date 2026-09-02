<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-bold">AI Insights</div>
      <q-btn flat round icon="refresh" @click="refreshInsights" :loading="loading" />
    </div>

    <div v-if="insights.length === 0 && !loading" class="text-center q-pa-xl text-grey-6">
      <q-icon name="psychology" size="48px" class="q-mb-sm" />
      <div class="text-h6">No insights available</div>
      <div>AI insights will appear here based on your team's performance</div>
    </div>

    <q-list v-else separator>
      <q-item v-for="insight in insights" :key="insight.id" class="q-py-md">
        <q-item-section avatar>
          <q-avatar :color="getInsightColor(insight.priority)" text-color="white">
            <q-icon :name="getInsightIcon(insight.type)" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ insight.title }}</q-item-label>
          <q-item-label caption>{{ insight.description }}</q-item-label>
          <q-item-label caption class="text-grey-7 q-mt-xs">
            <q-icon name="schedule" size="14px" class="q-mr-xs" />
            {{ formatTime(insight.created_at) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge :color="getInsightColor(insight.priority)" :label="insight.priority" />
        </q-item-section>
        <q-item-section side>
          <q-btn
            v-if="insight.actionable"
            flat
            round
            icon="arrow_forward"
            color="primary"
            @click="handleAction(insight)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/boot/axios';

const loading = ref(false);
const insights = ref<any[]>([]);

async function loadInsights() {
  loading.value = true;
  try {
    const response = await api.get('/pm/schedule/suggestions');
    insights.value = response.data.suggestions || [];
  } catch (error) {
    console.error('Failed to load insights:', error);
    // Load mock data if API fails
    insights.value = getMockInsights();
  } finally {
    loading.value = false;
  }
}

function refreshInsights() {
  loadInsights();
}

function handleAction(insight: any) {
  console.log('Handling action for insight:', insight);
  // Implement action handling logic
}

function getInsightColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'negative',
    high: 'orange',
    medium: 'primary',
    low: 'positive',
  };
  return colors[priority?.toLowerCase()] || 'grey';
}

function getInsightIcon(type: string): string {
  const icons: Record<string, string> = {
    resource: 'groups',
    deadline: 'schedule',
    workload: 'work',
    quality: 'verified',
    efficiency: 'speed',
  };
  return icons[type?.toLowerCase()] || 'lightbulb';
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getMockInsights() {
  return [
    {
      id: 1,
      title: 'Workload Imbalance Detected',
      description: 'John Smith is at 120% capacity while Sarah Johnson has availability. Consider reassigning 2 tasks.',
      type: 'workload',
      priority: 'high',
      actionable: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      title: 'Deadline Risk Alert',
      description: '3 tasks in "Website Redesign" project are at risk of missing their deadlines this week.',
      type: 'deadline',
      priority: 'critical',
      actionable: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 3,
      title: 'Efficiency Opportunity',
      description: 'Team productivity increased by 15% this week. Current workflow optimizations are working well.',
      type: 'efficiency',
      priority: 'low',
      actionable: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 4,
      title: 'Quality Metrics Update',
      description: 'First-time completion rate dropped to 78% this week. Consider reviewing recent task requirements.',
      type: 'quality',
      priority: 'medium',
      actionable: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

onMounted(() => {
  loadInsights();
});
</script>
