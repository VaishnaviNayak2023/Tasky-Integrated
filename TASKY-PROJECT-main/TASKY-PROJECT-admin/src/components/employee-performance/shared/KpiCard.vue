<template>
  <q-card flat bordered class="kpi-card">
    <div class="row items-center justify-between">
      <q-avatar size="44px" :class="avatarBg">
        <q-icon :name="icon" :color="iconColor" size="24px" />
      </q-avatar>

      <div class="text-h4 text-weight-bold" :class="textColor">
        {{ value }}
      </div>
    </div>

    <div class="text-body1 text-weight-medium q-mt-md">
      {{ label }}
    </div>

    <div class="text-caption text-grey-6">
      {{ subtitle }}
    </div>

    <div v-if="sparklineData && sparklineData.length > 0" class="sparkline-container q-mt-sm">
      <svg :width="sparklineWidth" :height="sparklineHeight" class="sparkline">
        <polyline
          :points="sparklinePoints"
          fill="none"
          :stroke="sparklineColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div v-if="comparison" class="text-caption q-mt-sm" :class="comparisonClass">
      <q-icon :name="comparisonIcon" size="16px" />
      {{ comparisonText }}
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  textColor?: string;
  avatarBg?: string;
  sparklineData?: number[];
  sparklineWidth?: number;
  sparklineHeight?: number;
  sparklineColor?: string;
  comparison?: string;
  comparisonType?: 'positive' | 'negative' | 'neutral';
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  iconColor: 'primary',
  textColor: 'text-primary',
  avatarBg: 'bg-grey-2',
  sparklineData: () => [],
  sparklineWidth: 100,
  sparklineHeight: 30,
  sparklineColor: '#1976D2',
  comparison: '',
  comparisonType: 'neutral',
});

const sparklinePoints = computed(() => {
  if (props.sparklineData.length < 2) return '';

  const data = props.sparklineData;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = props.sparklineWidth;
  const height = props.sparklineHeight;
  const stepX = width / (data.length - 1);

  return data
    .map((value, index) => {
      const x = index * stepX;
      const normalizedY = (value - min) / range;
      const y = height - normalizedY * height;
      return `${x},${y}`;
    })
    .join(' ');
});

const comparisonIcon = computed(() => {
  switch (props.comparisonType) {
    case 'positive':
      return 'trending_up';
    case 'negative':
      return 'trending_down';
    default:
      return 'remove';
  }
});

const comparisonClass = computed(() => {
  switch (props.comparisonType) {
    case 'positive':
      return 'text-positive';
    case 'negative':
      return 'text-negative';
    default:
      return 'text-grey-7';
  }
});

const comparisonText = computed(() => props.comparison || 'vs last month');
</script>

<style scoped>
.kpi-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.sparkline-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sparkline {
  overflow: visible;
}
</style>
