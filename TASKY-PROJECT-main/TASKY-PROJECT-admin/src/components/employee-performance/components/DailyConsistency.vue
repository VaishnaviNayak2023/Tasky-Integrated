<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="text-h6 text-weight-bold q-mb-md">Daily Consistency</div>
    
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <div class="text-body2 text-grey-6 q-mb-sm">Tasks Assigned Today</div>
        <div class="text-h4 text-weight-bold">{{ tasksAssignedToday }}</div>
      </div>
      <div class="col-12 col-md-6">
        <div class="text-body2 text-grey-6 q-mb-sm">Tasks Completed Today</div>
        <div class="text-h4 text-weight-bold">{{ tasksCompletedToday }}</div>
      </div>
    </div>

    <div class="q-mt-md">
      <div class="text-body2 text-grey-6 q-mb-sm">Completion Ratio</div>
      <q-linear-progress
        :value="completionRatio"
        rounded
        size="8px"
        :color="completionRatio > 80 ? 'positive' : completionRatio > 50 ? 'primary' : 'warning'"
        track-color="grey-3"
      />
      <div class="text-caption text-grey-6 q-mt-xs">
        {{ tasksCompletedToday }}/{{ tasksAssignedToday }} tasks completed ({{ completionRatio.toFixed(0) }}%)
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  tasksAssignedToday: number;
  tasksCompletedToday: number;
}>();

const completionRatio = computed(() => {
  if (props.tasksAssignedToday === 0) return 0;
  return (props.tasksCompletedToday / props.tasksAssignedToday) * 100;
});
</script>
