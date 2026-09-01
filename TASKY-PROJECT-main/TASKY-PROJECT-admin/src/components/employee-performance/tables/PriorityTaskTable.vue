<template>
  <div class="priority-task-table">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-bold">Tasks by Priority</div>
      
      <div class="row q-gutter-sm">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search tasks..."
          style="width: 250px"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        
        <q-btn
          flat
          round
          dense
          icon="download"
          @click="$emit('download')"
        >
          <q-tooltip>Download</q-tooltip>
        </q-btn>
      </div>
    </div>
    
    <q-table
      :rows="filteredTasks"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      :pagination="pagination"
      :rows-per-page-options="[10, 25, 50]"
      @request="handleRequest"
    >
      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-badge :color="getPriorityColor(props.row.priority)">
            {{ props.row.priority.charAt(0).toUpperCase() + props.row.priority.slice(1) }}
          </q-badge>
        </q-td>
      </template>
      
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            {{ formatStatus(props.row.status) }}
          </q-badge>
        </q-td>
      </template>
      
      <template v-slot:body-cell-completionTime="props">
        <q-td :props="props">
          <span v-if="props.row.completionTime">
            {{ props.row.completionTime }} days
          </span>
          <span v-else class="text-grey-6">-</span>
        </q-td>
      </template>
      
      <template v-slot:no-data>
        <div class="column items-center justify-center q-pa-xl">
          <q-icon name="task_alt" size="40px" color="grey-4" />
          <div class="text-body1 text-grey-6 q-mt-md">No tasks found</div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TaskByPriority } from '@/services/performance/performanceApi';

interface Props {
  tasks: TaskByPriority[];
  loading?: boolean;
  pagination?: {
    page: number;
    rowsPerPage: number;
    rowsNumber: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: () => ({ page: 1, rowsPerPage: 10, rowsNumber: 0 }),
});

const emit = defineEmits<{
  request: [props: { pagination: { page: number; rowsPerPage: number } }];
  download: [];
}>();

const searchQuery = ref('');
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Task Name',
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'project',
    required: true,
    label: 'Project',
    align: 'left' as const,
    field: 'project',
    sortable: true,
  },
  {
    name: 'assignee',
    required: true,
    label: 'Assignee',
    align: 'left' as const,
    field: 'assignee',
    sortable: true,
  },
  {
    name: 'priority',
    required: true,
    label: 'Priority',
    align: 'center' as const,
    field: 'priority',
    sortable: true,
  },
  {
    name: 'status',
    required: true,
    label: 'Status',
    align: 'center' as const,
    field: 'status',
    sortable: true,
  },
  {
    name: 'createdAt',
    required: true,
    label: 'Created On',
    align: 'left' as const,
    field: 'createdAt',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString(),
  },
  {
    name: 'dueDate',
    required: true,
    label: 'Due Date',
    align: 'left' as const,
    field: 'dueDate',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString(),
  },
  {
    name: 'completionTime',
    required: true,
    label: 'Completion Time',
    align: 'center' as const,
    field: 'completionTime',
    sortable: true,
  },
];

const filteredTasks = computed(() => {
  if (!searchQuery.value) return props.tasks;
  
  const query = searchQuery.value.toLowerCase();
  return props.tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query) ||
      task.assignee.toLowerCase().includes(query)
  );
});

function handleRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  emit('request', props);
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'negative',
    high: 'orange',
    medium: 'primary',
    low: 'positive',
  };
  return colors[priority] || 'grey';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: 'positive',
    in_progress: 'primary',
    not_started: 'grey',
    blocked: 'negative',
    on_hold: 'warning',
  };
  return colors[status] || 'grey';
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
</script>

<style scoped>
.priority-task-table {
  min-height: 400px;
}
</style>
