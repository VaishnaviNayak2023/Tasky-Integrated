<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">Daily Work Log</div>
      <q-btn color="primary" icon="add" label="New Entry" @click="showCreateLogDialog = true" />
    </div>

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
        <q-btn color="orange" label="Submit Now" @click="showCreateLogDialog = true" />
      </q-card-section>
    </q-card>

    <!-- Work Log Entries -->
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h6 text-weight-bold">My Work Log History</div>
          <q-select
            v-model="selectedTaskFilter"
            label="Filter by Task"
            :options="taskOptions"
            outlined
            dense
            clearable
            emit-value
            map-options
            style="min-width: 200px"
          />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator>
          <q-item v-for="log in filteredWorkLogs" :key="log.id">
            <q-item-section avatar>
              <q-icon
                :name="getLogStatusIcon(log.status)"
                :color="getLogStatusColor(log.status)"
                size="32px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ getTaskById(log.task_id)?.title }}</q-item-label>
              <q-item-label caption>
                {{ getProjectById(getTaskById(log.task_id)?.project_id || '')?.name }} •
                {{ log.log_date }}
              </q-item-label>
              <div class="text-caption q-mt-xs">
                <strong>Work Completed:</strong> {{ log.work_completed }}
              </div>
              <div v-if="log.remaining_work" class="text-caption">
                <strong>Remaining:</strong> {{ log.remaining_work }}
              </div>
              <div v-if="log.comments" class="text-caption text-grey-6 q-mt-xs">
                {{ log.comments }}
              </div>
            </q-item-section>
            <q-item-section side>
              <div class="column items-end">
                <q-badge :color="getLogStatusColor(log.status)" class="text-capitalize q-mb-xs">
                  {{ log.status.replace('-', ' ') }}
                </q-badge>
                <div class="text-caption">{{ log.hours_spent }}h</div>
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="filteredWorkLogs.length === 0">
            <q-item-section class="text-center text-grey-6">
              <q-icon name="edit_note" size="48px" color="grey-4" />
              <div class="text-h6 q-mt-md">No work log entries</div>
              <div class="text-caption">Start by adding your first daily update</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Create Work Log Dialog -->
    <q-dialog v-model="showCreateLogDialog">
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section>
          <div class="text-h6">Submit Daily Work Log</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit="submitWorkLog">
            <q-input
              v-model="newLog.date"
              label="Date"
              outlined
              type="date"
              class="q-mb-md"
              :rules="[(val) => !!val || 'Date is required']"
            />
            <q-select
              v-model="newLog.taskId"
              label="Task"
              :options="taskOptions"
              outlined
              emit-value
              map-options
              class="q-mb-md"
              :rules="[(val) => !!val || 'Task is required']"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar
                      :style="{
                        backgroundColor: getProjectById(
                          getTaskById(scope.opt.value)?.project_id || '',
                        )?.color,
                      }"
                      size="24px"
                      text-color="white"
                    >
                      {{
                        getProjectById(getTaskById(scope.opt.value)?.project_id || '')?.name.charAt(
                          0,
                        )
                      }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{
                      getProjectById(getTaskById(scope.opt.value)?.project_id || '')?.name
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select
              v-model="newLog.status"
              label="Status"
              :options="statusOptions"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || 'Status is required']"
            />
            <q-input
              v-model.number="newLog.hoursSpent"
              label="Hours Spent"
              outlined
              type="number"
              class="q-mb-md"
              :rules="[(val) => (!!val && val > 0) || 'Hours must be greater than 0']"
            />
            <q-input
              v-model="newLog.workCompleted"
              label="Work Completed"
              outlined
              type="textarea"
              rows="2"
              class="q-mb-md"
              :rules="[(val) => !!val || 'Please describe completed work']"
            />
            <q-input
              v-model="newLog.remainingWork"
              label="Remaining Work (optional)"
              outlined
              type="textarea"
              rows="2"
              class="q-mb-md"
            />
            <q-input
              v-model="newLog.comments"
              label="Comments/Notes (optional)"
              outlined
              type="textarea"
              rows="2"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Submit" @click="submitWorkLog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

const showCreateLogDialog = ref(false);
const selectedTaskFilter = ref<number | string | null>(null);
const loading = ref(false);

const myTasks = ref<any[]>([]);
const projects = ref<any[]>([]);
const workLogs = ref<any[]>([]);
const analytics = ref<any>(null);

const newLog = ref({
  date: new Date().toISOString().split('T')[0],
  taskId: null as number | null,
  status: 'in-progress',
  hoursSpent: 0,
  workCompleted: '',
  remainingWork: '',
  comments: '',
});

const statusOptions = ['completed', 'partially-completed', 'in-progress'];

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

    const logsResponse = await fetch(
      `http://localhost:3001/api/employee/work-logs/${authStore.user.id}`,
    );
    const logsData = await logsResponse.json();
    if (logsData.success) {
      workLogs.value = logsData.logs || [];
    }

    // Calculate analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const hasLogToday = workLogs.value.some(
      (l: any) => new Date(l.log_date).toDateString() === today.toDateString(),
    );
    const hasLogYesterday = workLogs.value.some(
      (l: any) => new Date(l.log_date).toDateString() === yesterday.toDateString(),
    );

    analytics.value = {
      dailyUpdatePending: !hasLogYesterday && !hasLogToday,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

const taskOptions = computed(() => myTasks.value.map((t) => ({ label: t.title, value: t.id })));

const filteredWorkLogs = computed(() => {
  let logs = workLogs.value;
  if (selectedTaskFilter.value) {
    logs = logs.filter((log) => log.task_id === selectedTaskFilter.value);
  }
  return logs.sort(
    (a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
  );
});

function getTaskById(id: number | string) {
  return myTasks.value.find((t: any) => t.id === id);
}

function getProjectById(id: number | string) {
  return projects.value.find((p: any) => p.id === id);
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

async function submitWorkLog() {
  if (!newLog.value.taskId || !newLog.value.date || !authStore.user?.id) return;

  try {
    const response = await fetch('http://localhost:3001/api/employee/work-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        task_id: newLog.value.taskId,
        user_id: authStore.user.id,
        log_date: newLog.value.date,
        status: newLog.value.status,
        work_completed: newLog.value.workCompleted,
        remaining_work: newLog.value.remainingWork,
        comments: newLog.value.comments,
        hours_spent: newLog.value.hoursSpent,
      }),
    });

    const data = await response.json();
    if (data.success) {
      // Update task progress based on work log status
      const task = getTaskById(newLog.value.taskId);
      if (task) {
        const progressIncrement =
          newLog.value.status === 'completed'
            ? 25
            : newLog.value.status === 'partially-completed'
              ? 10
              : 5;

        const newProgress = Math.min((task.progress || 0) + progressIncrement, 100);

        await fetch(`http://localhost:3001/api/employee/tasks/${task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : task.status,
            hours_spent: newLog.value.hoursSpent,
          }),
        });
      }

      await fetchFromDatabase();
      showCreateLogDialog.value = false;
      newLog.value = {
        date: new Date().toISOString().split('T')[0],
        taskId: null,
        status: 'in-progress',
        hoursSpent: 4,
        workCompleted: '',
        remainingWork: '',
        comments: '',
      };
    }
  } catch (error) {
    console.error('Error submitting work log:', error);
  }
}
</script>
