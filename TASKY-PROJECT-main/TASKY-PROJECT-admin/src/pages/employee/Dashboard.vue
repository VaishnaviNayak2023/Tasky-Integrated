<template>
  <q-page
    class="q-pa-md text-black"
    style="
      height: 100vh;
      max-height: 100vh;
      min-height: 0 !important;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    "
  >
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="column">
        <div class="text-h5 text-weight-bold">My Workspace 👋</div>
        <div class="text-grey-7 text-caption">Overview of your tasks and progress</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-avatar size="36px" class="cursor-pointer">
          <img :src="authStore.user?.avatar || 'https://cdn.quasar.dev/img/avatar.png'" />
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup to="/employee/settings">
                <q-item-section avatar><q-icon name="person" /></q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar><q-icon name="logout" color="red" /></q-item-section>
                <q-item-section class="text-red">Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md" style="flex: 0 0 auto">
      <div class="col-3">
        <StatCard
          title="Total Tasks"
          :value="stats.totalTasks.toString()"
          color="blue"
          icon="o_task_alt"
          caption="Assigned to you"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Completed"
          :value="stats.completedTasks.toString()"
          color="green"
          icon="o_check_circle"
          caption="Tasks finished"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="In Progress"
          :value="stats.inProgressTasks.toString()"
          color="orange"
          icon="o_pending"
          caption="Currently working"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="My Points"
          :value="stats.points.toString()"
          color="purple"
          icon="o_star"
          caption="Points earned"
        />
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey-7 q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      style="flex: 0 0 auto"
    >
      <q-tab name="tasks" label="My Tasks" icon="task" />
      <q-tab name="reviews" label="Reviews" icon="rate_review" />
    </q-tabs>

    <q-tab-panels
      v-model="activeTab"
      animated
      class="transparent"
      style="flex: 1 1 0; min-height: 0"
    >
      <!-- My Tasks Tab -->
      <q-tab-panel name="tasks" class="q-pa-none">
        <div class="row q-col-gutter-md" style="height: 100%; min-height: 0">
          <!-- Tasks Column -->
          <div class="col-12" style="height: 100%; display: flex; flex-direction: column">
            <q-card class="full-height flex column">
              <q-card-section class="bg-blue-1 text-blue-9 q-pb-sm">
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <q-icon name="task" size="24px" class="q-mr-sm" />
                    <div class="text-h6 text-weight-bold">My Tasks</div>
                  </div>
                  <q-spinner-dots v-if="loading" size="24px" />
                </div>
                <div class="text-caption">Your assigned tasks across all projects</div>
              </q-card-section>

              <q-card-section
                class="q-pt-none q-px-md q-pb-md"
                style="flex: 1 1 0; overflow-y: auto"
              >
                <q-list separator v-if="myTasks.length > 0">
                  <q-item v-for="task in myTasks" :key="task.id" class="q-py-md">
                    <q-item-section avatar>
                      <q-circular-progress
                        v-if="task.status === 'completed'"
                        show-value
                        class="text-green text-weight-bold"
                        :value="100"
                        size="40px"
                        color="green"
                        track-color="grey-3"
                        style="font-size: 12px"
                      >
                        100
                      </q-circular-progress>
                      <q-circular-progress
                        v-else-if="task.status === 'in-progress'"
                        show-value
                        class="text-blue text-weight-bold"
                        :value="task.progress"
                        size="40px"
                        color="blue"
                        track-color="grey-3"
                        style="font-size: 12px"
                      >
                        {{ task.progress }}
                      </q-circular-progress>
                      <q-icon
                        v-else-if="task.status === 'in-review'"
                        name="rate_review"
                        color="purple"
                        size="40px"
                      />
                      <q-icon v-else name="radio_button_unchecked" color="grey-5" size="40px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label
                        class="text-weight-bold"
                        :class="{ 'text-strike text-grey-6': task.status === 'completed' }"
                        >{{ task.title }}</q-item-label
                      >
                      <q-item-label caption>{{ getProjectName(task.project_id) }}</q-item-label>
                      <q-item-label caption>
                        <q-badge
                          :color="`${getPriorityColor(task.priority)}-1`"
                          :text-color="getPriorityColor(task.priority)"
                          :label="task.priority"
                          class="q-mr-xs"
                          style="font-size: 10px"
                        />
                        <q-badge
                          :color="`${getStatusColor(task.status)}-1`"
                          :text-color="getStatusColor(task.status)"
                          :label="task.status"
                          style="font-size: 10px"
                        />
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="column items-end q-gutter-xs">
                        <div
                          class="text-caption text-weight-medium"
                          :class="{
                            'text-red': task.status !== 'completed' && isOverdue(task.deadline),
                          }"
                        >
                          {{ formatDate(task.deadline) }}
                        </div>
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
                    </q-item-section>
                  </q-item>
                </q-list>

                <div v-else-if="!loading" class="text-center q-pa-xl text-grey-6">
                  <q-icon name="assignment" size="48px" class="q-mb-sm" />
                  <div class="text-h6">No tasks assigned</div>
                  <div>You have no tasks assigned yet</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- Reviews Tab -->
      <q-tab-panel name="reviews" class="q-pa-none">
        <div class="row q-col-gutter-md" style="height: 100%; min-height: 0">
          <!-- Pending Reviews Column -->
          <div class="col-6" style="height: 100%; display: flex; flex-direction: column">
            <q-card class="full-height flex column">
              <q-card-section class="bg-purple-1 text-purple-9 q-pb-sm">
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <q-icon name="rate_review" size="24px" class="q-mr-sm" />
                    <div class="text-h6 text-weight-bold">Assigned Reviews</div>
                  </div>
                  <q-badge color="purple" :label="pendingReviews.length" />
                </div>
                <div class="text-caption">Tasks assigned to you for review</div>
              </q-card-section>

              <q-card-section
                class="q-pt-none q-px-md q-pb-md"
                style="flex: 1 1 0; overflow-y: auto"
              >
                <q-list separator v-if="pendingReviews.length > 0">
                  <q-item
                    v-for="review in pendingReviews"
                    :key="review.id"
                    class="q-py-md"
                    clickable
                    @click="openReviewDialog(review)"
                  >
                    <q-item-section avatar>
                      <q-avatar>
                        <img
                          :src="
                            review.task_owner_avatar ||
                            `https://i.pravatar.cc/150?img=${review.task_owner_id}`
                          "
                        />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ review.title }}</q-item-label>
                      <q-item-label caption
                        >Owner: {{ review.task_owner_first_name }}
                        {{ review.task_owner_last_name }}</q-item-label
                      >
                      <q-item-label caption>{{ getProjectName(review.project_id) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn color="green" label="Review" size="sm" />
                    </q-item-section>
                  </q-item>
                </q-list>

                <div v-else class="text-center q-pa-xl text-grey-6">
                  <q-icon name="rate_review" size="48px" class="q-mb-sm" />
                  <div class="text-h6">No pending reviews</div>
                  <div>No tasks assigned for review</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Review History Column -->
          <div class="col-6" style="height: 100%; display: flex; flex-direction: column">
            <q-card class="full-height flex column">
              <q-card-section class="bg-green-1 text-green-9 q-pb-sm">
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <q-icon name="history" size="24px" class="q-mr-sm" />
                    <div class="text-h6 text-weight-bold">Review History</div>
                  </div>
                  <q-badge color="green" :label="reviewHistory.length" />
                </div>
                <div class="text-caption">Your review activity and points earned</div>
              </q-card-section>

              <q-card-section
                class="q-pt-none q-px-md q-pb-md"
                style="flex: 1 1 0; overflow-y: auto"
              >
                <q-list separator v-if="reviewHistory.length > 0">
                  <q-item v-for="review in reviewHistory" :key="review.id" class="q-py-md">
                    <q-item-section avatar>
                      <q-icon
                        :name="
                          review.status === 'finalized'
                            ? 'check_circle'
                            : review.status === 'review-done'
                              ? 'rate_review'
                              : 'pending'
                        "
                        :color="
                          review.status === 'finalized'
                            ? 'green'
                            : review.status === 'review-done'
                              ? 'purple'
                              : 'orange'
                        "
                        size="32px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ review.title }}</q-item-label>
                      <q-item-label caption>{{ getProjectName(review.project_id) }}</q-item-label>
                      <q-item-label caption>
                        <q-badge
                          :color="
                            review.status === 'finalized'
                              ? 'green'
                              : review.status === 'review-done'
                                ? 'purple'
                                : 'orange'
                          "
                          >{{ review.status }}</q-badge
                        >
                      </q-item-label>
                      <q-item-label
                        caption
                        v-if="review.pm_final_comment"
                        class="text-grey-8 q-mt-xs"
                      >
                        PM: "{{ review.pm_final_comment }}"
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="column items-end">
                        <q-badge
                          color="green"
                          label="+{{ review.task_owner_points || 0 }} pts"
                          v-if="review.task_owner_points > 0"
                        />
                        <div class="text-caption text-grey-6">
                          {{ formatDate(review.submitted_at) }}
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>

                <div v-else class="text-center q-pa-xl text-grey-6">
                  <q-icon name="history" size="48px" class="q-mb-sm" />
                  <div class="text-h6">No review history</div>
                  <div>Start reviewing tasks to earn points</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

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

    <!-- Review Task Dialog -->
    <q-dialog v-model="showReviewDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Review Task</div>
        </q-card-section>
        <q-card-section>
          <div v-if="selectedReview">
            <div class="q-mb-md">
              <div class="text-subtitle2">{{ selectedReview.title }}</div>
              <div class="text-caption text-grey-7">
                Owner: {{ selectedReview.task_owner_first_name }}
                {{ selectedReview.task_owner_last_name }}
              </div>
              <div class="text-caption text-grey-7">
                {{ getProjectName(selectedReview.project_id) }}
              </div>
              <div class="text-caption text-grey-7 q-mt-sm">
                Expected Effort: {{ selectedReview.expected_effort }}h
              </div>
              <div class="text-caption text-grey-7" v-if="selectedReview.employee_comment">
                Owner Comment: "{{ selectedReview.employee_comment }}"
              </div>
            </div>
            <q-input
              v-model="reviewComment"
              label="Review Comment"
              type="textarea"
              outlined
              rows="3"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="orange"
            label="Request Changes"
            @click="requestChanges"
            :loading="reviewing"
          />
          <q-btn color="green" label="Mark Done" @click="approveReview" :loading="reviewing" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import StatCard from '../../components/StatCard.vue';

defineOptions({
  name: 'EmployeeDashboard',
});

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('tasks');
const loading = ref(false);
const myTasks = ref<any[]>([]);
const projects = ref<any[]>([]);
const employees = ref<any[]>([]);
const pendingReviews = ref<any[]>([]);
const reviewHistory = ref<any[]>([]);
const stats = ref({
  totalTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  points: 0,
});

const showUpdateDialog = ref(false);
const showSubmitReviewDialog = ref(false);
const showReviewDialog = ref(false);
const selectedTask = ref<any>(null);
const selectedReview = ref<any>(null);
const progressUpdate = ref(0);
const statusUpdate = ref('in-progress');
const hoursSpent = ref(0);
const completionComment = ref('');
const reviewComment = ref('');
const selectedReviewer = ref<number | null>(null);
const updating = ref(false);
const submitting = ref(false);
const reviewing = ref(false);

const statusOptions = ['not-started', 'in-progress', 'completed', 'blocked'];

const reviewerOptions = computed(() =>
  employees.value
    .filter((e: any) => e.id !== authStore.user?.id)
    .map((e: any) => ({ label: `${e.first_name} ${e.last_name}`, value: e.id })),
);

onMounted(async () => {
  await fetchFromDatabase();
});

async function fetchFromDatabase() {
  if (!authStore.user?.id) return;

  loading.value = true;
  try {
    // Fetch tasks directly from database
    const tasksResponse = await fetch(
      `http://localhost:3001/api/tasks/employee/${authStore.user.id}`,
    );
    const tasksData = await tasksResponse.json();
    if (tasksData.success) {
      myTasks.value = tasksData.tasks;
    }

    // Fetch projects directly from database
    const projectsResponse = await fetch('http://localhost:3001/api/pm/projects');
    const projectsData = await projectsResponse.json();
    if (projectsData.success) {
      projects.value = projectsData.projects;
    }

    // Fetch employees directly from database
    const employeesResponse = await fetch('http://localhost:3001/api/users');
    const employeesData = await employeesResponse.json();
    if (employeesData.success) {
      employees.value = employeesData.users;
    }

    // Fetch pending reviews
    const pendingResponse = await fetch(
      `http://localhost:3001/api/employee/reviews/pending?user_id=${authStore.user.id}`,
    );
    const pendingData = await pendingResponse.json();
    if (pendingData.success) {
      pendingReviews.value = pendingData.reviews;
    }

    // Fetch review history
    const historyResponse = await fetch(
      `http://localhost:3001/api/employee/reviews/history?user_id=${authStore.user.id}`,
    );
    const historyData = await historyResponse.json();
    if (historyData.success) {
      reviewHistory.value = historyData.reviews;
    }

    // Calculate stats
    calculateStats();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

function calculateStats() {
  stats.value.totalTasks = myTasks.value.length;
  stats.value.completedTasks = myTasks.value.filter((t: any) => t.status === 'completed').length;
  stats.value.inProgressTasks = myTasks.value.filter((t: any) => t.status === 'in-progress').length;
  stats.value.points = reviewHistory.value.reduce(
    (acc: number, r: any) => acc + (r.task_owner_points || 0) + (r.reviewer_points || 0),
    0,
  );
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

function openReviewDialog(review: any) {
  selectedReview.value = review;
  reviewComment.value = '';
  showReviewDialog.value = true;
}

async function approveReview() {
  if (!selectedReview.value) return;

  reviewing.value = true;
  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedReview.value.task_id}/approve-review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ review_comment: reviewComment.value }),
      },
    );

    const data = await response.json();
    if (data.success) {
      showReviewDialog.value = false;
      await fetchFromDatabase();
    }
  } catch (error) {
    console.error('Error approving review:', error);
  } finally {
    reviewing.value = false;
  }
}

async function requestChanges() {
  if (!selectedReview.value) return;

  reviewing.value = true;
  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedReview.value.task_id}/request-changes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ review_comment: reviewComment.value }),
      },
    );

    const data = await response.json();
    if (data.success) {
      showReviewDialog.value = false;
      await fetchFromDatabase();
    }
  } catch (error) {
    console.error('Error requesting changes:', error);
  } finally {
    reviewing.value = false;
  }
}

function logout() {
  authStore.logout();
  router.push('/auth/login');
}
</script>
