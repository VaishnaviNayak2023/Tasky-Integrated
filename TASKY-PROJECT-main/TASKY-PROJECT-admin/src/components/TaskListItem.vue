<template>
  <q-item class="task-item q-mb-sm" clickable @click="$emit('click', task)">
    <q-item-section avatar>
      <q-checkbox
        :model-value="task.status === 'Completed'"
        color="primary"
        @update:model-value="$emit('status-change', task, $event)"
        @click.stop
      />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">
        {{ task.name }}
      </q-item-label>
      <q-item-label caption> {{ task.project }} · {{ task.priority }} </q-item-label>
    </q-item-section>

    <q-item-section side>
      <div class="row items-center q-gutter-xs">
        <q-badge :color="getStatusColor(task.status)" :label="task.status" class="q-py-xs" />
        <q-linear-progress
          :value="(task.progress || 0) / 100"
          :color="getProgressColor(task.progress)"
          size="4px"
          class="q-ml-sm"
          style="width: 60px"
        />
      </div>
    </q-item-section>

    <q-item-section side>
      <q-btn flat round dense icon="more_vert" @click.stop="$emit('menu-click', task)" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
interface Task {
  id: number;
  name: string;
  project: string;
  priority: string;
  status: string;
  progress: number;
}

interface Props {
  task: Task;
}

defineProps<Props>();

defineEmits(['click', 'status-change', 'menu-click']);

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Completed: 'green',
    'In Progress': 'blue',
    'Not Started': 'grey',
    Blocked: 'red',
  };
  return colors[status] || 'grey';
};

const getProgressColor = (progress: number) => {
  if (progress === 100) return 'green';
  if (progress >= 50) return 'blue';
  if (progress > 0) return 'orange';
  return 'grey-4';
};
</script>

<style scoped>
.task-item {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.task-item:hover {
  background: #f5f5f5;
  transform: translateX(4px);
}
</style>
