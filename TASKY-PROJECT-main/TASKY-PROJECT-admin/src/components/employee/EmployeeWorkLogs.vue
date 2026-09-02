<template>
  <q-card class="q-mt-md">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6 text-weight-bold">Recent Work Logs</div>
        <q-btn flat color="primary" label="View All" to="/work-log" />
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-list separator>
        <q-item v-for="log in workLogs" :key="log.id">
          <q-item-section avatar>
            <q-icon :name="getLogStatusIcon(log.status)" :color="getLogStatusColor(log.status)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ getTaskName(log.task_id) }}</q-item-label>
            <q-item-label caption>
              {{ log.log_date }} • {{ log.hours_spent }}h spent
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="getLogStatusColor(log.status)" class="text-capitalize">
              {{ log.status?.replace('-', ' ') || 'Logged' }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  workLogs: any[];
  tasks: any[];
}

defineProps<Props>();

function getTaskName(taskId: string | number) {
  return 'Unknown Task';
}

function getLogStatusIcon(status: string) {
  const icons: Record<string, string> = {
    completed: 'check_circle',
    'partially-completed': 'remove_circle',
    'in-progress': 'pending',
  };
  return icons[status] || 'circle';
}

function getLogStatusColor(status: string) {
  const colors: Record<string, string> = {
    completed: 'green',
    'partially-completed': 'orange',
    'in-progress': 'blue',
  };
  return colors[status] || 'grey';
}
</script>
