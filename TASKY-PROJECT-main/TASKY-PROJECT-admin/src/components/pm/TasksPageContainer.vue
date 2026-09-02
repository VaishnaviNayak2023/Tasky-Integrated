<template>
  <q-page
    class="q-pa-md text-black"
    style="
      height: 100vh;
      max-height: 100vh;
      min-height: 0 !important;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
    "
  >
    <!-- Header -->
    <div class="row items-start justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="row items-center">
        <q-avatar
          color="indigo-1"
          text-color="indigo"
          icon="o_calendar_today"
          size="48px"
          class="q-mr-md"
          style="border-radius: 12px"
        />
        <div class="column">
          <div class="text-h5 text-weight-bold">Tasks</div>
          <div class="text-grey-7 text-caption">View and manage all tasks across your projects</div>
        </div>
      </div>
      <div class="column items-end">
        <div class="row items-center q-gutter-md q-mb-md">
          <q-input
            v-model="filters.search"
            outlined
            dense
            rounded
            bg-color="white"
            placeholder="Search tasks, descriptions..."
            style="width: 320px"
            @update:model-value="applyFilters"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-avatar size="36px" class="cursor-pointer">
            <img :src="authStore.currentUser?.avatar || 'https://cdn.quasar.dev/img/avatar.png'" />
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup to="/dashboard/profile">
                  <q-item-section avatar><q-icon name="person" /></q-item-section>
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar><q-icon name="logout" color="red" /></q-item-section>
                  <q-item-section class="text-red">Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </div>
        <q-btn
          unelevated
          color="indigo"
          icon="add"
          label="New Task"
          no-caps
          class="rounded-borders"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="row q-gutter-x-lg q-mb-md" style="flex: 0 0 auto">
      <div class="row items-center">
        <q-icon name="o_schedule" color="blue-grey" size="20px" class="q-mr-xs" />
        <div class="text-weight-bold q-mr-sm">{{ taskStore.stats.notStarted || 0 }}</div>
        <div class="text-caption text-grey-7">Not Started</div>
      </div>
      <div class="row items-center">
        <q-icon name="o_play_circle_outline" color="blue" size="20px" class="q-mr-xs" />
        <div class="text-weight-bold text-blue q-mr-sm">{{ taskStore.stats.inProgress || 0 }}</div>
        <div class="text-caption text-grey-7">In Progress</div>
      </div>
      <div class="row items-center">
        <q-icon name="o_warning_amber" color="red" size="20px" class="q-mr-xs" />
        <div class="text-weight-bold text-red q-mr-sm">{{ taskStore.stats.overdue || 0 }}</div>
        <div class="text-caption text-grey-7">Overdue</div>
      </div>
      <div class="row items-center">
        <q-icon name="block" color="orange" size="20px" class="q-mr-xs" />
        <div class="text-weight-bold text-orange q-mr-sm">{{ taskStore.stats.blocked || 0 }}</div>
        <div class="text-caption text-grey-7">Blocked</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="row items-center justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="row items-center q-gutter-x-sm">
        <q-select
          v-model="filters.project"
          outlined
          dense
          :options="projectOptions"
          style="width: 170px"
          bg-color="white"
          rounded
          emit-value
          map-options
          @update:model-value="applyFilters"
        >
          <template v-slot:prepend><q-icon name="o_folder" size="18px" /></template>
        </q-select>
        <q-select
          v-model="filters.status"
          outlined
          dense
          :options="STATUS_OPTIONS"
          style="width: 170px"
          bg-color="white"
          rounded
          emit-value
          map-options
          @update:model-value="applyFilters"
        >
          <template v-slot:prepend><q-icon name="o_settings" size="18px" /></template>
        </q-select>
        <q-select
          v-model="filters.priority"
          outlined
          dense
          :options="PRIORITY_OPTIONS"
          style="width: 170px"
          bg-color="white"
          rounded
          emit-value
          map-options
          @update:model-value="applyFilters"
        >
          <template v-slot:prepend><q-icon name="o_flag" size="18px" /></template>
        </q-select>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <q-btn
          v-if="hasActiveFilters"
          flat
          color="grey-7"
          icon="o_filter_alt_off"
          label="Clear Filters"
          no-caps
          size="sm"
          class="bg-white rounded-borders q-px-sm"
          style="border: 1px solid #e0e0e0"
          @click="clearFilters"
        />
      </div>
    </div>

    <!-- Data Table -->
    <TasksTable
      @edit="openEditDialog"
      @delete="confirmDelete"
      @view="openTaskDetail"
      @assign-reviewer="openAssignReviewerDialog"
      @finalize-review="openFinalizeReviewDialog"
    />

    <!-- Dialogs -->
    <CreateTaskDialog v-model="showCreateDialog" :task-to-edit="taskToEdit" @saved="onTaskSaved" />
    <TaskDetailDialog
      v-model="showDetailDialog"
      :task-id="selectedTaskId"
      @edit="openEditDialog"
      @deleted="onTaskDeleted"
    />

    <!-- Assign Reviewer Dialog -->
    <q-dialog v-model="showAssignReviewerDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Assign Reviewer</div>
        </q-card-section>
        <q-card-section>
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Task: {{ selectedTaskForReview?.title }}</div>
            <div class="text-caption text-grey-7">
              Select a colleague to review this completed task
            </div>
          </div>
          <q-select
            v-model="selectedReviewerId"
            :options="employeeOptions"
            label="Select Reviewer"
            outlined
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Assign" @click="assignReviewer" :loading="assigning" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Finalize Review Dialog -->
    <q-dialog v-model="showFinalizeReviewDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Finalize Review</div>
        </q-card-section>
        <q-card-section>
          <div class="q-mb-md">
            <div class="text-subtitle2">Task: {{ selectedTaskForFinalize?.title }}</div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Reviewer: {{ selectedTaskForFinalize?.reviewer_first_name }}
              {{ selectedTaskForFinalize?.reviewer_last_name }}
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              Review Comment: {{ selectedTaskForFinalize?.review_comment }}
            </div>
          </div>
          <q-input
            v-model="pmFinalComment"
            label="Final PM Comment"
            type="textarea"
            outlined
            rows="3"
            hint="This comment will be visible to both the task owner and reviewer"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Finalize" @click="finalizeReview" :loading="finalizing" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { usePmTaskStore } from '../../stores/pmTaskStore';
import { useTasksPage } from '../../composables/useTasksPage';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../constants';
import TasksTable from '../TasksTable.vue';
import CreateTaskDialog from '../CreateTaskDialog.vue';
import TaskDetailDialog from '../TaskDetailDialog.vue';

const router = useRouter();
const authStore = useAuthStore();
const taskStore = usePmTaskStore();

// Use the composable for data fetching and business logic
const {
  filters,
  showCreateDialog,
  showDetailDialog,
  showAssignReviewerDialog,
  showFinalizeReviewDialog,
  taskToEdit,
  selectedTaskId,
  selectedTaskForReview,
  selectedTaskForFinalize,
  selectedReviewerId,
  pmFinalComment,
  assigning,
  finalizing,
  projectOptions,
  employeeOptions,
  hasActiveFilters,
  STATUS_OPTIONS: statusOptions,
  PRIORITY_OPTIONS: priorityOptions,
  applyFilters,
  clearFilters,
  logout,
  openCreateDialog,
  openEditDialog,
  openTaskDetail,
  onTaskSaved,
  onTaskDeleted,
  confirmDelete,
  openAssignReviewerDialog,
  assignReviewer,
  openFinalizeReviewDialog,
  finalizeReview,
} = useTasksPage();

const handleLogout = () => {
  logout();
  router.push('/auth/login');
};
</script>

<style scoped>
:deep(.q-field--dense .q-field__bottom) {
  display: none;
}
:deep(.q-field--outlined .q-field__control) {
  padding: 0 12px;
}
</style>
