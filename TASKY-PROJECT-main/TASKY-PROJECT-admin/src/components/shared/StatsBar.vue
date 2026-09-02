<template>
  <div class="row q-gutter-x-lg q-mb-md" style="flex: 0 0 auto">
    <div v-for="stat in stats" :key="stat.key" class="row items-center">
      <q-icon :name="stat.icon" :color="stat.iconColor" size="20px" class="q-mr-xs" />
      <div
        class="text-weight-bold q-mr-sm"
        :class="stat.valueTextColor ? `text-${stat.valueTextColor}` : ''"
      >
        {{ stat.value }}
      </div>
      <div class="text-caption text-grey-7">{{ stat.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface StatItem {
  key: string;
  icon: string;
  iconColor: string;
  value: number | string;
  label: string;
  valueTextColor?: string;
}

interface Props {
  stats: StatItem[];
}

defineProps<Props>();
</script>
