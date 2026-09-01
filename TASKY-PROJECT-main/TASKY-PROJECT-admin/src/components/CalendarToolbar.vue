<template>
  <div class="calendar-toolbar row items-center justify-between q-px-md">
    <div>
      <div class="calendar-kicker">
        {{ kicker }}
      </div>
      <div class="calendar-month">{{ monthName }} {{ currentYear }}</div>
    </div>
    <div class="row items-center q-gutter-xs">
      <q-btn flat round dense icon="chevron_left" @click="$emit('previous')" />
      <q-btn outline dense no-caps color="primary" label="Today" @click="$emit('today')" />
      <q-btn flat round dense icon="chevron_right" @click="$emit('next')" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  kicker: string;
  monthName: string;
  currentYear: number;
}

defineProps<Props>();

defineEmits(['previous', 'today', 'next']);
</script>

<style scoped>
.calendar-toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.calendar-kicker {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  letter-spacing: 1px;
}

.calendar-month {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
</style>
