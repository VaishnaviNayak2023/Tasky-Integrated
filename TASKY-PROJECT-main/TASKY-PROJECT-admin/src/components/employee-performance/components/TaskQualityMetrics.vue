<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="text-h6 text-weight-bold q-mb-md">Task Quality Metrics</div>
    
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="column items-center q-pa-md bg-orange-1 rounded-borders">
          <div class="text-h4 text-weight-bold text-orange">{{ reopenedTasks }}</div>
          <div class="text-caption text-grey-7">Reopened Tasks</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="column items-center q-pa-md bg-purple-1 rounded-borders">
          <div class="text-h4 text-weight-bold text-purple">{{ revisionRequests }}</div>
          <div class="text-caption text-grey-7">Revision Requests</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="column items-center q-pa-md bg-green-1 rounded-borders">
          <div class="text-h4 text-weight-bold text-green">{{ firstTimeCompletion }}%</div>
          <div class="text-caption text-grey-7">First-Time Completion</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="column items-center q-pa-md bg-blue-1 rounded-borders">
          <div class="text-h4 text-weight-bold text-blue">{{ avgSubtaskAccuracy }}%</div>
          <div class="text-caption text-grey-7">Avg Subtask Accuracy</div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  reopenedTasks: number;
  revisionRequests: number;
  firstTimeCompletion: number;
  avgSubtaskAccuracy: number;
}>();
</script>
