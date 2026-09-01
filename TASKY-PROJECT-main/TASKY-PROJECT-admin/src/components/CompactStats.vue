<template>
  <div class="compact-stats q-px-md q-py-sm">
    <div class="compact-stat">
      <div class="compact-stat-value">{{ totalTasks }}</div>
      <div class="compact-stat-label">Tasks</div>
    </div>
    <div class="compact-stat">
      <div class="compact-stat-value">{{ completedTasks }}</div>
      <div class="compact-stat-label">Done</div>
    </div>
    <div class="compact-stat">
      <div class="compact-stat-value">{{ completionRate }}%</div>
      <div class="compact-stat-label">Rate</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

defineProps<Props>();
</script>

<style scoped>
.compact-stats {
  display: flex;
  gap: 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.compact-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compact-stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.compact-stat-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
