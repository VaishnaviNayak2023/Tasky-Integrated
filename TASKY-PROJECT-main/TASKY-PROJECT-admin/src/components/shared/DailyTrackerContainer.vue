<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">Daily Tracker</div>
      <q-btn color="primary" icon="add" label="Add Daily Task" @click="showAddDialog = true" />
    </div>

    <!-- Daily Tracker Tasks -->
    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="task in dailyTasks" :key="task.id" class="col-12 col-sm-6 col-md-4">
        <q-card class="daily-task-card" flat bordered>
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">{{ task.title || 'Untitled' }}</div>
              <q-badge
                :color="getStatusColor(task.status || 'Not Started')"
                class="text-capitalize"
              >
                {{ task.status || 'Not Started' }}
              </q-badge>
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">{{ task.date }}</div>
            <div v-if="task.description" class="text-body2 q-mt-sm">{{ task.description }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="row items-center q-mb-sm">
              <div class="text-caption text-grey-7">Progress:</div>
              <q-space />
              <div class="text-body2 text-weight-bold">{{ task.progress }}%</div>
            </div>
            <q-linear-progress :value="task.progress / 100" color="primary" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat color="primary" label="Edit" @click="editTask(task)" />
            <q-btn flat color="negative" label="Delete" @click="deleteTask(task.id)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Empty State -->
    <q-card v-if="dailyTasks.length === 0" class="empty-state" flat bordered>
      <q-card-section class="row column items-center q-py-xl">
        <q-icon name="task_alt" size="64px" color="grey-4" />
        <div class="text-h6 q-mt-md">No daily tasks yet</div>
        <div class="text-caption text-grey-6">Add your first daily task to get started</div>
      </q-card-section>
    </q-card>

    <!-- Summary Section -->
    <q-card class="q-mt-md" flat bordered>
      <q-card-section>
        <div class="text-h6 text-weight-bold">Summary</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey-7">Tasks Planned</div>
            <div class="text-h4 text-weight-bold">{{ summary.totalTasks }}</div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey-7">Tasks Completed</div>
            <div class="text-h4 text-weight-bold text-green">{{ summary.completedTasks }}</div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey-7">In Progress</div>
            <div class="text-h4 text-weight-bold text-blue">{{ summary.inProgressTasks }}</div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-caption text-grey-7">Average Progress</div>
            <div class="text-h4 text-weight-bold text-amber">{{ summary.averageProgress }}%</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Project Summary -->
    <q-card v-if="projectSummary.length > 0" class="q-mt-md" flat bordered>
      <q-card-section>
        <div class="text-h6 text-weight-bold">Project Summary</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item v-for="(project, index) in projectSummary" :key="index">
            <q-item-section avatar>
              <q-icon name="folder" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ project.name || 'No Project' }}</q-item-label>
              <q-item-label caption
                >{{ project.taskCount }} tasks • {{ project.avgProgress }}% avg
                progress</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-linear-progress
                :value="project.avgProgress / 100"
                color="primary"
                style="width: 100px"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Employee Insights -->
    <q-card v-if="insights.length > 0" class="q-mt-md bg-blue-1" flat bordered>
      <q-card-section>
        <div class="text-h6 text-weight-bold text-blue-9">
          <q-icon name="lightbulb" class="q-mr-sm" />
          Employee Insights
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item v-for="(insight, index) in insights" :key="index">
            <q-item-section avatar>
              <q-icon name="info" color="blue" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ insight }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section>
          <div class="text-h6">{{ editingTask ? 'Edit Daily Task' : 'Add Daily Task' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit="saveTask">
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
            <q-input
              v-model="newTask.date"
              label="Date"
              outlined
              type="date"
              class="q-mb-md"
              :rules="[(val) => !!val || 'Date is required']"
            />
            <q-input
              v-model.number="newTask.progress"
              label="Progress (%)"
              outlined
              type="number"
              min="0"
              max="100"
              class="q-mb-md"
              :rules="[(val) => (val >= 0 && val <= 100) || 'Progress must be between 0 and 100']"
            />
            <q-select
              v-model="newTask.status"
              label="Status"
              :options="statusOptions"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || 'Status is required']"
            />
            <q-input
              v-model="newTask.project_name"
              label="Project Name (Optional)"
              outlined
              class="q-mb-md"
              hint="Enter project name manually"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Save" @click="saveTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useDailyTracker } from '../../composables/useDailyTracker';

const {
  showAddDialog,
  editingTask,
  loading,
  projects,
  newTask,
  statusOptions,
  dailyTasks,
  summary,
  projectSummary,
  insights,
  getStatusColor,
  editTask,
  saveTask,
  deleteTask,
  resetForm,
} = useDailyTracker();
</script>

<style scoped>
.daily-task-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.daily-task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-state {
  min-height: 200px;
}
</style>
