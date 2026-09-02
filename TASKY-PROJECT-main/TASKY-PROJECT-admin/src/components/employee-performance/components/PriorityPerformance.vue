<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="text-h6 text-weight-bold q-mb-md">Priority Performance</div>
    
    <q-table
      :rows="priorityData"
      :columns="columns"
      row-key="priority"
      flat
      bordered
      hide-pagination
    >
      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-badge :color="getPriorityColor(props.row.priority)">
            {{ props.row.priority.charAt(0).toUpperCase() + props.row.priority.slice(1) }}
          </q-badge>
        </q-td>
      </template>
      
      <template v-slot:body-cell-completionRate="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-linear-progress
              :value="props.row.completionRate"
              rounded
              size="8px"
              :color="getProgressColor(props.row.completionRate)"
              track-color="grey-3"
              class="q-mr-sm"
              style="width: 80px"
            />
            <span>{{ props.row.completionRate }}%</span>
          </div>
        </q-td>
      </template>
      
      <template v-slot:body-cell-avgCompletionTime="props">
        <q-td :props="props">
          {{ props.row.avgCompletionTime.toFixed(1) }} days
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  priorityData: any[];
}>();

const columns = [
  {
    name: 'priority',
    required: true,
    label: 'Priority',
    align: 'left' as const,
    field: 'priority',
  },
  {
    name: 'totalTasks',
    required: true,
    label: 'Total Tasks',
    align: 'center' as const,
    field: 'totalTasks',
  },
  {
    name: 'completedTasks',
    required: true,
    label: 'Completed',
    align: 'center' as const,
    field: 'completedTasks',
  },
  {
    name: 'delayedTasks',
    required: true,
    label: 'Delayed',
    align: 'center' as const,
    field: 'delayedTasks',
  },
  {
    name: 'completionRate',
    required: true,
    label: 'Completion Rate',
    align: 'left' as const,
    field: 'completionRate',
  },
  {
    name: 'avgCompletionTime',
    required: true,
    label: 'Avg Completion Time',
    align: 'center' as const,
    field: 'avgCompletionTime',
  },
];

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'negative',
    high: 'orange',
    medium: 'primary',
    low: 'positive',
  };
  return colors[priority] || 'grey';
}

function getProgressColor(rate: number): string {
  if (rate >= 90) return 'positive';
  if (rate >= 70) return 'primary';
  if (rate >= 50) return 'warning';
  return 'negative';
}
</script>
