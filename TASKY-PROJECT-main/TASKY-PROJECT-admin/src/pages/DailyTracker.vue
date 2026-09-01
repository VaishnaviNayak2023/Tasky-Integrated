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
      <q-card-section class="column items-center q-py-xl">
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

interface DailyTask {
  id: number;
  title: string;
  description: string;
  date: string;
  progress: number;
  status: string;
  project_name?: string;
}

const showAddDialog = ref(false);
const editingTask = ref<DailyTask | null>(null);
const { user } = useAuthStore();

const newTask = ref({
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  progress: 0,
  status: 'Not Started',
  project_name: '',
});

const statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

const dailyTasks = ref<DailyTask[]>([]);
const loading = ref(false);
const projects = ref<any[]>([]);

// Fetch projects for selection
const fetchProjects = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/projects');
    const result = await response.json();
    console.log('Projects API response:', result);
    if (result.success && result.projects) {
      projects.value = result.projects;
      console.log('Projects loaded:', projects.value);
    } else {
      console.error('Projects fetch failed:', result);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

// Fetch daily tracker entries from database
const fetchDailyTasks = async () => {
  if (!user?.id) return;

  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3001/api/employee/daily-tracker/${user.id}`);
    const result = await response.json();

    if (result.success && result.entries) {
      dailyTasks.value = result.entries.map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description || '',
        date: entry.date,
        progress: parseFloat(entry.progress) || 0,
        status: entry.status || 'Not Started',
        project_name: entry.project_name || '',
      }));
    }
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
  } finally {
    loading.value = false;
  }
};

const summary = computed(() => {
  const total = dailyTasks.value.length;
  const completed = dailyTasks.value.filter((t) => t.status === 'Completed').length;
  const inProgress = dailyTasks.value.filter((t) => t.status === 'In Progress').length;
  const avgProgress =
    total > 0 ? Math.round(dailyTasks.value.reduce((sum, t) => sum + t.progress, 0) / total) : 0;

  return {
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    averageProgress: avgProgress,
    remainingTasks: total - completed,
  };
});

const projectSummary = computed(() => {
  const projects: Record<string, { taskCount: number; totalProgress: number }> = {};

  dailyTasks.value.forEach((task) => {
    const projectName = task.project_name || 'No Project';
    if (!projects[projectName]) {
      projects[projectName] = { taskCount: 0, totalProgress: 0 };
    }
    projects[projectName].taskCount++;
    projects[projectName].totalProgress += task.progress;
  });

  return Object.entries(projects).map(([name, data]) => ({
    name,
    taskCount: data.taskCount,
    avgProgress: Math.round(data.totalProgress / data.taskCount),
  }));
});

const insights = computed(() => {
  const insightsList: string[] = [];
  const { totalTasks, completedTasks, inProgressTasks, averageProgress, remainingTasks } =
    summary.value;

  if (inProgressTasks > 0) {
    insightsList.push(`${inProgressTasks} tasks are currently in progress.`);
  }

  if (averageProgress < 50 && totalTasks > 0) {
    insightsList.push('Average progress is below 50%. Consider focusing on completing tasks.');
  }

  if (completedTasks === 0 && totalTasks > 0) {
    insightsList.push('No tasks completed yet. Start by finishing at least one task.');
  }

  if (totalTasks > 5) {
    insightsList.push(
      `You have ${totalTasks} tasks. Consider prioritizing the most important ones.`,
    );
  }

  const notStarted = dailyTasks.value.filter((t) => t.status === 'Not Started').length;
  if (notStarted > 0) {
    insightsList.push(`${notStarted} tasks haven't been started yet.`);
  }

  if (remainingTasks > 0) {
    insightsList.push(`${remainingTasks} tasks remain to be completed.`);
  }

  const onHold = dailyTasks.value.filter((t) => t.status === 'On Hold').length;
  if (onHold > 0) {
    insightsList.push(`${onHold} tasks are on hold. Review and update their status.`);
  }

  // Project-specific insights
  if (projectSummary.value.length > 0) {
    const slowProjects = projectSummary.value.filter((p) => p.avgProgress < 50);
    if (slowProjects.length > 0) {
      insightsList.push(`${slowProjects.length} project(s) have average progress below 50%.`);
    }
  }

  return insightsList;
});

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    Completed: 'green',
    'In Progress': 'blue',
    'Not Started': 'grey',
    'On Hold': 'orange',
  };
  return colors[status] || 'grey';
}

function editTask(task: DailyTask) {
  editingTask.value = task;
  newTask.value = {
    title: task.title || '',
    description: task.description || '',
    date: task.date,
    progress: task.progress,
    status: task.status || 'Not Started',
    project_name: task.project_name || '',
  };
  showAddDialog.value = true;
}

async function saveTask() {
  if (!newTask.value.title || !newTask.value.date || !user?.id) return;

  loading.value = true;
  try {
    if (editingTask.value) {
      // Update existing task
      const response = await fetch(
        `http://localhost:3001/api/employee/daily-tracker/${editingTask.value.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTask.value.title,
            description: newTask.value.description,
            date: newTask.value.date,
            progress: newTask.value.progress,
            status: newTask.value.status,
            project_name: newTask.value.project_name,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        await fetchDailyTasks();
      }
    } else {
      // Add new task
      const response = await fetch('http://localhost:3001/api/employee/daily-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.id,
          title: newTask.value.title,
          description: newTask.value.description,
          date: newTask.value.date,
          progress: newTask.value.progress,
          status: newTask.value.status,
          project_name: newTask.value.project_name,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchDailyTasks();
      }
    }

    showAddDialog.value = false;
    editingTask.value = null;
    resetForm();
  } catch (error) {
    console.error('Error saving task:', error);
  } finally {
    loading.value = false;
  }
}

async function deleteTask(id: number) {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3001/api/employee/daily-tracker/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (result.success) {
      await fetchDailyTasks();
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  newTask.value = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    progress: 0,
    status: 'Not Started',
    project_name: '',
  };
}

onMounted(() => {
  fetchDailyTasks();
  fetchProjects();
});
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
