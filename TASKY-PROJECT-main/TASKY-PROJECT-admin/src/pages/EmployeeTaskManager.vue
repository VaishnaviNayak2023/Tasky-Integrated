<template>
  <q-page class="app-page q-pa-lg">
    <!-- ========================================================= -->
    <!-- PAGE HEADER -->
    <!-- ========================================================= -->

    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="page-title">Task Manager</h1>

        <p class="page-subtitle">Organize your work, manage subtasks and track your progress.</p>
      </div>

      <div class="row items-center q-gutter-sm">
        <!-- Points Badge -->
        <div class="points-badge">
          <q-icon name="monetization_on" size="20px" color="#FFD700" />
          <span class="points-text">{{ userPoints }}</span>
          <q-badge color="amber-8" :label="`Rank #${userRank}`" class="q-ml-sm" />
        </div>

        <q-btn
          flat
          icon="lightbulb"
          color="primary"
          @click="showInsightsDialog = true"
          label="Insights"
          class="q-px-md"
        >
          <q-tooltip> View employee insights </q-tooltip>
        </q-btn>

        <q-btn
          flat
          icon="refresh"
          color="grey-7"
          @click="refreshTasks"
          label="Refresh Task"
          class="q-px-md"
        >
          <q-tooltip> Refresh tasks </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- STAT CARDS -->
    <!-- ========================================================= -->

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
        <EmployeeStatCard
          :label="stat.label"
          :value="stat.value"
          :description="stat.description"
          :icon="stat.icon"
          :color="stat.color"
          :background="stat.background"
          :trend="stat.trend"
          :positive="stat.positive"
        />
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- QUICK ADD TASK -->
    <!-- ========================================================= -->

    <QuickAddTaskCard @create="openAddTask" />

    <!-- ========================================================= -->
    <!-- MY TASKS -->
    <!-- ========================================================= -->

    <q-card flat bordered class="my-tasks-card overflow-hidden">
      <!-- ======================================================= -->
      <!-- TASK HEADER -->
      <!-- ======================================================= -->

      <TaskListHeader
        title="My Tasks"
        :task-count="filteredTasks.length"
        :active-tab="activeTab"
        :active-tab-label="activeTabLabel"
        :view-mode="viewMode"
        :tabs="[
          { name: 'all', label: 'All Tasks' },
          { name: 'my', label: 'My Tasks' },
          { name: 'progress', label: 'In Progress' },
          { name: 'completed', label: 'Completed' },
        ]"
        @view-change="viewMode = $event"
        @tab-change="activeTab = $event"
      />

      <!-- ===================================================== -->
      <!-- FILTERS -->
      <!-- ===================================================== -->

      <TaskFilters
        :search-query="search"
        :selected-project="projectFilter"
        :selected-priority="priorityFilter"
        :selected-status="statusFilter"
        :projects="projectOptions"
        @search="search = $event"
        @project-change="projectFilter = $event"
        @priority-change="priorityFilter = $event"
        @status-change="statusFilter = $event"
        @clear-filters="clearFilters"
      />

      <q-separator />

      <!-- ========================================================= -->
      <!-- LIST VIEW -->
      <!-- ========================================================= -->

      <q-table
        v-if="viewMode === 'list'"
        :rows="filteredTasks"
        :columns="columns"
        row-key="id"
        flat
        hide-pagination
        :rows-per-page-options="[0]"
        class="task-table"
      >
        <!-- TASK -->

        <template #body-cell-task="props">
          <q-td :props="props" class="cursor-pointer" @click="viewTask(props.row)">
            <div class="row items-center no-wrap">
              <q-avatar
                size="42px"
                :style="{
                  background: projectColor(props.row.project).bg,

                  color: projectColor(props.row.project).color,
                }"
              >
                <q-icon :name="projectIcon(props.row.project)" size="21px" />
              </q-avatar>

              <div class="q-ml-md">
                <div class="task-name">
                  {{ props.row.name }}
                </div>

                <div class="task-description">
                  {{ props.row.description }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- PROJECT -->

        <template #body-cell-project="props">
          <q-td :props="props">
            <div class="text-body2 text-weight-medium">
              {{ props.row.project }}
            </div>

            <div class="text-caption text-grey-6">
              {{ props.row.assignedBy }}
            </div>
          </q-td>
        </template>

        <!-- SUBTASKS -->

        <template #body-cell-subtasks="props">
          <q-td :props="props">
            <div class="subtask-count">
              <q-icon name="checklist" size="17px" class="q-mr-xs" />

              {{ completedSubtasks(props.row) }}
              /
              {{ props.row.subtasks.length }}
            </div>
          </q-td>
        </template>

        <!-- PRIORITY -->

        <template #body-cell-priority="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              :style="{
                background: priorityStyle(props.row.priority).bg,

                color: priorityStyle(props.row.priority).color,
              }"
            >
              <q-icon name="flag" size="14px" class="q-mr-xs" />

              {{ props.row.priority }}
            </q-chip>
          </q-td>
        </template>

        <!-- STATUS -->

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              :style="{
                background: statusStyle(props.row.status).bg,

                color: statusStyle(props.row.status).color,
              }"
            >
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>

        <!-- PROGRESS -->

        <template #body-cell-progress="props">
          <q-td :props="props">
            <div style="min-width: 145px">
              <div class="row justify-between">
                <span class="text-caption text-grey-6"> Progress </span>

                <span class="text-caption text-weight-bold"> {{ taskProgress(props.row) }}% </span>
              </div>

              <q-linear-progress
                :value="taskProgress(props.row) / 100"
                color="primary"
                track-color="grey-3"
                rounded
                size="7px"
                class="q-mt-xs"
              />
            </div>
          </q-td>
        </template>

        <!-- DEADLINE -->

        <template #body-cell-deadline="props">
          <q-td :props="props">
            <div :class="isOverdue(props.row) ? 'text-negative text-weight-bold' : 'text-dark'">
              {{ formatDate(props.row.deadline) }}
            </div>

            <div v-if="isOverdue(props.row)" class="text-caption text-negative">Overdue</div>
          </q-td>
        </template>

        <!-- ACTIONS -->

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round icon="more_horiz" color="grey-7">
              <q-menu>
                <q-list style="min-width: 190px">
                  <!-- VIEW -->

                  <q-item clickable v-close-popup @click="viewTask(props.row)">
                    <q-item-section avatar>
                      <q-icon name="visibility" />
                    </q-item-section>

                    <q-item-section> View Task </q-item-section>
                  </q-item>

                  <!-- EDIT -->

                  <q-item clickable v-close-popup @click="openEditSubtasks(props.row)">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>

                    <q-item-section> Edit Subtasks </q-item-section>
                  </q-item>

                  <!-- MANAGE -->

                  <q-item clickable v-close-popup @click="openManage(props.row)">
                    <q-item-section avatar>
                      <q-icon name="tune" color="primary" />
                    </q-item-section>

                    <q-item-section> Manage Progress </q-item-section>
                  </q-item>

                  <q-separator />

                  <!-- DELETE -->

                  <q-item clickable v-close-popup @click="deleteTask(props.row)">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>

                    <q-item-section class="text-negative"> Delete Task </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>

      <!-- ========================================================= -->
      <!-- GRID VIEW -->
      <!-- ========================================================= -->

      <div v-else class="row q-col-gutter-md q-pa-lg">
        <div v-for="task in filteredTasks" :key="task.id" class="col-12 col-md-6 col-lg-4">
          <q-card flat bordered class="task-grid-card q-pa-md">
            <!-- CARD TOP -->

            <div class="row items-center justify-between">
              <q-chip
                dense
                square
                :style="{
                  background: priorityStyle(task.priority).bg,

                  color: priorityStyle(task.priority).color,
                }"
              >
                {{ task.priority }}
              </q-chip>

              <q-btn flat round dense icon="more_horiz" color="grey-6">
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="openEditSubtasks(task)">
                      <q-item-section> Edit Subtasks </q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="openManage(task)">
                      <q-item-section> Manage Progress </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <!-- NAME -->

            <div class="task-grid-title q-mt-md">
              {{ task.name }}
            </div>

            <div class="task-description grid-description">
              {{ task.description }}
            </div>

            <!-- PROJECT -->

            <div class="row items-center q-mt-lg">
              <q-icon name="folder" color="grey-6" size="18px" />

              <span class="text-body2 q-ml-xs">
                {{ task.project }}
              </span>
            </div>

            <!-- SUBTASK PROGRESS -->

            <div class="q-mt-lg">
              <div class="row justify-between">
                <span class="text-caption text-grey-6"> Subtasks </span>

                <span class="text-caption text-weight-bold">
                  {{ completedSubtasks(task) }}
                  /
                  {{ task.subtasks.length }}
                </span>
              </div>

              <q-linear-progress
                :value="taskProgress(task) / 100"
                color="primary"
                track-color="grey-3"
                rounded
                size="8px"
                class="q-mt-xs"
              />
            </div>

            <!-- BOTTOM -->

            <div class="row items-center justify-between q-mt-lg">
              <q-chip
                dense
                square
                :style="{
                  background: statusStyle(task.status).bg,

                  color: statusStyle(task.status).color,
                }"
              >
                {{ task.status }}
              </q-chip>

              <span class="text-caption text-grey-6">
                {{ formatDate(task.deadline) }}
              </span>
            </div>

            <!-- MANAGE BUTTON -->

            <q-btn
              unelevated
              no-caps
              color="primary"
              label="Manage"
              icon="tune"
              class="full-width q-mt-md"
              @click="openManage(task)"
            />
          </q-card>
        </div>
      </div>

      <!-- EMPTY STATE -->

      <div v-if="filteredTasks.length === 0" class="column items-center justify-center q-pa-xl">
        <q-icon name="task_alt" size="64px" color="grey-4" />

        <div class="text-h6 q-mt-md">No tasks found</div>

        <div class="text-body2 text-grey-6">Try changing your filters.</div>
      </div>
    </q-card>

    <!-- ========================================================= -->
    <!-- ADD TASK DIALOG -->
    <!-- ========================================================= -->

    <q-dialog v-model="showAddDialog">
      <q-card class="task-dialog">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Create New Task</div>

          <div class="text-body2 text-grey-6 q-mt-xs">
            Create a task and divide it into subtasks.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- TASK NAME -->

          <q-input v-model="newTask.name" outlined label="Task name" />

          <!-- DESCRIPTION -->

          <q-input
            v-model="newTask.description"
            outlined
            type="textarea"
            autogrow
            label="Description"
          />

          <!-- PROJECT -->

          <q-select
            v-model="newTask.project"
            :options="projectOptions.slice(1)"
            outlined
            label="Project"
          />

          <!-- PRIORITY / DEADLINE -->

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="newTask.priority"
                :options="priorityOptions.slice(1)"
                outlined
                label="Priority"
              />
            </div>

            <div class="col-6">
              <q-input v-model="newTask.deadline" outlined type="date" label="Deadline" />
            </div>
          </div>

          <!-- ================================================= -->
          <!-- SUBTASKS -->
          <!-- ================================================= -->

          <div class="subtask-editor">
            <div class="row items-center justify-between q-mb-sm">
              <div>
                <div class="text-subtitle1 text-weight-bold">Subtasks</div>

                <div class="text-caption text-grey-6">Break the task into smaller steps.</div>
              </div>

              <q-btn
                flat
                no-caps
                color="primary"
                icon="add"
                label="Add Subtask"
                @click="addNewTaskSubtask"
              />
            </div>

            <div v-if="newTask.subtasks.length === 0" class="empty-subtasks">
              <q-icon name="playlist_add" size="30px" color="grey-5" />

              <div class="text-caption text-grey-6 q-mt-xs">No subtasks added yet</div>
            </div>

            <div v-for="(subtask, index) in newTask.subtasks" :key="subtask.id" class="subtask-row">
              <q-input
                v-model="subtask.title"
                outlined
                dense
                :placeholder="`Subtask ${index + 1}`"
                class="col"
              />

              <q-btn
                flat
                round
                dense
                icon="delete_outline"
                color="negative"
                @click="removeNewTaskSubtask(index)"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" @click="showAddDialog = false" />

          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="add"
            label="Create Task"
            @click="createTask"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================================= -->
    <!-- EDIT SUBTASKS DIALOG -->
    <!-- ========================================================= -->

    <q-dialog v-model="showEditDialog">
      <q-card class="task-dialog" v-if="selectedTask">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Edit Subtasks</div>

          <div class="text-body2 text-grey-6 q-mt-xs">
            {{ selectedTask.name }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div v-for="subtask in editSubtasks" :key="subtask.id" class="edit-subtask-row">
            <q-input v-model="subtask.title" outlined dense class="col" />

            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              color="negative"
              @click="removeEditSubtask(subtask.id)"
            />
          </div>

          <q-btn
            outline
            no-caps
            color="primary"
            icon="add"
            label="Add Subtask"
            class="full-width q-mt-md"
            @click="addEditSubtask"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" @click="showEditDialog = false" />

          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Save Changes"
            @click="saveEditedSubtasks"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================================= -->
    <!-- MANAGE DRAWER -->
    <!-- ========================================================= -->

    <q-drawer
      v-model="showManageDrawer"
      side="right"
      bordered
      overlay
      :width="480"
      class="manage-drawer"
    >
      <div v-if="selectedTask" class="full-height column">
        <!-- DRAWER HEADER -->

        <div class="manage-header q-pa-lg">
          <div class="row items-start justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Manage Task</div>

              <div class="text-body2 text-grey-6 q-mt-xs">Update your work progress</div>
            </div>

            <q-btn flat round dense icon="close" color="grey-7" @click="showManageDrawer = false" />
          </div>

          <!-- TASK -->

          <div class="manage-task-title q-mt-lg">
            {{ selectedTask.name }}
          </div>

          <div class="text-caption text-grey-6">
            {{ selectedTask.project }}
          </div>
        </div>

        <q-separator />

        <!-- DRAWER CONTENT -->

        <div class="col scroll q-pa-lg">
          <!-- PROGRESS -->

          <div class="manage-progress-card q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-6">Overall Progress</div>

                <div class="text-h4 text-weight-bold q-mt-xs">
                  {{ taskProgress(selectedTask) }}%
                </div>
              </div>

              <q-circular-progress
                :value="taskProgress(selectedTask)"
                size="72px"
                :thickness="0.16"
                color="primary"
                track-color="grey-3"
                show-value
              >
                {{ taskProgress(selectedTask) }}%
              </q-circular-progress>
            </div>

            <q-linear-progress
              :value="taskProgress(selectedTask) / 100"
              color="primary"
              track-color="grey-3"
              rounded
              size="9px"
              class="q-mt-md"
            />
          </div>

          <!-- SUBTASKS -->

          <div class="text-subtitle1 text-weight-bold q-mt-xl q-mb-md">Subtasks</div>

          <div v-if="selectedTask.subtasks.length === 0" class="empty-subtasks">
            <q-icon name="playlist_add" size="32px" color="grey-5" />

            <div class="text-body2 text-grey-6 q-mt-sm">No subtasks added.</div>

            <q-btn
              flat
              no-caps
              color="primary"
              label="Add Subtasks"
              class="q-mt-sm"
              @click="openEditFromManage"
            />
          </div>

          <div v-for="subtask in selectedTask.subtasks" :key="subtask.id" class="manage-subtask">
            <div class="row items-start no-wrap">
              <q-checkbox
                v-model="subtask.completed"
                color="primary"
                @update:model-value="updateSubtaskCompletion(selectedTask, subtask)"
              />

              <div class="col q-ml-sm">
                <div
                  class="manage-subtask-title"
                  :class="{
                    'completed-subtask': subtask.completed,
                  }"
                >
                  {{ subtask.title }}
                </div>

                <q-select
                  v-model="subtask.status"
                  :options="subtaskStatusOptions"
                  dense
                  outlined
                  class="q-mt-sm"
                  style="max-width: 180px"
                  @update:model-value="updateSubtaskStatus(selectedTask, subtask)"
                />
              </div>
            </div>
          </div>

          <!-- STATUS -->

          <div class="text-subtitle1 text-weight-bold q-mt-xl q-mb-md">Task Status</div>

          <q-select
            v-model="selectedTask.status"
            :options="taskStatusOptions"
            outlined
            label="Current status"
            @update:model-value="handleTaskStatusChange(selectedTask)"
          />

          <!-- TODAY'S NOTE -->

          <div class="text-subtitle1 text-weight-bold q-mt-xl q-mb-md">Today's Update</div>

          <q-input
            v-model="selectedTask.todayNote"
            outlined
            type="textarea"
            autogrow
            placeholder="What did you work on today?"
          />

          <!-- DEADLINE -->

          <div
            class="deadline-box q-mt-lg"
            :class="{
              'deadline-overdue': isOverdue(selectedTask),
            }"
          >
            <q-icon name="event" size="20px" />

            <div class="q-ml-sm">
              <div class="text-caption">Deadline</div>

              <div class="text-body2 text-weight-bold">
                {{ formatDate(selectedTask.deadline) }}
              </div>
            </div>
          </div>
        </div>

        <!-- SAVE -->

        <div class="q-pa-lg manage-footer">
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="save"
            label="Save Update"
            class="full-width"
            size="md"
            @click="saveTaskUpdate"
          />

          <q-btn
            v-if="selectedTask.status === 'completed'"
            unelevated
            no-caps
            color="positive"
            icon="rate_review"
            label="Put for Review"
            class="full-width q-mt-md"
            size="md"
            @click="openReviewDialog"
          />
        </div>
      </div>
    </q-drawer>

    <!-- ========================================================= -->
    <!-- REVIEW DIALOG -->
    <!-- ========================================================= -->

    <q-dialog v-model="showReviewDialog">
      <q-card class="review-dialog" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Put Task for Review</div>

          <div class="text-body2 text-grey-6 q-mt-xs">
            {{ selectedTask?.name }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="selectedReviewer"
            :options="colleagues"
            outlined
            label="Select Colleague for Review"
            option-label="name"
            option-value="id"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" @click="showReviewDialog = false" />

          <q-btn
            unelevated
            no-caps
            color="positive"
            label="Submit for Review"
            @click="submitForReview"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========================================================= -->
    <!-- INSIGHTS DIALOG -->
    <!-- ========================================================= -->

    <q-dialog v-model="showInsightsDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            <q-icon name="lightbulb" class="q-mr-sm" color="primary" />
            Employee Insights
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list separator v-if="insights.length > 0">
            <q-item v-for="(insight, index) in insights" :key="index">
              <q-item-section avatar>
                <q-icon name="info" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ insight }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-center q-pa-xl text-grey-6">
            <q-icon name="lightbulb" size="48px" class="q-mb-sm text-grey-4" />
            <div class="text-h6">No insights available</div>
            <div class="text-caption">Complete more tasks to see insights</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useQuasar } from 'quasar';
import EmployeeStatCard from '@/components/EmployeeStatCard.vue';
import QuickAddTaskCard from '@/components/QuickAddTaskCard.vue';
import TaskListHeader from '@/components/TaskListHeader.vue';
import TaskFilters from '@/components/TaskFilters.vue';

// ============================================================
// QUASAR
// ============================================================

const $q = useQuasar();

// ============================================================
// TYPES
// ============================================================

type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'in-review';

type SubtaskStatus = 'not-started' | 'in-progress' | 'completed';

interface Subtask {
  id: number;

  title: string;

  completed: boolean;

  status: SubtaskStatus;
}

interface Task {
  id: number;

  name: string;

  description: string;

  project: string;

  priority: string;

  status: TaskStatus;

  deadline: string;

  assignedBy: string;

  subtasks: Subtask[];

  todayNote: string;

  createdAt: string;

  progress: number;
}

// ============================================================
// STATE
// ============================================================

const search = ref('');

const activeTab = ref('all');

const viewMode = ref<'list' | 'grid'>('list');

const projectFilter = ref('All Projects');

const priorityFilter = ref('All Priorities');

const statusFilter = ref('All Statuses');

const showAddDialog = ref(false);

const showEditDialog = ref(false);

const showManageDrawer = ref(false);

const showInsightsDialog = ref(false);

const userPoints = ref(0);
const userRank = ref(0);

const selectedTask = ref<Task | null>(null);

// ============================================================
// FETCH TASKS FROM BACKEND
// ============================================================

const tasks = ref<Task[]>([]);

const { user } = useAuthStore();

// Review dialog state
const showReviewDialog = ref(false);
const selectedReviewer = ref<number | null>(null);
const colleagues = ref<{ id: number; name: string }[]>([]);

// Fetch colleagues for review selection
const fetchColleagues = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/users/employees');
    const result = await response.json();
    if (result.success && result.users) {
      colleagues.value = result.users
        .filter((u: any) => u.id !== user?.id) // Exclude current user
        .map((u: any) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
        }));
    }
  } catch (error) {
    console.error('Error fetching colleagues:', error);
  }
};

// Open review dialog
const openReviewDialog = () => {
  selectedReviewer.value = null;
  showReviewDialog.value = true;
  fetchColleagues();
};

// Submit task for review
const submitForReview = async () => {
  if (!selectedTask.value || !selectedReviewer.value) {
    $q.notify({
      message: 'Please select a colleague for review',
      color: 'negative',
      icon: 'error',
    });
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/employee/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: selectedTask.value.id,
        reviewer_id: selectedReviewer.value,
        task_owner_id: user?.id,
        completion_comment: 'Task completed, please review',
      }),
    });

    const result = await response.json();
    if (result.success) {
      // Update task status to in-review
      await updateTaskProgress(selectedTask.value.id, 100, 'in-review');

      showReviewDialog.value = false;
      showManageDrawer.value = false;

      $q.notify({
        message: 'Task submitted for review successfully',
        color: 'positive',
        icon: 'check_circle',
      });
    } else {
      $q.notify({
        message: result.error || 'Failed to submit for review',
        color: 'negative',
        icon: 'error',
      });
    }
  } catch (error) {
    console.error('Error submitting for review:', error);
    $q.notify({
      message: 'Error submitting for review',
      color: 'negative',
      icon: 'error',
    });
  }
};

const fetchTasks = async () => {
  if (!user?.id) {
    console.error('No user ID found for fetching tasks');
    return;
  }

  try {
    console.log('Fetching tasks for user ID:', user.id);
    const response = await fetch(`http://localhost:3001/api/tasks/employee/${user.id}`);
    const result = await response.json();

    console.log('Tasks fetch result:', result);

    if (result.success && result.tasks) {
      // Fetch subtasks for each task
      const tasksWithSubtasks = await Promise.all(
        result.tasks.map(async (task: any) => {
          try {
            const subtaskResponse = await fetch(
              `http://localhost:3001/api/employee/tasks/${task.id}/subtasks`,
            );
            const subtaskResult = await subtaskResponse.json();
            const subtasks = subtaskResult.success
              ? subtaskResult.subtasks.map((st: any) => ({
                  id: st.id,
                  title: st.title,
                  completed: st.completed === 1,
                  status: st.status,
                }))
              : [];

            return {
              id: task.id,
              name: task.title,
              description: task.description || '',
              project: task.project_name || 'Unknown Project',
              priority: task.priority || 'medium',
              status: task.status || 'not-started',
              deadline: task.deadline || '',
              assignedBy: 'Assigned by PM',
              todayNote: '',
              createdAt: task.created_at || '',
              subtasks: subtasks,
              progress: parseFloat(task.progress) || 0,
            };
          } catch (error) {
            console.error('Error fetching subtasks for task:', task.id, error);
            return {
              id: task.id,
              name: task.title,
              description: task.description || '',
              project: task.project_name || 'Unknown Project',
              priority: task.priority || 'medium',
              status: task.status || 'not-started',
              deadline: task.deadline || '',
              assignedBy: 'Assigned by PM',
              todayNote: '',
              createdAt: task.created_at || '',
              subtasks: [],
              progress: parseFloat(task.progress) || 0,
            };
          }
        }),
      );

      tasks.value = tasksWithSubtasks;
      console.log('Mapped tasks with subtasks:', tasks.value);
    } else {
      console.error('Failed to fetch tasks:', result.error);
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

// Fetch tasks on component mount
onMounted(() => {
  fetchTasks();
  fetchColleagues();
  fetchUserPointsAndRank();
});

// Fetch user points and rank
const fetchUserPointsAndRank = async () => {
  if (!user?.id) return;

  try {
    // Fetch user points
    const userResponse = await fetch(`http://localhost:3001/api/users/${user.id}`);
    const userResult = await userResponse.json();
    if (userResult.success && userResult.user) {
      userPoints.value = userResult.user.points || 0;
    }

    // Fetch all users to calculate rank
    const allUsersResponse = await fetch('http://localhost:3001/api/users');
    const allUsersResult = await allUsersResponse.json();
    if (allUsersResult.success && allUsersResult.users) {
      const sortedUsers = allUsersResult.users.sort(
        (a: any, b: any) => (b.points || 0) - (a.points || 0),
      );
      console.log(
        'Sorted users:',
        sortedUsers.map((u: any) => ({ id: u.id, points: u.points })),
      );
      const userRankIndex = sortedUsers.findIndex((u: any) => u.id === user.id);
      console.log('User ID:', user.id, 'Rank index:', userRankIndex);
      userRank.value = userRankIndex >= 0 ? userRankIndex + 1 : 1; // Default to rank 1 if not found
    }
  } catch (error) {
    console.error('Error fetching user points and rank:', error);
    userRank.value = 1; // Default to rank 1 on error
  }
};

// Employee Insights
const insights = computed(() => {
  const insightsList: string[] = [];
  const total = tasks.value.length;
  const completed = tasks.value.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.value.filter((t) => t.status === 'in-progress').length;
  const notStarted = tasks.value.filter((t) => t.status === 'not-started').length;
  const blocked = tasks.value.filter((t) => t.status === 'blocked').length;

  const avgProgress =
    total > 0 ? Math.round(tasks.value.reduce((sum, t) => sum + taskProgress(t), 0) / total) : 0;

  if (total === 0) {
    insightsList.push('No tasks assigned yet. Check with your Project Manager.');
  } else {
    if (inProgress > 0) {
      insightsList.push(`${inProgress} tasks are currently in progress.`);
    }

    if (completed > 0) {
      insightsList.push(`${completed} tasks completed. Great work!`);
    }

    if (notStarted > 0) {
      insightsList.push(`${notStarted} tasks haven't been started yet.`);
    }

    if (blocked > 0) {
      insightsList.push(`${blocked} tasks are blocked. Consider resolving dependencies.`);
    }

    if (avgProgress < 50 && total > 0) {
      insightsList.push('Average progress is below 50%. Focus on completing tasks.');
    }

    const overdue = tasks.value.filter((t) => isOverdue(t)).length;
    if (overdue > 0) {
      insightsList.push(`${overdue} tasks are overdue. Prioritize these!`);
    }

    const highPriority = tasks.value.filter(
      (t) => t.priority === 'high' && t.status !== 'completed',
    ).length;
    if (highPriority > 0) {
      insightsList.push(`${highPriority} high-priority tasks need attention.`);
    }
  }

  return insightsList;
});

// Update task progress/status to backend
const updateTaskProgress = async (taskId: number, progress: number, status: string) => {
  try {
    console.log('Updating task:', taskId, 'progress:', progress, 'status:', status);
    const response = await fetch(`http://localhost:3001/api/employee/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, status }),
    });
    const result = await response.json();
    console.log('Update task result:', result);
    if (result.success) {
      // Refresh tasks to get latest data
      await fetchTasks();
    } else {
      console.error('Update task failed:', result.error);
    }
  } catch (error) {
    console.error('Error updating task progress:', error);
  }
};

// ============================================================
// NEW TASK
// ============================================================

const newTask = ref({
  name: '',

  description: '',

  project: '',

  priority: 'Medium',

  deadline: '',

  subtasks: [] as {
    id: number;
    title: string;
  }[],
});

// ============================================================
// EDIT SUBTASK COPY
// ============================================================

const editSubtasks = ref<Subtask[]>([]);

// ============================================================
// OPTIONS
// ============================================================

const projectOptions = computed(() => [
  { label: 'All Projects', value: 'All Projects' },
  ...Array.from(new Set(tasks.value.map((task) => task.project))).map((p) => ({
    label: p,
    value: p,
  })),
]);

const priorityOptions = ['All Priorities', 'Critical', 'High', 'Medium', 'Low'];

const taskStatusOptions: TaskStatus[] = [
  'not-started',

  'in-progress',

  'completed',

  'blocked',

  'in-review',
];

const subtaskStatusOptions: SubtaskStatus[] = ['not-started', 'in-progress', 'completed'];

// ============================================================
// TAB LABEL
// ============================================================

const activeTabLabel = computed(() => {
  switch (activeTab.value) {
    case 'my':
      return 'Assigned to you';

    case 'progress':
      return 'Currently active';

    case 'completed':
      return 'Finished tasks';

    default:
      return 'All tasks';
  }
});

// ============================================================
// FILTERED TASKS
// ============================================================

const filteredTasks = computed(() => {
  const query = search.value.trim().toLowerCase();

  return tasks.value.filter((task) => {
    const matchesSearch =
      !query ||
      task.name.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query);

    const matchesProject =
      projectFilter.value === 'All Projects' || task.project === projectFilter.value;

    const matchesPriority =
      priorityFilter.value === 'All Priorities' || task.priority === priorityFilter.value;

    const matchesStatus =
      statusFilter.value === 'All Statuses' || task.status === statusFilter.value;

    let matchesTab = true;

    if (activeTab.value === 'progress') {
      matchesTab = task.status === 'in-progress';
    }

    if (activeTab.value === 'completed') {
      matchesTab = task.status === 'completed';
    }

    return matchesSearch && matchesProject && matchesPriority && matchesStatus && matchesTab;
  });
});

// ============================================================
// STATISTICS
// ============================================================

const stats = computed(() => [
  {
    label: 'Total Tasks',

    value: tasks.value.length,

    description: 'Assigned to you',

    icon: 'assignment',

    color: 'var(--color-purple)',

    background: 'var(--color-purple-light)',

    trend: 'All tasks',

    positive: true,
  },

  {
    label: 'In Progress',

    value: tasks.value.filter((task) => task.status === 'in-progress').length,

    description: 'Currently active',

    icon: 'pending_actions',

    color: 'var(--color-blue)',

    background: 'var(--color-blue-light)',

    trend: 'Active',

    positive: true,
  },

  {
    label: 'Completed',

    value: tasks.value.filter((task) => task.status === 'completed').length,

    description: 'Successfully finished',

    icon: 'check_circle',

    color: 'var(--color-success)',

    background: 'var(--color-success-light)',

    trend: 'Good progress',

    positive: true,
  },

  {
    label: 'Overdue',

    value: tasks.value.filter((task) => isOverdue(task)).length,

    description: 'Need attention',

    icon: 'warning',

    color: 'var(--color-danger)',

    background: 'var(--color-danger-light)',

    trend: 'Review',

    positive: false,
  },
]);

// ============================================================
// TABLE COLUMNS
// ============================================================

const columns = [
  {
    name: 'task',

    label: 'TASK',

    field: 'name',

    align: 'left' as const,

    sortable: true,
  },

  {
    name: 'project',

    label: 'PROJECT',

    field: 'project',

    align: 'left' as const,

    sortable: true,
  },

  {
    name: 'subtasks',

    label: 'SUBTASKS',

    field: 'subtasks',

    align: 'left' as const,
  },

  {
    name: 'priority',

    label: 'PRIORITY',

    field: 'priority',

    align: 'left' as const,
  },

  {
    name: 'status',

    label: 'STATUS',

    field: 'status',

    align: 'left' as const,
  },

  {
    name: 'progress',

    label: 'PROGRESS',

    field: 'progress',

    align: 'left' as const,
  },

  {
    name: 'deadline',

    label: 'DEADLINE',

    field: 'deadline',

    align: 'left' as const,
  },

  {
    name: 'actions',

    label: '',

    field: 'actions',

    align: 'right' as const,
  },
];

// ============================================================
// SUBTASK CALCULATIONS
// ============================================================

function completedSubtasks(task: Task) {
  return task.subtasks.filter((subtask) => subtask.completed).length;
}

function taskProgress(task: Task) {
  // If task is completed, return 100% from database
  if (task.status === 'completed') {
    return 100;
  }

  // If task has no subtasks, use database progress
  if (task.subtasks.length === 0) {
    return task.progress || 0;
  }

  const completed = completedSubtasks(task);

  return Math.round((completed / task.subtasks.length) * 100);
}

// ============================================================
// AUTOMATIC STATUS
// ============================================================

function recalculateTask(task: Task) {
  const progress = taskProgress(task);

  if (task.subtasks.length > 0 && progress === 100) {
    task.status = 'completed';

    return;
  }

  if (progress > 0) {
    task.status = 'in-progress';

    return;
  }

  task.status = 'not-started';
}

// ============================================================
// SUBTASK COMPLETION
// ============================================================

async function updateSubtaskCompletion(task: Task, subtask: Subtask) {
  if (subtask.completed) {
    subtask.status = 'completed';
  } else {
    subtask.status = 'not-started';
  }

  // Save subtask to database
  try {
    await fetch(`http://localhost:3001/api/employee/subtasks/${subtask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: subtask.title,
        status: subtask.status,
        completed: subtask.completed,
      }),
    });
  } catch (error) {
    console.error('Error updating subtask:', error);
  }

  recalculateTask(task);

  // Save task progress to database
  const progress = taskProgress(task);
  updateTaskProgress(task.id, progress, task.status);
}

async function updateSubtaskStatus(task: Task, subtask: Subtask) {
  // Update completed based on status
  if (subtask.status === 'completed') {
    subtask.completed = true;
  } else {
    subtask.completed = false;
  }

  // Save subtask to database
  try {
    await fetch(`http://localhost:3001/api/employee/subtasks/${subtask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: subtask.title,
        status: subtask.status,
        completed: subtask.completed,
      }),
    });
  } catch (error) {
    console.error('Error updating subtask:', error);
  }

  recalculateTask(task);

  // Save task progress to database
  const progress = taskProgress(task);
  updateTaskProgress(task.id, progress, task.status);
}

// ============================================================
// TASK STATUS CHANGE
// ============================================================

function handleTaskStatusChange(task: Task) {
  if (task.status === 'completed') {
    task.subtasks.forEach((subtask) => {
      subtask.completed = true;

      subtask.status = 'completed';
    });
  }

  if (task.status === 'not-started') {
    task.subtasks.forEach((subtask) => {
      subtask.completed = false;

      subtask.status = 'not-started';
    });
  }

  // Sync with backend
  const progress = taskProgress(task);
  updateTaskProgress(task.id, progress, task.status);
}

// ============================================================
// ADD TASK
// ============================================================

function openAddTask() {
  newTask.value = {
    name: '',

    description: '',

    project: '',

    priority: 'Medium',

    deadline: '',

    subtasks: [],
  };

  showAddDialog.value = true;
}

function addNewTaskSubtask() {
  newTask.value.subtasks.push({
    id: Date.now(),

    title: '',
  });
}

function removeNewTaskSubtask(index: number) {
  newTask.value.subtasks.splice(index, 1);
}

function createTask() {
  if (!newTask.value.name.trim()) {
    $q.notify({
      message: 'Please enter a task name',

      color: 'negative',

      icon: 'error',
    });

    return;
  }

  const subtasks: Subtask[] = newTask.value.subtasks

    .filter((subtask) => subtask.title.trim())

    .map((subtask) => ({
      id: subtask.id,

      title: subtask.title.trim(),

      completed: false,

      status: 'not-started',
    }));

  const task = {
    id: Date.now(),
    name: newTask.value.name.trim(),
    description: newTask.value.description || 'No description added.',
    project: newTask.value.project || 'Personal',
    priority: newTask.value.priority || 'medium',
    status: 'not-started',
    deadline: newTask.value.deadline || new Date().toISOString().split('T')[0] || '',
    assignedBy: 'Created by you',
    subtasks,
    todayNote: '',
    createdAt: new Date().toISOString(),
    progress: 0,
  } as Task;

  tasks.value.unshift(task);

  showAddDialog.value = false;

  $q.notify({
    message: 'Task created successfully',

    color: 'positive',

    icon: 'check_circle',
  });
}

// ============================================================
// EDIT SUBTASKS
// ============================================================

function openEditSubtasks(task: Task) {
  selectedTask.value = task;

  editSubtasks.value = task.subtasks.map((subtask) => ({
    ...subtask,
  }));

  showEditDialog.value = true;
}

function addEditSubtask() {
  editSubtasks.value.push({
    id: Date.now(),

    title: '',

    completed: false,

    status: 'not-started',
  });
}

function removeEditSubtask(id: number) {
  editSubtasks.value = editSubtasks.value.filter((subtask) => subtask.id !== id);
}

async function saveEditedSubtasks() {
  if (!selectedTask.value) {
    return;
  }

  try {
    // Delete all existing subtasks for this task
    for (const subtask of selectedTask.value.subtasks) {
      await fetch(`http://localhost:3001/api/employee/subtasks/${subtask.id}`, {
        method: 'DELETE',
      });
    }

    // Create new subtasks
    const newSubtasks = editSubtasks.value
      .filter((subtask) => subtask.title.trim())
      .map((subtask) => ({
        ...subtask,
        title: subtask.title.trim(),
      }));

    for (const subtask of newSubtasks) {
      await fetch(`http://localhost:3001/api/employee/tasks/${selectedTask.value.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: subtask.title }),
      });
    }

    // Refresh tasks to get updated subtasks
    await fetchTasks();

    selectedTask.value.subtasks = newSubtasks;
    recalculateTask(selectedTask.value);

    showEditDialog.value = false;

    $q.notify({
      message: 'Subtasks updated successfully',
      color: 'positive',
      icon: 'check_circle',
    });
  } catch (error) {
    console.error('Error saving subtasks:', error);
    $q.notify({
      message: 'Error saving subtasks',
      color: 'negative',
      icon: 'error',
    });
  }
}

// ============================================================
// MANAGE DRAWER
// ============================================================

function openManage(task: Task) {
  selectedTask.value = task;

  showManageDrawer.value = true;
}

function openEditFromManage() {
  if (!selectedTask.value) {
    return;
  }

  showManageDrawer.value = false;

  openEditSubtasks(selectedTask.value);
}

function saveTaskUpdate() {
  if (!selectedTask.value) {
    return;
  }

  recalculateTask(selectedTask.value);

  // Save to database
  const progress = taskProgress(selectedTask.value);
  updateTaskProgress(selectedTask.value.id, progress, selectedTask.value.status);

  $q.notify({
    message: 'Task progress updated',

    color: 'positive',

    icon: 'save',
  });
}

// ============================================================
// VIEW TASK
// ============================================================

function viewTask(task: Task) {
  selectedTask.value = task;

  showManageDrawer.value = true;
}

// ============================================================
// DELETE
// ============================================================

function deleteTask(task: Task) {
  $q.dialog({
    title: 'Delete Task',

    message: `Delete "${task.name}"?`,

    cancel: true,

    persistent: true,
  }).onOk(() => {
    tasks.value = tasks.value.filter((item) => item.id !== task.id);

    $q.notify({
      message: 'Task deleted',

      color: 'positive',

      icon: 'delete',
    });
  });
}

// ============================================================
// FILTERS
// ============================================================

function clearFilters() {
  search.value = '';

  projectFilter.value = 'All Projects';

  priorityFilter.value = 'All Priorities';

  statusFilter.value = 'All Statuses';
}

function refreshTasks() {
  $q.notify({
    message: 'Tasks refreshed',

    color: 'primary',

    icon: 'refresh',
  });
}

// ============================================================
// PRIORITY STYLE
// ============================================================

function priorityStyle(priority: string) {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'var(--priority-critical-bg)',

        color: 'var(--priority-critical)',
      };

    case 'High':
      return {
        bg: 'var(--priority-high-bg)',

        color: 'var(--priority-high)',
      };

    case 'Medium':
      return {
        bg: 'var(--priority-medium-bg)',

        color: 'var(--priority-medium)',
      };

    default:
      return {
        bg: 'var(--priority-low-bg)',

        color: 'var(--priority-low)',
      };
  }
}

// ============================================================
// STATUS STYLE
// ============================================================

function statusStyle(status: string) {
  switch (status) {
    case 'Completed':
      return {
        bg: 'var(--status-completed-bg)',

        color: 'var(--status-completed)',
      };

    case 'In Progress':
      return {
        bg: 'var(--status-progress-bg)',

        color: 'var(--status-progress)',
      };

    default:
      return {
        bg: 'var(--status-not-started-bg)',

        color: 'var(--status-not-started)',
      };
  }
}

// ============================================================
// PROJECT STYLE
// ============================================================

function projectColor(project: string) {
  if (project === 'Mobile Banking') {
    return {
      bg: 'var(--color-info-light)',

      color: 'var(--color-blue)',
    };
  }

  if (project === 'Website Redesign') {
    return {
      bg: 'var(--color-purple-light)',

      color: 'var(--color-purple)',
    };
  }

  return {
    bg: 'var(--color-teal-light)',

    color: 'var(--color-teal)',
  };
}

function projectIcon(project: string) {
  if (project === 'Mobile Banking') {
    return 'account_balance';
  }

  if (project === 'Website Redesign') {
    return 'web';
  }

  return 'folder';
}

// ============================================================
// DATE
// ============================================================

function formatDate(date: string) {
  if (!date) {
    return '-';
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================================
// OVERDUE
// ============================================================

function isOverdue(task: Task) {
  if (task.status === 'completed') {
    return false;
  }

  return new Date(task.deadline) < new Date();
}
</script>

<style scoped>
.stat-card {
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-trend {
  font-size: 11px;
  font-weight: 600;
}

.quick-add-card {
  border-radius: var(--radius-lg);

  background: linear-gradient(110deg, var(--color-primary), var(--color-primary-light));
}

.quick-add-icon {
  background: rgba(159, 226, 63, 0.15);

  color: var(--color-secondary);
}

.quick-add-title {
  color: white;
  font-size: 17px;
  font-weight: 700;
}

.quick-add-subtitle {
  color: #b8bac8;
  font-size: 13px;
  margin-top: 4px;
}

.my-tasks-card {
  border-radius: var(--radius-lg);
  background: white;
}

.my-task-icon {
  background: var(--color-purple-light);
  color: var(--color-purple);
}

.task-name {
  font-size: 16px;
  font-weight: 650;
  line-height: 1.3;
  color: var(--color-text);
}

.task-description {
  max-width: 330px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-table :deep(th) {
  background: #fafbfc;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.task-table :deep(td) {
  padding-top: 16px;
  padding-bottom: 16px;
  border-color: var(--color-border-light);
}

.task-table :deep(tbody tr) {
  transition: background 0.15s ease;
}

.task-table :deep(tbody tr:hover) {
  background: #fafaff;
}

.subtask-count {
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.task-grid-card {
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.task-grid-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.task-grid-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
}

.grid-description {
  white-space: normal;
  max-width: none;
}

.task-dialog {
  width: 620px;
  max-width: 95vw;
  border-radius: var(--radius-lg);
}

.subtask-editor {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-hover);
}

.subtask-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.empty-subtasks {
  padding: 25px;
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.points-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.points-text {
  font-size: 16px;
  font-weight: bold;
  color: #8b4513;
}

.edit-subtask-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.manage-header {
  background: var(--color-surface);
}

.manage-task-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.manage-progress-card {
  border-radius: var(--radius-lg);
  background: var(--color-purple-light);
}

.manage-subtask {
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: white;
  transition: all 0.15s ease;
}

.manage-subtask:hover {
  border-color: var(--color-purple);
  box-shadow: var(--shadow-sm);
}

.manage-subtask-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.completed-subtask {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.deadline-box {
  display: flex;
  align-items: center;
  padding: 13px;
  border-radius: var(--radius-md);
  background: var(--color-info-light);
  color: var(--color-blue);
}

.deadline-overdue {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.manage-footer {
  border-top: 1px solid var(--color-border);
  background: white;
}
</style>
