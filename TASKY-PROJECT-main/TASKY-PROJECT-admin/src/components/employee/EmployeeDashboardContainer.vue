<template>
  <q-page class="q-pa-md">
    <!-- Small Coin Badge in Corner -->
    <div class="coin-corner-badge">
      <q-icon name="monetization_on" size="28px" color="#FFD700" />
      <span class="coin-points">{{ userPoints }}</span>
    </div>

    <!-- Points Coin Display - Prominent Top Card -->
    <q-card
      v-if="true"
      class="q-mb-md"
      flat
      bordered
      style="
        background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
        border: 4px solid #b8860b;
        min-height: 140px;
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
      "
    >
      <q-card-section class="row items-center">
        <div
          style="
            background: #fff8dc;
            border-radius: 50%;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          "
        >
          <q-icon name="monetization_on" size="80px" color="#B8860B" />
        </div>
        <div class="q-ml-md">
          <div class="text-h4 text-weight-bold" style="color: #8b4513">💎 Total Points</div>
          <div class="text-h1 text-weight-bold" style="color: #8b4513; font-size: 72px">
            {{ userPoints }}
          </div>
        </div>
        <q-space />
        <div class="text-right">
          <div class="text-h6" style="color: #8b4513">Keep earning!</div>
          <div class="text-body1 text-weight-bold" style="color: #cd853f">
            Complete tasks & reviews
          </div>
        </div>
      </q-card-section>
    </q-card>

    <UserHeader
      title="My Dashboard"
      :user="
        currentEmployee
          ? ({
              avatar: currentEmployee.avatar || 'https://cdn.quasar.dev/img/avatar.png',
              name: `${currentEmployee.firstName || ''} ${currentEmployee.surname || ''}`,
              role: currentEmployee.role,
            } as any)
          : undefined
      "
    />

    <!-- Points Notification Popup -->
    <q-dialog v-model="showPointsNotification" position="top">
      <q-card class="points-notification-card bg-amber-1">
        <q-card-section class="row items-center">
          <q-icon name="monetization_on" size="48px" color="amber" class="q-mr-md" />
          <div>
            <div class="text-h6 text-weight-bold text-amber-9">🎉 Points Earned!</div>
            <div class="text-subtitle1">{{ pointsNotificationMessage }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Daily Update Pending Warning -->
    <q-card v-if="analytics?.dailyUpdatePending" class="q-mb-md bg-orange-1">
      <q-card-section class="row items-center">
        <q-icon name="warning" color="orange" size="32px" class="q-mr-md" />
        <div>
          <div class="text-h6 text-weight-bold text-orange">Daily Update Pending</div>
          <div class="text-caption">
            You missed your daily work log entry yesterday. Please submit your update.
          </div>
        </div>
        <q-space />
        <q-btn color="orange" label="Submit Update" to="/work-log" />
      </q-card-section>
    </q-card>

    <!-- Analytics Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <DashboardStatCard
          label="My Tasks"
          :value="analytics?.totalTasks || 0"
          :subtitle="`${analytics?.inProgressTasks || 0} in progress`"
          bg-class="bg-blue-1"
          color-class="text-primary"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <DashboardStatCard
          label="Completed"
          :value="analytics?.completedTasks || 0"
          :subtitle="`${analytics?.totalTasks || 0} total`"
          bg-class="bg-green-1"
          color-class="text-green"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <DashboardStatCard
          label="Workload"
          :value="`${analytics?.workload?.toFixed(1) || 0}h`"
          :subtitle="analytics?.isOverloaded ? 'Overloaded' : 'Normal load'"
          :bg-class="analytics?.isOverloaded ? 'bg-red-1' : 'bg-purple-1'"
          :color-class="analytics?.isOverloaded ? 'text-red' : 'text-purple'"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <DashboardStatCard
          label="Overdue"
          :value="analytics?.overdueTasks || 0"
          subtitle="Tasks past deadline"
          bg-class="bg-orange-1"
          color-class="text-orange"
        />
      </div>
    </div>

    <!-- Upcoming Deadlines -->
    <q-card
      v-if="analytics?.upcomingDeadlines && analytics.upcomingDeadlines.length > 0"
      class="q-mb-md"
    >
      <q-card-section>
        <div class="text-h6 text-weight-bold">
          <q-icon name="schedule" class="q-mr-sm" />
          Upcoming Deadlines
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item v-for="item in analytics.upcomingDeadlines" :key="item.task.id">
            <q-item-section avatar>
              <q-avatar
                :style="{ backgroundColor: getProjectById(item.task.project_id)?.color }"
                size="32px"
                text-color="white"
              >
                {{ getProjectById(item.task.project_id)?.name.charAt(0) }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.task.title }}</q-item-label>
              <q-item-label caption>
                {{ getProjectById(item.task.project_id)?.name }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="item.daysUntil <= 2 ? 'red' : item.daysUntil <= 5 ? 'orange' : 'yellow'"
              >
                {{ item.daysUntil }} days
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Pending Reviews Section -->
    <q-card v-if="pendingReviews && pendingReviews.length > 0" class="q-mb-md bg-purple-1">
      <q-card-section>
        <div class="text-h6 text-weight-bold text-purple-9">
          <q-icon name="rate_review" class="q-mr-sm" />
          Pending Reviews ({{ pendingReviews.length }})
        </div>
        <div class="text-caption text-purple-7">Tasks assigned to you for peer review</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item v-for="review in pendingReviews" :key="review.id" class="q-py-md">
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
                >Submitted by: {{ review.task_owner_first_name }}
                {{ review.task_owner_last_name }}</q-item-label
              >
              <q-item-label caption>Project: {{ review.project_name }}</q-item-label>
              <q-item-label caption v-if="review.completion_comment" class="text-grey-8 q-mt-xs">
                "{{ review.completion_comment }}"
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn color="purple" label="Review" size="sm" @click="openReviewDialog(review)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Review History Section -->
    <q-card v-if="reviewHistory && reviewHistory.length > 0" class="q-mb-md bg-blue-1">
      <q-card-section>
        <div class="text-h6 text-weight-bold text-blue-9">
          <q-icon name="history" class="q-mr-sm" />
          My Review History ({{ reviewHistory.length }})
        </div>
        <div class="text-caption text-blue-7">Tasks you submitted for review and their status</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
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
              <q-item-label caption>Project: {{ review.project_name }}</q-item-label>
              <q-item-label caption
                >Status:
                <q-badge
                  :color="
                    review.status === 'finalized'
                      ? 'green'
                      : review.status === 'review-done'
                        ? 'purple'
                        : 'orange'
                  "
                  >{{ review.status }}</q-badge
                ></q-item-label
              >
              <q-item-label caption v-if="review.pm_final_comment" class="text-grey-8 q-mt-xs">
                PM: "{{ review.pm_final_comment }}"
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="column items-end">
                <q-badge
                  color="green"
                  label="+{{ review.task_owner_points }} pts"
                  v-if="review.task_owner_points > 0"
                />
                <div class="text-caption text-grey-6">{{ formatDate(review.submitted_at) }}</div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- My Tasks by Project -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">My Tasks Across Projects</div>
              <q-btn
                color="primary"
                icon="add"
                label="Self-Assign Task"
                @click="showCreateTaskDialog = true"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="myTasks.length === 0" class="text-center text-grey-6 q-pa-md">
              <q-icon name="assignment" size="48px" class="q-mb-sm text-grey-4" />
              <div class="text-subtitle1">No tasks assigned yet</div>
              <div class="text-caption">Create a self-assigned task to get started</div>
            </div>
            <div v-else class="q-gutter-y-sm">
              <q-card
                v-for="task in myTasks"
                :key="task.id"
                flat
                bordered
                class="cursor-pointer"
                @click="showTaskDetail(task)"
              >
                <q-card-section class="q-pa-sm">
                  <div class="row items-center">
                    <div class="col-1 text-center">
                      <q-circular-progress
                        v-if="task.status === 'completed'"
                        show-value
                        class="text-green text-weight-bold"
                        :value="100"
                        size="28px"
                        color="green"
                        track-color="grey-3"
                        style="font-size: 10px"
                      >
                        100
                      </q-circular-progress>
                      <q-circular-progress
                        v-else-if="task.status === 'in-progress'"
                        show-value
                        class="text-blue text-weight-bold"
                        :value="task.progress"
                        size="28px"
                        color="blue"
                        track-color="grey-3"
                        style="font-size: 10px"
                      >
                        {{ task.progress }}
                      </q-circular-progress>
                      <q-icon
                        v-else-if="task.status === 'in-review'"
                        name="rate_review"
                        color="purple"
                        size="sm"
                      />
                      <q-icon
                        v-else-if="task.status === 'blocked'"
                        name="cancel"
                        color="red"
                        size="sm"
                      />
                      <q-icon v-else name="radio_button_unchecked" color="grey-5" size="sm" />
                    </div>
                    <div class="col-6 q-pl-sm">
                      <div
                        class="text-weight-medium"
                        :class="{ 'text-strike text-grey-6': task.status === 'completed' }"
                      >
                        {{ task.title }}
                      </div>
                      <div class="text-caption text-grey-7">
                        {{ getProjectById(task.project_id)?.name || 'Unknown Project' }}
                      </div>
                    </div>
                    <div class="col-2 column items-center justify-center">
                      <q-badge
                        :color="`${getPriorityColor(task.priority)}-1`"
                        :text-color="getPriorityColor(task.priority)"
                        :label="task.priority"
                        class="q-mb-xs"
                        style="font-size: 9px"
                      />
                      <div
                        class="text-caption text-weight-medium"
                        :class="{
                          'text-red':
                            task.status !== 'completed' && new Date(task.deadline) < new Date(),
                        }"
                      >
                        {{ formatDate(task.deadline) }}
                      </div>
                    </div>
                    <div class="col-2 column items-end justify-center">
                      <q-badge
                        :color="`${getStatusColor(task.status)}-1`"
                        :text-color="getStatusColor(task.status)"
                        :label="task.status"
                        class="text-weight-bold"
                        style="font-size: 9px"
                      />
                      <div class="text-caption text-grey-7 q-mt-xs">{{ task.progress }}%</div>
                    </div>
                    <div class="col-1 column items-center justify-center">
                      <q-btn
                        v-if="task.status === 'in-progress' || task.status === 'not-started'"
                        flat
                        round
                        dense
                        icon="edit"
                        color="blue"
                        size="12px"
                        @click.stop="openUpdateProgressDialog(task)"
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
                        size="12px"
                        @click.stop="openSubmitReviewDialog(task)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Work Logs -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h6 text-weight-bold">Recent Work Logs</div>
          <q-btn flat color="primary" label="View All" to="/work-log" />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item v-for="log in recentWorkLogs" :key="log.id">
            <q-item-section avatar>
              <q-icon :name="getLogStatusIcon(log.status)" :color="getLogStatusColor(log.status)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ getTaskById(log.task_id)?.title }}</q-item-label>
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

    <!-- Task Dialogs -->
    <EmployeeTaskDialogs
      :show-create-task-dialog="showCreateTaskDialog"
      :show-task-dialog="showTaskDialog"
      :show-update-progress-dialog="showUpdateProgressDialog"
      :show-submit-review-dialog="showSubmitReviewDialog"
      :show-review-dialog="showReviewDialog"
      :selected-task="selectedTask"
      :selected-review-task="selectedReviewTask"
      :new-task="newTask"
      :progress-update="progressUpdate"
      :status-update="statusUpdate"
      :hours-spent="hoursSpent"
      :completion-comment="completionComment"
      :review-comment="reviewComment"
      :selected-reviewer="selectedReviewer"
      :reviewer-options="reviewerOptions"
      :projects-list="projectsList"
      :updating="updating"
      :reviewing="reviewing"
      @update:show-create-task-dialog="showCreateTaskDialog = $event"
      @update:show-task-dialog="showTaskDialog = $event"
      @update:show-update-progress-dialog="showUpdateProgressDialog = $event"
      @update:show-submit-review-dialog="showSubmitReviewDialog = $event"
      @update:show-review-dialog="showReviewDialog = $event"
      @create-task="createSelfAssignedTask"
      @update-progress="updateTaskProgress"
      @submit-review="submitForReview"
      @approve-review="approveReview"
      @request-changes="requestChanges"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEmployeeDashboard } from '../../composables/useEmployeeDashboard';
import { getPriorityColor, getStatusColor } from '../../constants';
import UserHeader from '../UserHeader.vue';
import DashboardStatCard from '../DashboardStatCard.vue';
import EmployeeTaskDialogs from './EmployeeTaskDialogs.vue';

// Use the composable for data fetching and business logic
const {
  myTasks,
  projectsList,
  analytics,
  userPoints,
  showPointsNotification,
  pointsNotificationMessage,
  pendingReviews,
  reviewHistory,
  currentEmployee,
  recentWorkLogs,
  getTaskById,
  getProjectById,
  getProgressUpdatesByTask,
  fetchFromDatabase,
  loadPendingReviews,
  loadReviewHistory,
} = useEmployeeDashboard();

// Dialog state
const showCreateTaskDialog = ref(false);
const showTaskDialog = ref(false);
const showUpdateProgressDialog = ref(false);
const showSubmitReviewDialog = ref(false);
const showReviewDialog = ref(false);
const selectedTask = ref<any>(null);
const selectedReviewTask = ref<any>(null);
const newTask = ref({
  title: '',
  description: '',
  projectId: '',
  deadline: '',
  expectedEffort: 8,
  priority: 'medium',
});
const progressUpdate = ref(0);
const statusUpdate = ref('in-progress');
const hoursSpent = ref(0);
const updating = ref(false);
const completionComment = ref('');
const reviewComment = ref('');
const selectedReviewer = ref<number | null>(null);
const reviewing = ref(false);

const reviewerOptions = ref<Array<{ label: string; value: number }>>([]);

// Helper functions
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

function formatDate(date: string) {
  if (!date) return 'No deadline';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Dialog handlers
function showTaskDetail(task: any) {
  selectedTask.value = task;
  showTaskDialog.value = true;
}

function openUpdateProgressDialog(task: any) {
  selectedTask.value = task;
  progressUpdate.value = task.progress;
  statusUpdate.value = task.status;
  hoursSpent.value = 0;
  showUpdateProgressDialog.value = true;
}

function openSubmitReviewDialog(task: any) {
  selectedTask.value = task;
  completionComment.value = '';
  selectedReviewer.value = null;
  showSubmitReviewDialog.value = true;
}

function openReviewDialog(review: any) {
  selectedReviewTask.value = review;
  reviewComment.value = '';
  showReviewDialog.value = true;
}

// Business logic functions
async function createSelfAssignedTask() {
  // Implementation will be moved to composable
  console.log('Create self-assigned task:', newTask.value);
  showCreateTaskDialog.value = false;
}

async function updateTaskProgress() {
  // Implementation will be moved to composable
  console.log('Update task progress:', selectedTask.value);
  showUpdateProgressDialog.value = false;
}

async function submitForReview() {
  // Implementation will be moved to composable
  console.log('Submit for review:', selectedTask.value);
  showSubmitReviewDialog.value = false;
}

async function approveReview() {
  // Implementation will be moved to composable
  console.log('Approve review:', selectedReviewTask.value);
  showReviewDialog.value = false;
}

async function requestChanges() {
  // Implementation will be moved to composable
  console.log('Request changes:', selectedReviewTask.value);
  showReviewDialog.value = false;
}
</script>

<style scoped>
.coin-corner-badge {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  padding: 8px 16px;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.coin-corner-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
}

.coin-points {
  font-size: 18px;
  font-weight: bold;
  color: #8b4513;
}

.points-notification-card {
  min-width: 350px;
  border-radius: 12px;
  border: 2px solid #ffd700;
}
</style>
