<template>
  <q-page class="q-pa-md text-black">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="column">
        <div class="text-h5 text-weight-bold">Task Manager</div>
        <div class="text-grey-7 text-caption">Manage your assigned tasks</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          rounded
          bg-color="white"
          placeholder="Search tasks..."
          style="width: 250px"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-3">
        <q-select
          v-model="statusFilter"
          :options="statusOptions"
          label="Status"
          outlined
          dense
          emit-value
          map-options
          clearable
        />
      </div>
      <div class="col-3">
        <q-select
          v-model="priorityFilter"
          :options="priorityOptions"
          label="Priority"
          outlined
          dense
          emit-value
          map-options
          clearable
        />
      </div>
      <div class="col-3">
        <q-select
          v-model="projectFilter"
          :options="projectOptions"
          label="Project"
          outlined
          dense
          emit-value
          map-options
          clearable
        />
      </div>
      <div class="col-3">
        <q-btn color="primary" label="Apply Filters" @click="applyFilters" class="full-height" />
      </div>
    </div>

    <!-- Tasks Table -->
    <q-card>
      <q-card-section>
        <div class="text-h6 text-weight-bold">My Tasks ({{ filteredTasks.length }})</div>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="filteredTasks"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
        >
          <template v-slot:body-cell-title="props">
            <q-td :props="props">
              <div class="text-weight-bold">{{ props.row.title }}</div>
              <div class="text-caption text-grey-7">{{ props.row.description }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-project="props">
            <q-td :props="props">
              <div>{{ getProjectName(props.row.project_id) }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-priority="props">
            <q-td :props="props">
              <q-badge
                :color="`${getPriorityColor(props.row.priority)}-1`"
                :text-color="getPriorityColor(props.row.priority)"
              >
                {{ props.row.priority }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="`${getStatusColor(props.row.status)}-1`"
                :text-color="getStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-progress="props">
            <q-td :props="props">
              <q-linear-progress
                :value="props.row.progress / 100"
                :color="props.row.progress === 100 ? 'green' : 'primary'"
                size="8px"
              />
              <div class="text-caption q-mt-xs">{{ props.row.progress }}%</div>
            </q-td>
          </template>

          <template v-slot:body-cell-deadline="props">
            <q-td :props="props">
              <div
                :class="{
                  'text-red': isOverdue(props.row.deadline) && props.row.status !== 'completed',
                }"
              >
                {{ formatDate(props.row.deadline) }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  v-if="props.row.status === 'in-progress' || props.row.status === 'not-started'"
                  flat
                  round
                  dense
                  icon="edit"
                  color="blue"
                  size="sm"
                  @click="openUpdateDialog(props.row)"
                />
                <q-btn
                  v-if="
                    props.row.status === 'completed' ||
                    props.row.status === 'in-review' ||
                    (props.row.status === 'in-progress' && props.row.progress === 100)
                  "
                  flat
                  round
                  dense
                  icon="rate_review"
                  color="purple"
                  size="sm"
                  @click="openSubmitReviewDialog(props.row)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Update Task Progress Dialog -->
    <q-dialog v-model="showUpdateDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Update Task Progress</div>
        </q-card-section>
        <q-card-section>
          <div v-if="selectedTask">
            <div class="q-mb-md">
              <div class="text-subtitle2">{{ selectedTask.title }}</div>
              <div class="text-caption text-grey-7">
                {{ getProjectName(selectedTask.project_id) }}
              </div>
            </div>
            <q-slider v-model="progressUpdate" :min="0" :max="100" label-always color="primary" />
            <q-select
              v-model="statusUpdate"
              :options="statusOptions"
              label="Status"
              outlined
              class="q-mt-md"
            />
            <q-input
              v-model="hoursSpent"
              type="number"
              label="Hours Spent"
              outlined
              class="q-mt-md"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Update" @click="updateTaskProgress" :loading="updating" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Submit for Review Dialog -->
    <q-dialog v-model="showSubmitReviewDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Put for Review</div>
        </q-card-section>
        <q-card-section>
          <div v-if="selectedTask">
            <div class="q-mb-md">
              <div class="text-subtitle2">{{ selectedTask.title }}</div>
              <div class="text-caption text-grey-7">
                {{ getProjectName(selectedTask.project_id) }}
              </div>
            </div>
            <q-input
              v-model="completionComment"
              label="Completion Comment"
              type="textarea"
              outlined
              rows="3"
              class="q-mt-md"
            />
            <q-select
              v-model="selectedReviewer"
              :options="reviewerOptions"
              label="Select Reviewer"
              outlined
              class="q-mt-md"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Submit" @click="submitForReview" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore';

defineOptions({
  name: 'EmployeeTasks',
});

const authStore = useAuthStore();

const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const priorityFilter = ref('');
const projectFilter = ref('');
const myTasks = ref<any[]>([]);
const projects = ref<any[]>([]);
const employees = ref<any[]>([]);

const showUpdateDialog = ref(false);
const showSubmitReviewDialog = ref(false);
const selectedTask = ref<any>(null);
const progressUpdate = ref(0);
const statusUpdate = ref('in-progress');
const hoursSpent = ref(0);
const completionComment = ref('');
const selectedReviewer = ref<number | null>(null);
const updating = ref(false);
const submitting = ref(false);

const statusOptions = ['not-started', 'in-progress', 'completed', 'blocked', 'in-review'];
const priorityOptions = ['critical', 'high', 'medium', 'low'];

const columns = [
  { name: 'title', label: 'Task', field: 'title', align: 'left' as const, sortable: true },
  {
    name: 'project',
    label: 'Project',
    field: 'project_id',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'priority',
    label: 'Priority',
    field: 'priority',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const, sortable: true },
  {
    name: 'progress',
    label: 'Progress',
    field: 'progress',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'deadline',
    label: 'Deadline',
    field: 'deadline',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' as const },
];

const projectOptions = computed(() =>
  projects.value.map((p: any) => ({ label: p.name, value: p.id })),
);

const reviewerOptions = computed(() =>
  employees.value
    .filter((e: any) => e.id !== authStore.user?.id)
    .map((e: any) => ({ label: `${e.first_name} ${e.last_name}`, value: e.id })),
);

const filteredTasks = computed(() => {
  let tasks = [...myTasks.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    tasks = tasks.filter(
      (t: any) =>
        t.title.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query),
    );
  }

  if (statusFilter.value) {
    tasks = tasks.filter((t: any) => t.status === statusFilter.value);
  }

  if (priorityFilter.value) {
    tasks = tasks.filter((t: any) => t.priority === priorityFilter.value);
  }

  if (projectFilter.value) {
    tasks = tasks.filter((t: any) => t.project_id === projectFilter.value);
  }

  return tasks;
});

onMounted(async () => {
  await fetchFromDatabase();
});

async function fetchFromDatabase() {
  if (!authStore.user?.id) return;

  loading.value = true;
  try {
    const tasksResponse = await fetch(
      `http://localhost:3001/api/tasks/employee/${authStore.user.id}`,
    );
    const tasksData = await tasksResponse.json();
    if (tasksData.success) {
      myTasks.value = tasksData.tasks;
    }

    const projectsResponse = await fetch('http://localhost:3001/api/pm/projects');
    const projectsData = await projectsResponse.json();
    if (projectsData.success) {
      projects.value = projectsData.projects;
    }

    const employeesResponse = await fetch('http://localhost:3001/api/users');
    const employeesData = await employeesResponse.json();
    if (employeesData.success) {
      employees.value = employeesData.users;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  // Filters are applied via computed property
}

function getProjectName(projectId: number) {
  const project = projects.value.find((p: any) => p.id === projectId);
  return project?.name || 'Unknown Project';
}

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'green',
  };
  return colors[priority] || 'grey';
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'not-started': 'grey',
    'in-progress': 'blue',
    completed: 'green',
    'in-review': 'purple',
    blocked: 'red',
  };
  return colors[status] || 'grey';
}

function formatDate(date: string) {
  if (!date) return 'No deadline';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(deadline: string) {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function openUpdateDialog(task: any) {
  selectedTask.value = task;
  progressUpdate.value = task.progress;
  statusUpdate.value = task.status;
  hoursSpent.value = 0;
  showUpdateDialog.value = true;
}

async function updateTaskProgress() {
  if (!selectedTask.value) return;

  updating.value = true;
  try {
    let finalProgress = progressUpdate.value;
    if (statusUpdate.value === 'completed') {
      finalProgress = 100;
    }

    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedTask.value.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          progress: finalProgress,
          status: statusUpdate.value,
          hours_spent: hoursSpent.value,
        }),
      },
    );

    const data = await response.json();
    if (data.success) {
      showUpdateDialog.value = false;
      await fetchFromDatabase();
    }
  } catch (error) {
    console.error('Error updating task:', error);
  } finally {
    updating.value = false;
  }
}

function openSubmitReviewDialog(task: any) {
  selectedTask.value = task;
  completionComment.value = '';
  selectedReviewer.value = null;
  showSubmitReviewDialog.value = true;
}

async function submitForReview() {
  if (!selectedTask.value || !selectedReviewer.value) return;

  submitting.value = true;
  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedTask.value.id}/submit-review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          completion_comment: completionComment.value,
          reviewer_id: selectedReviewer.value,
        }),
      },
    );

    const data = await response.json();
    if (data.success) {
      showSubmitReviewDialog.value = false;
      await fetchFromDatabase();
    }
  } catch (error) {
    console.error('Error submitting for review:', error);
  } finally {
    submitting.value = false;
  }
}
</script>
