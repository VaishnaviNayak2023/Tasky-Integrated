<template>
  <div class="bg-white q-pa-md shadow-1 q-mb-md" style="border-radius: 12px">
    <div class="text-subtitle1 text-weight-bold q-mb-md">Workload Distribution</div>

    <div v-if="resourceStore.loading" class="flex flex-center q-pa-md">
      <q-spinner-dots size="24px" color="primary" />
    </div>

    <div v-else-if="legendItems.length > 0" class="row items-center no-wrap">
      <!-- Donut Chart -->
      <div class="donut-chart q-mr-md" :style="donutGradient">
        <div class="donut-hole">
          <div class="text-caption text-grey-6" style="font-size: 10px; line-height: 1.2">
            Total
          </div>
          <div class="text-weight-bold" style="font-size: 15px; color: #333; line-height: 1.2">
            {{ totalHours }}h
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="column flex-1" style="gap: 8px">
        <div
          v-for="(item, index) in legendItems"
          :key="index"
          class="row items-center justify-between no-wrap"
        >
          <div class="row items-center no-wrap">
            <div class="legend-dot q-mr-sm" :style="`background-color: ${item.color};`"></div>
            <div class="text-grey-8" style="font-size: 11px">{{ item.label }}</div>
          </div>
          <div class="text-weight-bold text-grey-8" style="font-size: 11px">
            {{ item.value }}h ({{ item.percent }}%)
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-grey-6 q-pa-sm text-caption">
      No workload data available.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useResourceStore } from '../stores/resourceStore';

const resourceStore = useResourceStore();

const roleColors: Record<string, string> = {
  frontend: '#3f51b5',
  backend: '#ff9800',
  design: '#4caf50',
  devops: '#9c27b0',
  qa: '#e91e63',
  developer: '#2196f3',
  default: '#795548',
};

const totalHours = computed(() => {
  return resourceStore.resources.reduce(
    (sum: number, r: any) => sum + Math.round(r.weekly_required_hours || 0),
    0,
  );
});

const legendItems = computed(() => {
  if (totalHours.value === 0) return [];

  const roleMap: Record<string, number> = {};
  resourceStore.resources.forEach((r: any) => {
    const role = r.role_name || 'employee';
    roleMap[role] = (roleMap[role] || 0) + Math.round(r.weekly_required_hours || 0);
  });

  const items = Object.entries(roleMap).map(([role, hours]) => {
    const rKey = role.toLowerCase().replace('_', '');
    const color = Object.keys(roleColors).find((k) => rKey.includes(k))
      ? roleColors[Object.keys(roleColors).find((k) => rKey.includes(k))!]
      : roleColors.default;

    return {
      label: role
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      value: hours,
      percent: Math.round((hours / totalHours.value) * 100),
      color,
    };
  });

  return items.sort((a, b) => b.value - a.value); // sort by hours desc
});

const donutGradient = computed(() => {
  let gradient = 'conic-gradient(';
  let currentPercent = 0;

  legendItems.value.forEach((item, index) => {
    const start = currentPercent;
    currentPercent += item.percent;
    gradient += `${item.color} ${start}% ${currentPercent}%${index < legendItems.value.length - 1 ? ',' : ')'}`;
  });

  return { background: gradient };
});
</script>

<style scoped>
.donut-chart {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.donut-hole {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
