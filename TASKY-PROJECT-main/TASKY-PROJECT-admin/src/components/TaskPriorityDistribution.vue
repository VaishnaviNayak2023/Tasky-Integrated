<template>
  <div class="bg-white q-pa-md shadow-1 q-mb-md" style="border-radius: 12px">
    <div class="text-subtitle1 text-weight-bold q-mb-lg">Task Priority Distribution</div>

    <div v-if="analyticsStore.loading" class="flex flex-center q-pa-md">
      <q-spinner-dots size="24px" color="primary" />
    </div>

    <div v-else-if="items.length > 0" class="column q-gutter-y-md">
      <div v-for="(item, index) in items" :key="index" class="row items-center no-wrap">
        <div class="text-grey-9 text-weight-medium" style="width: 70px; font-size: 12px">
          {{ item.label }}
        </div>
        <div class="flex-1 q-px-sm" style="flex: 1 1 0">
          <q-linear-progress
            :value="item.percent / 100"
            :color="item.color"
            size="4px"
            class="rounded-borders"
          />
        </div>
        <div class="row justify-end items-center no-wrap" style="width: 60px">
          <span class="text-weight-bold text-grey-9" style="font-size: 12px">{{ item.value }}</span>
          <span class="text-grey-6 q-ml-xs" style="font-size: 11px">({{ item.percent }}%)</span>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-grey-6 q-pa-md text-caption">
      No task priority data available.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAnalyticsStore } from '../stores/analyticsStore';

const analyticsStore = useAnalyticsStore();

const priorityColors: Record<string, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'blue',
  low: 'green',
};

const items = computed(() => {
  if (!analyticsStore.taskDistribution || !analyticsStore.taskDistribution.priority) return [];
  const priorityData = analyticsStore.taskDistribution.priority;
  const total = analyticsStore.taskDistribution.total || 0;

  if (total === 0) return [];

  const result = [];
  const order = ['critical', 'high', 'medium', 'low'];

  for (const priority of order) {
    if (priorityData[priority] !== undefined) {
      const count = priorityData[priority];
      result.push({
        label: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: count,
        percent: Math.round((count / total) * 100),
        color: priorityColors[priority] || 'grey',
      });
    }
  }

  return result;
});
</script>
