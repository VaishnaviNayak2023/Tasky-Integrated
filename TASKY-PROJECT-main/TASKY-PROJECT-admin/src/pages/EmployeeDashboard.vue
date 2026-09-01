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

    <!-- Pending Reviews Section -->
    <q-card v-if="pendingReviews.length > 0" class="q-mb-md bg-purple-1">
      <q-card-section>
        <div class="text-h6 text-weight-bold text-purple">
          Pending Reviews ({{ pendingReviews.length }})
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item
            v-for="review in pendingReviews"
            :key="review.id"
            clickable
            @click="openReviewDialog(review)"
          >
            <q-item-section avatar>
              <q-avatar
                :style="{ backgroundColor: getProjectById(review.project_id)?.color }"
                text-color="white"
              >
                {{ getProjectById(review.project_id)?.name.charAt(0) }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ review.title }}</q-item-label>
              <q-item-label caption>
                {{ review.project_name }} • Submitted by {{ review.first_name }}
                {{ review.last_name }}
              </q-item-label>
              <q-item-label caption v-if="review.completion_comment">
                "{{ review.completion_comment }}"
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn color="primary" label="Review" dense />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Review History Section -->
    <q-card v-if="reviewHistory.length > 0" class="q-mb-md">
      <q-card-section>
        <div class="text-h6 text-weight-bold">My Review History</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item v-for="review in reviewHistory" :key="review.id">
            <q-item-section avatar>
              <q-badge
                :color="
                  review.status === 'approved'
                    ? 'green'
                    : review.status === 'changes-requested'
                      ? 'orange'
                      : 'grey'
                "
              >
                {{ review.status }}
              </q-badge>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ review.title }}</q-item-label>
              <q-item-label caption>
                {{ review.project_name }} • Reviewed by {{ review.reviewer_first_name }}
                {{ review.reviewer_last_name }}
              </q-item-label>
              <q-item-label caption v-if="review.review_comment">
                "{{ review.review_comment }}"
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-caption">{{ review.task_status }}</div>
              <div class="text-caption">{{ review.progress }}%</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Create Self-Assigned Task Dialog -->
    <q-dialog v-model="showCreateTaskDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Create Self-Assigned Task</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit="createSelfAssignedTask">
            <q-input
              v-model="newTask.title"
              label="Task Title"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || 'Title is required']"
            />
            <q-input
              v-model="newTask.description"
              label="Description"
              outlined
              type="textarea"
              rows="3"
              class="q-mb-md"
            />
            <q-select
              v-model="newTask.projectId"
              label="Project"
              :options="projectsList.map((p) => ({ label: p.name, value: p.id }))"
              outlined
              emit-value
              map-options
              class="q-mb-md"
            />
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-input v-model="newTask.deadline" label="Deadline" outlined type="date" />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="newTask.expectedEffort"
                  label="Expected Effort (hours)"
                  outlined
                  type="number"
                />
              </div>
            </div>
            <q-select
              v-model="newTask.priority"
              label="Priority"
              :options="['critical', 'high', 'medium', 'low']"
              outlined
              class="q-mb-md"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create Task" @click="createSelfAssignedTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Task Detail Dialog -->
    <q-dialog v-model="showTaskDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ selectedTask?.title }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="selectedTask">
            <div class="q-mb-md">
              <strong>Project:</strong> {{ getProjectById(selectedTask.projectId)?.name }}
            </div>
            <div class="q-mb-md"><strong>Description:</strong> {{ selectedTask.description }}</div>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <strong>Priority:</strong>
                <q-badge
                  :color="getPriorityColor(selectedTask.priority)"
                  class="q-ml-sm text-capitalize"
                >
                  {{ selectedTask.priority }}
                </q-badge>
              </div>
              <div class="col-6">
                <strong>Status:</strong>
                <q-badge
                  :color="getStatusColor(selectedTask.status)"
                  class="q-ml-sm text-capitalize"
                >
                  {{ selectedTask.status.replace('-', ' ') }}
                </q-badge>
              </div>
            </div>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <strong>Deadline:</strong> {{ formatDate(selectedTask.deadline) }}
              </div>
              <div class="col-6">
                <strong>Expected Effort:</strong> {{ selectedTask.expectedEffort }}h
              </div>
            </div>
            <div class="q-mb-md">
              <strong>Progress:</strong>
              <q-linear-progress
                :value="selectedTask.progress / 100"
                color="primary"
                class="q-mt-sm"
              />
              <div class="text-caption">{{ selectedTask.progress }}%</div>
            </div>
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-md">Progress History</div>
            <q-timeline color="primary">
              <q-timeline-entry
                v-for="update in getProgressUpdatesByTask(selectedTask.id)"
                :key="update.id"
                :title="`${update.previousProgress || 0}% → ${update.newProgress || 0}%`"
                :subtitle="update.date || update.log_date"
              >
                <div>{{ update.notes || update.work_completed }}</div>
                <div class="text-caption text-grey-6">
                  by {{ getEmployeeById(update.employeeId || update.user_id)?.name }}
                </div>
              </q-timeline-entry>
            </q-timeline>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn
            v-if="selectedTask.progress === 100 && selectedTask.status === 'in-progress'"
            color="primary"
            label="Submit for Review"
            @click="openSubmitReviewDialog(selectedTask)"
          />
          <q-btn
            v-else
            color="primary"
            label="Update Progress"
            @click="openUpdateProgressDialog(selectedTask)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Update Progress Dialog -->
    <q-dialog v-model="showUpdateProgressDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Update Task Progress</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="selectedTask">
            <div class="q-mb-md"><strong>Task:</strong> {{ selectedTask.title }}</div>
            <div class="q-mb-md">
              <strong>Current Progress:</strong> {{ selectedTask.progress }}%
            </div>
            <q-slider
              v-model="progressUpdate"
              :min="0"
              :max="100"
              :step="10"
              label
              label-always
              markers
              color="primary"
              class="q-mb-md"
            />
            <q-select
              v-model="statusUpdate"
              label="Status"
              :options="['not-started', 'in-progress', 'completed']"
              outlined
              class="q-mb-md"
            />
            <q-input
              v-model="hoursSpent"
              label="Hours Spent"
              type="number"
              outlined
              class="q-mb-md"
              hint="Total hours worked on this task"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Save" @click="updateTaskProgress" :loading="updating" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Submit Review Dialog -->
    <q-dialog v-model="showSubmitReviewDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Submit Task for Review</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="selectedReviewTask">
            <div class="q-mb-md"><strong>Task:</strong> {{ selectedReviewTask.title }}</div>
            <q-input
              v-model="completionComment"
              label="Completion Comment"
              outlined
              type="textarea"
              rows="3"
              class="q-mb-md"
              hint="Describe what was accomplished"
            />
            <q-select
              v-model="selectedReviewer"
              label="Select Reviewer"
              :options="reviewerOptions"
              outlined
              emit-value
              map-options
              class="q-mb-md"
              :rules="[(val) => !!val || 'Reviewer is required']"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Submit" @click="submitForReview" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Review Dialog (for reviewers) -->
    <q-dialog v-model="showReviewDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Review Task</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="selectedReviewTask">
            <div class="q-mb-md"><strong>Task:</strong> {{ selectedReviewTask.title }}</div>
            <div class="q-mb-md">
              <strong>Project:</strong> {{ selectedReviewTask.project_name }}
            </div>
            <div class="q-mb-md">
              <strong>Submitted by:</strong> {{ selectedReviewTask.task_owner_first_name }}
              {{ selectedReviewTask.task_owner_last_name }}
            </div>
            <div class="q-mb-md">
              <strong>Expected Effort:</strong> {{ selectedReviewTask.expected_effort }}h
            </div>
            <div class="q-mb-md">
              <strong>Completion Comment:</strong> {{ selectedReviewTask.completion_comment }}
            </div>
            <div class="q-mb-md">
              <strong>Description:</strong> {{ selectedReviewTask.description }}
            </div>
            <q-input
              v-model="reviewComment"
              label="Review Comment"
              outlined
              type="textarea"
              rows="3"
              class="q-mb-md"
              hint="Provide feedback on the work. This will award 10 points to the task owner."
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="orange" label="Request Changes" @click="requestChanges" />
          <q-btn
            color="green"
            label="Mark Review Done"
            @click="approveReview"
            :loading="reviewing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';

const taskStore = useTaskStore();
const authStore = useAuthStore();

// Helper functions - using local database data
function getTaskById(id: string | number) {
  return myTasks.value.find((t: any) => t.id === id);
}

function getProjectById(id: string | number) {
  return projectsList.value.find((p: any) => p.id === id);
}

function getEmployeeById(id: string | number) {
  const emp = employees.value.find((e: any) => e.id === id);
  if (emp) {
    return {
      ...emp,
      name: `${emp.first_name} ${emp.last_name}`,
    };
  }
  return null;
}

function getProgressUpdatesByTask(taskId: string | number) {
  return workLogs.value.filter((l: any) => l.task_id === taskId);
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
    'in-review': 'purple',
    completed: 'green',
    blocked: 'red',
  };
  return colors[status] || 'grey';
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

import UserHeader from '@/components/UserHeader.vue';
import DashboardStatCard from '@/components/DashboardStatCard.vue';

const showCreateTaskDialog = ref(false);
const showTaskDialog = ref(false);
const showUpdateProgressDialog = ref(false);
const selectedTask = ref<any>(null);
const progressUpdate = ref(0);
const statusUpdate = ref('in-progress');
const hoursSpent = ref(0);
const updating = ref(false);

const newTask = ref({
  title: '',
  description: '',
  projectId: '',
  deadline: '',
  expectedEffort: 8,
  priority: 'medium',
});

const currentEmployee = computed(() => authStore.user);

// Direct database storage instead of Pinia
const myTasks = ref<any[]>([]);
const projectsList = ref<any[]>([]);
const employees = ref<any[]>([]);
const workLogs = ref<any[]>([]);
const analytics = ref<any>(null);
const userPoints = ref(100); // Default value to ensure card is visible
const showPointsNotification = ref(false);
const pointsNotificationMessage = ref('');

onMounted(async () => {
  await fetchFromDatabase();
  loadPendingReviews();
  loadReviewHistory();
});

async function fetchFromDatabase() {
  if (!currentEmployee.value?.id) return;

  try {
    // Fetch tasks directly from database
    const tasksResponse = await fetch(
      `http://localhost:3001/api/tasks/employee/${currentEmployee.value.id}`,
    );
    const tasksData = await tasksResponse.json();
    if (tasksData.success) {
      myTasks.value = tasksData.tasks;
    }

    // Fetch projects directly from database
    const projectsResponse = await fetch('http://localhost:3001/api/pm/projects');
    const projectsData = await projectsResponse.json();
    if (projectsData.success) {
      projectsList.value = projectsData.projects;
    }

    // Fetch employees directly from database
    const employeesResponse = await fetch('http://localhost:3001/api/users');
    const employeesData = await employeesResponse.json();
    if (employeesData.success) {
      employees.value = employeesData.users;
    }

    // Fetch work logs directly from database
    const logsResponse = await fetch(
      `http://localhost:3001/api/employee/work-logs/${currentEmployee.value.id}`,
    );
    const logsData = await logsResponse.json();
    if (logsData.success) {
      workLogs.value = logsData.logs || [];
    }

    // Fetch user points
    const userResponse = await fetch(`http://localhost:3001/api/users/${currentEmployee.value.id}`);
    const userData = await userResponse.json();
    if (userData.success && userData.user) {
      userPoints.value = userData.user.points || 0;
    }

    // Calculate analytics from database data
    calculateAnalytics();
  } catch (error) {
    console.error('Error fetching from database:', error);
  }
}

function calculateAnalytics() {
  const empTasks = myTasks.value;
  // Filter completed tasks to only show those with completed reviews
  const completedWithReview = empTasks.filter(
    (t: any) =>
      t.status === 'completed' &&
      reviewHistory.value.some(
        (r: any) => r.task_id === t.id && (r.status === 'review-done' || r.status === 'finalized'),
      ),
  ).length;
  const completed = completedWithReview;
  const inProgress = empTasks.filter((t: any) => t.status === 'in-progress').length;
  const notStarted = empTasks.filter((t: any) => t.status === 'not-started').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = empTasks.filter((t: any) => {
    if (t.status === 'completed') return false;
    if (!t.deadline) return false;
    return new Date(t.deadline) < today;
  });

  const hoursLogged = workLogs.value.reduce(
    (acc: number, log: any) => acc + (log.hours_spent || 0),
    0,
  );

  analytics.value = {
    totalTasks: empTasks.length,
    completedTasks: completed,
    inProgressTasks: inProgress,
    notStartedTasks: notStarted,
    hoursLogged: hoursLogged,
    overdueTasks: overdueTasks.length,
  };
}

const recentWorkLogs = computed(() => {
  const sorted = [...workLogs.value].sort(
    (a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
  );
  return sorted.slice(0, 5);
});

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

async function updateTaskProgress() {
  if (!selectedTask.value) return;

  updating.value = true;
  try {
    const authStore = useAuthStore();

    // If status is completed, ensure progress is 100
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
      showUpdateProgressDialog.value = false;
      await fetchFromDatabase(); // Refresh from database
    } else {
      console.error('Update failed:', data.error);
    }
  } catch (error) {
    console.error('Error updating task progress:', error);
  } finally {
    updating.value = false;
  }
}

function formatDate(date: string) {
  if (!date) return 'No deadline';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function createSelfAssignedTask() {
  try {
    const authStore = useAuthStore();
    const response = await fetch('http://localhost:3001/api/employee/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        title: newTask.value.title,
        description: newTask.value.description,
        project_id: newTask.value.projectId,
        deadline: newTask.value.deadline,
        expected_effort: newTask.value.expectedEffort,
        priority: newTask.value.priority,
        is_self_assigned: 1,
      }),
    });

    const data = await response.json();
    if (data.success) {
      // Refresh tasks
      await taskStore.fetchEmployeeTasks();
      showCreateTaskDialog.value = false;

      // Reset form
      newTask.value = {
        title: '',
        description: '',
        projectId: '',
        deadline: '',
        expectedEffort: 8,
        priority: 'medium',
      };
    }
  } catch (error) {
    console.error('Error creating self-assigned task:', error);
  }
}

// Review workflow
const showSubmitReviewDialog = ref(false);
const showReviewDialog = ref(false);
const selectedReviewTask = ref<any>(null);
const completionComment = ref('');
const reviewComment = ref('');
const selectedReviewer = ref<number | null>(null);
const pendingReviews = ref<any[]>([]);
const reviewHistory = ref<any[]>([]);
const reviewing = ref(false);

const reviewerOptions = computed(() =>
  employees.value
    .filter((e: any) => e.id !== currentEmployee.value?.id)
    .map((e: any) => ({ label: `${e.first_name} ${e.last_name}`, value: e.id })),
);

async function loadPendingReviews() {
  if (currentEmployee.value?.id) {
    pendingReviews.value = await taskStore.fetchPendingReviews(Number(currentEmployee.value.id));
  }
}

async function loadReviewHistory() {
  if (currentEmployee.value?.id) {
    reviewHistory.value = await taskStore.fetchReviewHistory(Number(currentEmployee.value.id));
  }
}

function openSubmitReviewDialog(task: any) {
  selectedReviewTask.value = task;
  completionComment.value = '';
  selectedReviewer.value = null;
  showSubmitReviewDialog.value = true;
}

async function submitForReview() {
  if (!selectedReviewTask.value || !selectedReviewer.value) return;

  try {
    const authStore = useAuthStore();
    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedReviewTask.value.id}/submit-review`,
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
      await fetchFromDatabase(); // Refresh from database
      await loadReviewHistory();
    } else {
      console.error('Submit review failed:', data.error);
    }
  } catch (error) {
    console.error('Error submitting for review:', error);
  }
}

function openReviewDialog(review: any) {
  selectedReviewTask.value = review;
  reviewComment.value = '';
  showReviewDialog.value = true;
}

async function approveReview() {
  if (!selectedReviewTask.value) return;

  reviewing.value = true;
  try {
    const authStore = useAuthStore();
    const response = await fetch(
      `http://localhost:3001/api/employee/reviews/${selectedReviewTask.value.id}/complete`,
      {
        method: 'PUT',
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
      loadPendingReviews();
      loadReviewHistory();

      // Show points notification
      pointsNotificationMessage.value = `🎉 You earned 5 points for reviewing this task!`;
      showPointsNotification.value = true;
      setTimeout(() => {
        showPointsNotification.value = false;
      }, 4000);
    }
  } catch (error) {
    console.error('Error approving review:', error);
  } finally {
    reviewing.value = false;
  }
}

async function requestChanges() {
  if (!selectedReviewTask.value) return;

  try {
    const authStore = useAuthStore();
    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedReviewTask.value.task_id}/request-changes`,
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
      await loadPendingReviews();
      await fetchFromDatabase(); // Refresh from database
    } else {
      console.error('Request changes failed:', data.error);
    }
  } catch (error) {
    console.error('Error requesting changes:', error);
  }
}

onMounted(async () => {
  await fetchFromDatabase();
  loadPendingReviews();
  loadReviewHistory();
});
</script>

<style scoped>
.points-coin-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
}

.points-coin {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
  border: 3px solid #b8860b;
  cursor: pointer;
  transition: transform 0.2s;
}

.points-coin:hover {
  transform: scale(1.1);
}

.points-value {
  font-weight: bold;
  font-size: 20px;
  color: #8b4513;
  margin-top: -5px;
}

.points-notification-card {
  min-width: 350px;
  border-radius: 12px;
  border: 2px solid #ffd700;
}

.coin-card {
  background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
  border: 2px solid #ffd700;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.coin-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.coin-icon-container {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.coin-card-main {
  background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
  border: 3px solid #ffd700;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.coin-card-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.5);
}

.coin-icon-large {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

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
</style>
