<template>
  <div
    class="table-container position-relative"
    style="height: 100%; min-height: 0; overflow: hidden; display: flex; flex-direction: column"
  >
    <q-table
      :rows="filteredTasks"
      :columns="columns"
      row-key="id"
      flat
      bordered
      v-model:pagination="pagination"
      selection="multiple"
      v-model:selected="selected"
      class="full-height-table"
      style="border-radius: 8px; flex: 1 1 0"
      :loading="taskStore.loading"
    >
      <!-- Loading State -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- Task Column -->
      <template v-slot:body-cell-task="props">
        <q-td :props="props" class="cursor-pointer" @click="$emit('view', props.row)">
          <div class="column">
            <div class="text-weight-bold text-subtitle2" style="font-size: 13px; line-height: 1.2">
              {{ props.row.title }}
            </div>
            <div
              class="text-caption text-grey-6"
              style="
                font-size: 11px;
                max-width: 250px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 2px;
              "
            >
              {{ props.row.description || 'No description' }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- Project Column -->
      <template v-slot:body-cell-project="props">
        <q-td :props="props" style="width: 180px">
          <div class="row items-center no-wrap cursor-pointer" @click="$emit('view', props.row)">
            <q-avatar
              :color="props.row.project_color || 'primary'"
              text-color="white"
              size="24px"
              class="q-mr-sm"
              style="font-weight: bold; font-size: 11px"
            >
              {{ props.row.project_name ? props.row.project_name.charAt(0).toUpperCase() : 'P' }}
            </q-avatar>
            <div class="text-grey-8" style="font-size: 12px; white-space: normal; line-height: 1.2">
              {{ props.row.project_name }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- Priority Column -->
      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-badge
            :color="`${getPriorityColor(props.row.priority)}-1`"
            :text-color="getPriorityColor(props.row.priority)"
            :label="formatName(props.row.priority)"
            class="q-px-sm q-py-xs text-weight-bold rounded-borders"
            style="font-size: 10px"
          />
        </q-td>
      </template>

      <!-- Status Column -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="`${getStatusColor(props.row.status)}-1`"
            :text-color="getStatusColor(props.row.status)"
            :label="formatName(props.row.status)"
            class="q-px-sm q-py-xs text-weight-bold rounded-borders"
            style="font-size: 10px"
          />
        </q-td>
      </template>

      <!-- Progress Column -->
      <template v-slot:body-cell-progress="props">
        <q-td :props="props">
          <div class="column" style="width: 80px">
            <q-circular-progress
              :value="props.row.progress || 0"
              :color="getProgressColor(props.row.progress)"
              size="32px"
              track-color="grey-3"
              :thickness="0.2"
              class="q-mb-xs"
              show-value
              :style="`font-size: 10px; font-weight: bold; color: ${getProgressColor(props.row.progress)}`"
            >
              {{ props.row.progress || 0 }}
            </q-circular-progress>
          </div>
        </q-td>
      </template>

      <!-- Assignee Column -->
      <template v-slot:body-cell-assignee="props">
        <q-td :props="props">
          <div class="row items-center justify-center">
            <template v-if="props.row.assignees && props.row.assignees.length > 0">
              <q-avatar
                v-for="(member, i) in props.row.assignees.slice(0, 2)"
                :key="member.id"
                size="24px"
                class="overlapping-avatar"
                :style="`margin-left: ${i === 0 ? 0 : '-8px'}; border: 2px solid white;`"
              >
                <img :src="member.avatar || `https://i.pravatar.cc/150?img=${member.id}`" />
                <q-tooltip>{{ member.first_name }} {{ member.last_name }}</q-tooltip>
              </q-avatar>
              <q-avatar
                v-if="props.row.assignees.length > 2"
                size="24px"
                color="indigo-1"
                text-color="indigo"
                class="overlapping-avatar"
                style="
                  margin-left: -8px;
                  border: 2px solid white;
                  font-size: 10px;
                  font-weight: bold;
                "
              >
                +{{ props.row.assignees.length - 2 }}
              </q-avatar>
            </template>
            <span v-else class="text-caption text-grey-5">Unassigned</span>
          </div>
        </q-td>
      </template>

      <!-- Deadline Column -->
      <template v-slot:body-cell-deadline="props">
        <q-td :props="props">
          <div class="column">
            <div
              :class="['text-weight-bold', isOverdue(props.row) ? 'text-red' : 'text-grey-8']"
              style="font-size: 12px"
            >
              {{ formatDate(props.row.deadline) }}
            </div>
            <div
              v-if="props.row.status !== 'completed'"
              :class="['text-caption', isOverdue(props.row) ? 'text-red' : 'text-grey-6']"
              style="font-size: 10px"
            >
              {{ getDeadlineText(props.row) }}
            </div>
            <div v-else class="text-caption text-grey-6" style="font-size: 10px">Completed</div>
          </div>
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center justify-center q-gutter-x-xs no-wrap">
            <q-btn
              v-if="props.row.status === 'in-review'"
              flat
              round
              dense
              icon="rate_review"
              color="purple"
              size="10px"
              class="bg-purple-1"
              @click.stop="$emit('assign-reviewer', props.row)"
            >
              <q-tooltip>Assign Reviewer</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 'pending-final'"
              flat
              round
              dense
              icon="fact_check"
              color="green"
              size="10px"
              class="bg-green-1"
              @click.stop="$emit('finalize-review', props.row)"
            >
              <q-tooltip>Finalize Review</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :icon="props.row.is_visible ? 'visibility' : 'visibility_off'"
              :color="props.row.is_visible ? 'indigo' : 'grey-6'"
              size="10px"
              :class="props.row.is_visible ? 'bg-indigo-1' : 'bg-grey-2'"
              @click.stop="toggleVisibility(props.row)"
            >
              <q-tooltip>{{
                props.row.is_visible ? 'Hide from Employees' : 'Show to Employees'
              }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="more_vert"
              color="grey-7"
              size="10px"
              class="bg-grey-2"
              @click.stop
            >
              <q-menu>
                <q-list style="min-width: 150px">
                  <q-item clickable v-close-popup @click="$emit('edit', props.row)">
                    <q-item-section avatar><q-icon name="edit" size="sm" /></q-item-section>
                    <q-item-section>Edit Task</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="$emit('delete', props.row)">
                    <q-item-section avatar
                      ><q-icon name="delete" size="sm" color="red"
                    /></q-item-section>
                    <q-item-section class="text-red">Delete Task</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Custom Bottom / Pagination -->
      <template v-slot:bottom>
        <div
          class="row items-center justify-between text-grey-7 full-width q-py-xs"
          style="font-size: 13px"
        >
          <div>
            Showing {{ showingStart }} to {{ showingEnd }} of {{ filteredTasks.length }} tasks
          </div>
          <div class="row items-center q-gutter-x-sm">
            <span>Rows per page:</span>
            <q-select
              v-model="pagination.rowsPerPage"
              outlined
              dense
              :options="[5, 10, 20]"
              class="q-mr-md bg-white"
              style="width: 70px"
              rounded
              @update:model-value="pagination.page = 1"
            />
            <q-btn
              flat
              round
              dense
              icon="chevron_left"
              :disable="pagination.page === 1"
              @click="pagination.page--"
            />
            <q-btn
              v-for="p in totalPages"
              :key="p"
              :unelevated="p === pagination.page"
              :flat="p !== pagination.page"
              round
              dense
              :color="p === pagination.page ? 'indigo-1' : ''"
              :text-color="p === pagination.page ? 'indigo' : 'grey-7'"
              :label="p"
              size="12px"
              @click="pagination.page = p"
            />
            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              :disable="pagination.page === totalPages"
              @click="pagination.page++"
            />
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-pa-xl">
          <q-icon size="2em" name="assignment_turned_in" />
          <span class="q-ml-sm">No tasks found based on current filters.</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QTableProps } from 'quasar';
import { usePmTaskStore } from '../stores/pmTaskStore';
import { date } from 'quasar';

const taskStore = usePmTaskStore();

const selected = ref([]);

const columns: QTableProps['columns'] = [
  { name: 'task', label: 'Task', field: 'title', align: 'left', sortable: true },
  { name: 'project', label: 'Project', field: 'project_name', align: 'left', sortable: true },
  { name: 'priority', label: 'Priority', field: 'priority', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'progress', label: 'Progress', field: 'progress', align: 'left', sortable: true },
  { name: 'assignee', label: 'Assignee', field: 'assignees', align: 'center' },
  { name: 'deadline', label: 'Deadline', field: 'deadline', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
];

const filteredTasks = computed(() => taskStore.tasks);

const formatName = (val: string) => {
  if (!val) return '';
  return val
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (val: string) => {
  if (!val) return '';
  return date.formatDate(val, 'MMM D, YYYY');
};

const getPriorityColor = (priority: string) => {
  if (priority === 'critical') return 'red';
  if (priority === 'high') return 'orange';
  if (priority === 'medium') return 'blue';
  return 'grey';
};

const getStatusColor = (status: string) => {
  if (status === 'completed') return 'green';
  if (status === 'in-progress') return 'blue';
  if (status === 'blocked') return 'red';
  if (status === 'not-started') return 'grey';
  return 'grey';
};

const getProgressColor = (progress: number) => {
  const p = progress || 0;
  if (p === 100) return 'green';
  if (p >= 50) return 'blue';
  if (p > 0) return 'orange';
  return 'grey-4';
};

const isOverdue = (task: any) => {
  if (task.status === 'completed') return false;
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
};

const getDeadlineText = (task: any) => {
  if (!task.deadline) return '';
  const now = new Date(new Date().setHours(0, 0, 0, 0));
  const deadline = new Date(task.deadline);

  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Due today';
  return `${diffDays} days left`;
};

const toggleVisibility = async (task: any) => {
  try {
    const newVisibility = !task.is_visible;
    const response = await fetch(`http://localhost:3001/api/pm/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: newVisibility }),
    });
    const data = await response.json();
    if (data.success) {
      task.is_visible = newVisibility;
    }
  } catch (error) {
    console.error('Error toggling visibility:', error);
  }
};

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTasks.value.length / pagination.value.rowsPerPage)),
);
const showingStart = computed(() =>
  filteredTasks.value.length === 0
    ? 0
    : (pagination.value.page - 1) * pagination.value.rowsPerPage + 1,
);
const showingEnd = computed(() =>
  Math.min(pagination.value.page * pagination.value.rowsPerPage, filteredTasks.value.length),
);
</script>

<style scoped>
.overlapping-avatar {
  z-index: 1;
}
.overlapping-avatar:hover {
  z-index: 10;
}

/* Sticky Header Table styling */
.full-height-table {
  height: 100%;
}
:deep(.full-height-table .q-table__middle) {
  max-height: 100%;
}
:deep(.full-height-table thead tr th) {
  position: sticky;
  z-index: 1;
  background-color: #fff;
  font-weight: 600;
  color: #757575;
}
:deep(.full-height-table thead tr:first-child th) {
  top: 0;
}
</style>
