<template>
  <q-page class="q-pa-md text-black">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="column">
        <div class="text-h5 text-weight-bold">Planner</div>
        <div class="text-grey-7 text-caption">Your deadlines and work schedule</div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-3">
        <StatCard
          title="Upcoming Deadlines"
          :value="upcomingDeadlines.toString()"
          color="orange"
          icon="o_event"
          caption="Next 7 days"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Overdue Tasks"
          :value="overdueTasks.toString()"
          color="red"
          icon="o_warning"
          caption="Past deadline"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="This Week Hours"
          :value="weeklyHours.toString()"
          color="blue"
          icon="o_schedule"
          caption="Estimated"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Active Tasks"
          :value="activeTasks.toString()"
          color="green"
          icon="o_task_alt"
          caption="In progress"
        />
      </div>
    </div>

    <!-- Tasks Timeline -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 text-weight-bold">Task Timeline</div>
        <div class="text-caption text-grey-7">Your tasks sorted by deadline</div>
      </q-card-section>
      <q-card-section>
        <q-timeline color="primary">
          <q-timeline-entry
            v-for="task in sortedTasks"
            :key="task.id"
            :title="task.title"
            :subtitle="formatDate(task.deadline)"
            :icon="getTimelineIcon(task.status)"
            :color="getTimelineColor(task.status)"
          >
            <div>
              <div class="text-caption text-grey-7">{{ getProjectName(task.project_id) }}</div>
              <div class="q-mt-sm">
                <q-badge
                  :color="`${getPriorityColor(task.priority)}-1`"
                  :text-color="getPriorityColor(task.priority)"
                  :label="task.priority"
                  class="q-mr-xs"
                />
                <q-badge
                  :color="`${getStatusColor(task.status)}-1`"
                  :text-color="getStatusColor(task.status)"
                  :label="task.status"
                />
              </div>
              <div class="q-mt-sm">
                <q-linear-progress
                  :value="task.progress / 100"
                  :color="task.progress === 100 ? 'green' : 'primary'"
                  size="8px"
                />
                <div class="text-caption q-mt-xs">{{ task.progress }}% complete</div>
              </div>
              <div class="q-mt-sm">
                <q-btn
                  v-if="task.status === 'in-progress' || task.status === 'not-started'"
                  flat
                  round
                  dense
                  icon="edit"
                  color="blue"
                  size="sm"
                  @click="openUpdateDialog(task)"
                />
                <q-btn
                  v-if="
                    task.status === 'completed' ||
                    task.status === 'in-review' ||
                    (task.status === 'in-progress' && task.progress === 100)
                  "
                  flat
                  round
                  dense
                  icon="rate_review"
                  color="purple"
                  size="sm"
                  @click="openSubmitReviewDialog(task)"
                />
              </div>
            </div>
          </q-timeline-entry>
        </q-timeline>
        <div v-if="sortedTasks.length === 0" class="text-center q-pa-xl text-grey-6">
          <q-icon name="event_busy" size="48px" class="q-mb-sm" />
          <div class="text-h6">No tasks</div>
          <div>No task entries found</div>
        </div>
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
import StatCard from '../../components/StatCard.vue';

defineOptions({
  name: 'EmployeePlanner',
});

const authStore = useAuthStore();

const loading = ref(false);
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

const reviewerOptions = computed(() =>
  employees.value
    .filter((e: any) => e.id !== authStore.user?.id)
    .map((e: any) => ({ label: `${e.first_name} ${e.last_name}`, value: e.id })),
);

const sortedTasks = computed(() => {
  return [...myTasks.value].sort((a: any, b: any) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
});

const upcomingDeadlines = computed(() => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return myTasks.value.filter((t: any) => {
    if (!t.deadline || t.status === 'completed') return false;
    const deadline = new Date(t.deadline);
    return deadline >= today && deadline <= nextWeek;
  }).length;
});

const overdueTasks = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return myTasks.value.filter((t: any) => {
    if (!t.deadline || t.status === 'completed') return false;
    const deadline = new Date(t.deadline);
    return deadline < today;
  }).length;
});

const weeklyHours = computed(() => {
  return myTasks.value
    .filter((t: any) => t.status !== 'completed')
    .reduce((acc: number, t: any) => acc + (t.expected_effort || 0), 0);
});

const activeTasks = computed(() => {
  return myTasks.value.filter((t: any) => t.status === 'in-progress').length;
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

function getTimelineIcon(status: string) {
  const icons: Record<string, string> = {
    'not-started': 'radio_button_unchecked',
    'in-progress': 'pending',
    completed: 'check_circle',
    'in-review': 'rate_review',
    blocked: 'cancel',
  };
  return icons[status] || 'circle';
}

function getTimelineColor(status: string) {
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
