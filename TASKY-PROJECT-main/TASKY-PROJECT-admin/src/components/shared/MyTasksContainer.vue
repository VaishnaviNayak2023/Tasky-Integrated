<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">My Tasks</div>
      <q-btn
        color="primary"
        icon="add"
        label="Self-Assign Task"
        @click="showCreateTaskDialog = true"
      />
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-select
              v-model="filters.project"
              label="Filter by Project"
              :options="projectOptions"
              outlined
              clearable
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.status"
              label="Filter by Status"
              :options="statusOptions"
              outlined
              clearable
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filters.priority"
              label="Filter by Priority"
              :options="priorityOptions"
              outlined
              clearable
            />
          </div>
          <div class="col-12 col-sm-2">
            <q-btn color="grey" label="Clear Filters" class="full-width" @click="clearFilters" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tasks Grid -->
    <div v-if="filteredTasks.length === 0" class="text-center q-pa-lg text-grey-6">
      <q-icon name="assignment" size="64px" color="grey-4" />
      <div class="text-h6 q-mt-md">No tasks found</div>
      <div class="text-caption">Create a self-assigned task to get started</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="task in filteredTasks" :key="task.id" class="col-12 col-md-6">
        <q-card class="cursor-pointer" @click="showTaskDetail(task)">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-avatar
                :style="{ backgroundColor: getProjectById(task.project_id)?.color }"
                size="32px"
                text-color="white"
                class="q-mr-sm"
              >
                {{ getProjectById(task.project_id)?.name.charAt(0) }}
              </q-avatar>
              <div class="text-subtitle1 text-weight-bold">{{ task.title }}</div>
              <q-space />
              <q-badge :color="getPriorityColor(task.priority)" class="text-capitalize">
                {{ task.priority }}
              </q-badge>
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              {{ getProjectById(task.project_id)?.name }}
            </div>
            <div class="text-caption q-mb-sm">{{ task.description }}</div>
            <div class="row q-col-gutter-sm q-mb-sm">
              <div class="col-6">
                <div class="text-caption text-grey-6">Status</div>
                <q-badge :color="getStatusColor(task.status)" class="text-capitalize">
                  {{ task.status.replace('-', ' ') }}
                </q-badge>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Deadline</div>
                <div :class="isOverdue(task.deadline) ? 'text-red text-weight-bold' : ''">
                  {{ task.deadline }}
                </div>
              </div>
            </div>
            <div class="q-mb-sm">
              <div class="text-caption text-grey-6">Progress</div>
              <q-linear-progress
                :value="task.progress / 100"
                :color="getProgressColor(task.progress)"
              />
              <div class="text-caption text-right">{{ task.progress }}%</div>
            </div>
            <div class="row items-center text-caption text-grey-6">
              <div class="col-6">
                <q-icon name="schedule" class="q-mr-xs" />
                {{ task.expected_effort }}h estimated
              </div>
              <div class="col-6 text-right">
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="Update Progress"
                  @click.stop="openUpdateDialog(task)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

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
              :options="projectOptions"
              outlined
              emit-value
              map-options
              class="q-mb-md"
              :rules="[(val) => !!val || 'Project is required']"
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
              :options="priorityOptions"
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

    <!-- Update Progress Dialog -->
    <q-dialog v-model="showUpdateDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Update Task Progress</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="selectedTask">
            <div class="text-subtitle2 q-mb-md">{{ selectedTask.title }}</div>
            <q-slider
              v-model="progressUpdate"
              :min="selectedTask.progress"
              :max="100"
              label
              label-always
              color="primary"
              class="q-mb-md"
            />
            <q-input
              v-model="progressNotes"
              label="Notes (optional)"
              outlined
              type="textarea"
              rows="2"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Update" @click="updateProgress" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Task Detail Dialog -->
    <q-dialog v-model="showTaskDialog">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">{{ selectedTask?.title }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="selectedTask">
            <div class="q-mb-md">
              <strong>Project:</strong> {{ getProjectById(selectedTask.project_id)?.name }}
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
              <div class="col-6"><strong>Deadline:</strong> {{ selectedTask.deadline }}</div>
              <div class="col-6">
                <strong>Expected Effort:</strong> {{ selectedTask.expected_effort }}h
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
            color="primary"
            label="Update Progress"
            @click="selectedTask && openUpdateDialog(selectedTask)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useMyTasks } from '../../composables/useMyTasks';

const {
  showCreateTaskDialog,
  showTaskDialog,
  showUpdateDialog,
  selectedTask,
  progressUpdate,
  progressNotes,
  filters,
  newTask,
  statusOptions,
  priorityOptions,
  projectOptions,
  myTasks,
  filteredTasks,
  getProjectById,
  getEmployeeById,
  getProgressUpdatesByTask,
  getPriorityColor,
  getStatusColor,
  getProgressColor,
  isOverdue,
  clearFilters,
  showTaskDetail,
  openUpdateDialog,
  createSelfAssignedTask,
  updateProgress,
} = useMyTasks();
</script>
