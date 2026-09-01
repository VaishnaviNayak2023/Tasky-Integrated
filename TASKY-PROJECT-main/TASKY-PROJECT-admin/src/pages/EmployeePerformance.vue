<template>
  <q-page class="bg-grey-1 q-pa-lg">
    <!-- HEADER -->

    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">My Performance</div>

        <div class="text-body1 text-grey-6">Your personal work trends and progress</div>
      </div>

      <q-select
        v-model="period"
        :options="['This Week', 'This Month', 'Last 3 Months']"
        outlined
        dense
        style="width: 180px"
      />
    </div>

    <!-- ================= PERSONAL SUMMARY ================= -->

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="stat in personalStats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-lg">
          <div class="row items-center justify-between">
            <q-avatar size="44px" :class="stat.bg">
              <q-icon :name="stat.icon" :color="stat.color" />
            </q-avatar>

            <div class="text-h4 text-weight-bold" :class="stat.text">
              {{ stat.value }}
            </div>
          </div>

          <div class="text-body1 text-weight-medium q-mt-md">
            {{ stat.label }}
          </div>

          <div class="text-caption text-grey-6">
            {{ stat.subtitle }}
          </div>
        </q-card>
      </div>
    </div>

    <!-- ================= MAIN CHARTS ================= -->

    <div class="row q-col-gutter-md">
      <!-- COMPLETION TREND -->

      <div class="col-12 col-lg-8">
        <q-card flat bordered class="q-pa-lg">
          <div class="row justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Task Completion Trend</div>

              <div class="text-body2 text-grey-6">Tasks completed by you</div>
            </div>

            <q-badge color="positive" class="q-pa-sm"> {{ completionRate }}% completion </q-badge>
          </div>

          <div class="chart-area q-mt-xl">
            <div v-for="item in completionData" :key="item.day" class="chart-column">
              <div class="chart-value">
                {{ item.completed }}
              </div>

              <div class="chart-bars">
                <div
                  class="chart-bar"
                  :style="{
                    height: `${item.assigned * 15}px`,
                  }"
                />

                <div
                  class="chart-bar completed-bar"
                  :style="{
                    height: `${item.completed * 15}px`,
                  }"
                />
              </div>

              <div class="text-caption text-grey-6 q-mt-sm">
                {{ item.day }}
              </div>
            </div>
          </div>

          <div class="row justify-center q-gutter-lg q-mt-md">
            <div class="row items-center q-gutter-xs">
              <div class="legend-box assigned" />
              <span class="text-caption"> Assigned </span>
            </div>

            <div class="row items-center q-gutter-xs">
              <div class="legend-box completed" />
              <span class="text-caption"> Completed </span>
            </div>
          </div>
        </q-card>
      </div>

      <!-- ON TIME -->

      <div class="col-12 col-lg-4">
        <q-card flat bordered class="q-pa-lg full-height">
          <div class="text-h6 text-weight-bold">Completion Reliability</div>

          <div class="text-body2 text-grey-6 q-mt-xs">Your on-time completion pattern</div>

          <div class="donut-wrapper q-mt-xl">
            <div
              class="donut"
              :style="{
                background: `conic-gradient(
                  #7c4dff ${onTimeRate}%,
                  #edf0f5 ${onTimeRate}% 100%
                )`,
              }"
            >
              <div class="donut-center">
                <div class="text-h5 text-weight-bold">{{ onTimeRate }}%</div>

                <div class="text-caption text-grey-6">On time</div>
              </div>
            </div>
          </div>

          <div class="q-mt-xl">
            <div class="row justify-between q-mb-md">
              <span> On time </span>

              <strong class="text-positive">
                {{ onTimeTasks }}
              </strong>
            </div>

            <div class="row justify-between">
              <span> Delayed </span>

              <strong class="text-negative">
                {{ delayedTasks }}
              </strong>
            </div>
          </div>
        </q-card>
      </div>

      <!-- WORKLOAD TREND -->

      <div class="col-12 col-lg-7">
        <q-card flat bordered class="q-pa-lg">
          <div class="text-h6 text-weight-bold">My Workload Trend</div>

          <div class="text-body2 text-grey-6">How your workload has changed</div>

          <div class="workload-chart q-mt-xl">
            <div v-for="item in workloadData" :key="item.week" class="workload-item">
              <div
                class="workload-fill"
                :style="{
                  width: `${item.value}%`,
                }"
              />

              <span>
                {{ item.week }}
              </span>

              <strong> {{ item.value }}% </strong>
            </div>
          </div>
        </q-card>
      </div>

      <!-- PROJECT CONTRIBUTION -->

      <div class="col-12 col-lg-5">
        <q-card flat bordered class="q-pa-lg">
          <div class="text-h6 text-weight-bold">My Project Contribution</div>

          <div class="text-body2 text-grey-6">Where your completed work is focused</div>

          <div v-for="project in projectData" :key="project.name" class="q-mt-lg">
            <div class="row justify-between q-mb-xs">
              <span class="text-body2">
                {{ project.name }}
              </span>

              <strong> {{ project.value }}% </strong>
            </div>

            <q-linear-progress
              :value="project.value / 100"
              rounded
              size="9px"
              color="deep-purple"
              track-color="grey-3"
            />
          </div>
        </q-card>
      </div>

      <!-- PRIORITY -->

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Priority Handling</div>

          <div class="text-body2 text-grey-6">How you handled different priorities</div>

          <div v-for="priority in priorityData" :key="priority.name" class="q-mt-lg">
            <div class="row items-center">
              <q-badge :color="priority.color" class="q-mr-md">
                {{ priority.name }}
              </q-badge>

              <div class="col">
                <q-linear-progress
                  :value="priority.rate / 100"
                  rounded
                  size="8px"
                  :color="priority.color"
                  track-color="grey-3"
                />
              </div>

              <div class="q-ml-md text-weight-bold">{{ priority.rate }}%</div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- EFFORT -->

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-lg">
          <div class="text-h6 text-weight-bold">Effort Accuracy</div>

          <div class="text-body2 text-grey-6">Estimated vs actual effort</div>

          <div v-for="task in effortData" :key="task.name" class="q-mt-lg">
            <div class="row justify-between">
              <span class="text-body2">
                {{ task.name }}
              </span>

              <span class="text-caption text-grey-6">
                {{ task.actual }}h / {{ task.estimated }}h
              </span>
            </div>

            <q-linear-progress
              :value="Math.min(task.actual / task.estimated, 1)"
              rounded
              size="8px"
              color="deep-purple"
              track-color="grey-3"
              class="q-mt-xs"
            />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const period = ref('This Month');
const authStore = useAuthStore();
const loading = ref(false);
const myTasks = ref<any[]>([]);
const reviewHistory = ref<any[]>([]);
const workLogs = ref<any[]>([]);

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

    const historyResponse = await fetch(
      `http://localhost:3001/api/employee/reviews/history?user_id=${authStore.user.id}`,
    );
    const historyData = await historyResponse.json();
    if (historyData.success) {
      reviewHistory.value = historyData.reviews;
    }

    const logsResponse = await fetch(
      `http://localhost:3001/api/employee/work-logs/${authStore.user.id}`,
    );
    const logsData = await logsResponse.json();
    if (logsData.success) {
      workLogs.value = logsData.logs || [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

const completionData = computed(() => {
  const completedTasks = myTasks.value.filter((t) => t.status === 'completed');
  const totalTasks = myTasks.value.length;

  if (period.value === 'This Week') {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const recentTasks = myTasks.value.filter((t) => {
      const taskDate = new Date(t.created_at);
      return taskDate >= weekAgo;
    });

    const recentCompleted = recentTasks.filter((t) => t.status === 'completed');

    return [
      {
        day: 'Mon',
        assigned: Math.ceil(recentTasks.length / 5),
        completed: Math.ceil(recentCompleted.length / 5),
      },
      {
        day: 'Tue',
        assigned: Math.ceil(recentTasks.length / 5),
        completed: Math.ceil(recentCompleted.length / 5),
      },
      {
        day: 'Wed',
        assigned: Math.ceil(recentTasks.length / 5),
        completed: Math.ceil(recentCompleted.length / 5),
      },
      {
        day: 'Thu',
        assigned: Math.ceil(recentTasks.length / 5),
        completed: Math.ceil(recentCompleted.length / 5),
      },
      {
        day: 'Fri',
        assigned: Math.ceil(recentTasks.length / 5),
        completed: Math.ceil(recentCompleted.length / 5),
      },
    ];
  }

  if (period.value === 'Last 3 Months') {
    return [
      {
        day: 'May',
        assigned: Math.ceil(totalTasks / 4),
        completed: Math.ceil(completedTasks.length / 4),
      },
      {
        day: 'Jun',
        assigned: Math.ceil(totalTasks / 4),
        completed: Math.ceil(completedTasks.length / 4),
      },
      {
        day: 'Jul',
        assigned: Math.ceil(totalTasks / 4),
        completed: Math.ceil(completedTasks.length / 4),
      },
      {
        day: 'Aug',
        assigned: Math.ceil(totalTasks / 4),
        completed: Math.ceil(completedTasks.length / 4),
      },
    ];
  }

  return [
    {
      day: 'W1',
      assigned: Math.ceil(totalTasks / 4),
      completed: Math.ceil(completedTasks.length / 4),
    },
    {
      day: 'W2',
      assigned: Math.ceil(totalTasks / 4),
      completed: Math.ceil(completedTasks.length / 4),
    },
    {
      day: 'W3',
      assigned: Math.ceil(totalTasks / 4),
      completed: Math.ceil(completedTasks.length / 4),
    },
    {
      day: 'W4',
      assigned: Math.ceil(totalTasks / 4),
      completed: Math.ceil(completedTasks.length / 4),
    },
  ];
});

const completionRate = computed(() => {
  const assigned = completionData.value.reduce((sum, item) => sum + item.assigned, 0);

  const completed = completionData.value.reduce((sum, item) => sum + item.completed, 0);

  return Math.round((completed / assigned) * 100);
});

const personalStats = computed(() => [
  {
    label: 'Tasks Completed',
    value: completionData.value.reduce((sum, item) => sum + item.completed, 0),
    subtitle: period.value,
    icon: 'check_circle',
    color: 'positive',
    text: 'text-positive',
    bg: 'bg-green-1',
  },

  {
    label: 'Completion Rate',
    value: `${completionRate.value}%`,
    subtitle: 'Of assigned tasks',
    icon: 'trending_up',
    color: 'deep-purple',
    text: 'text-deep-purple',
    bg: 'bg-deep-purple-1',
  },

  {
    label: 'On-Time Rate',
    value: '87%',
    subtitle: 'Completed on schedule',
    icon: 'schedule',
    color: 'blue',
    text: 'text-blue',
    bg: 'bg-blue-1',
  },

  {
    label: 'Update Streak',
    value: '5',
    subtitle: 'Days in a row',
    icon: 'local_fire_department',
    color: 'orange',
    text: 'text-orange',
    bg: 'bg-orange-1',
  },
]);

const onTimeRate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedTasks = myTasks.value.filter((t) => t.status === 'completed');
  if (completedTasks.length === 0) return 0;

  const onTime = completedTasks.filter((t) => {
    if (!t.deadline) return true;
    const deadline = new Date(t.deadline);
    const completedAt = new Date(t.completed_at || t.updated_at);
    return completedAt <= deadline;
  }).length;

  return Math.round((onTime / completedTasks.length) * 100);
});

const onTimeTasks = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedTasks = myTasks.value.filter((t) => t.status === 'completed');
  return completedTasks.filter((t) => {
    if (!t.deadline) return true;
    const deadline = new Date(t.deadline);
    const completedAt = new Date(t.completed_at || t.updated_at);
    return completedAt <= deadline;
  }).length;
});

const delayedTasks = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedTasks = myTasks.value.filter((t) => t.status === 'completed');
  return completedTasks.filter((t) => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    const completedAt = new Date(t.completed_at || t.updated_at);
    return completedAt > deadline;
  }).length;
});

const workloadData = computed(() => {
  const totalEffort = myTasks.value.reduce((sum, t) => sum + (t.expected_effort || 0), 0);
  const avgEffort = totalEffort / (myTasks.value.length || 1);

  return [
    { week: 'Week 1', value: Math.min(Math.round(avgEffort * 5), 100) },
    { week: 'Week 2', value: Math.min(Math.round(avgEffort * 7), 100) },
    { week: 'Week 3', value: Math.min(Math.round(avgEffort * 6), 100) },
    { week: 'Week 4', value: Math.min(Math.round(avgEffort * 8), 100) },
    { week: 'Current', value: Math.min(Math.round(avgEffort * 7), 100) },
  ];
});

const projectData = computed(() => {
  const projectCounts: Record<string, number> = {};
  myTasks.value.forEach((t) => {
    const projectName = t.project_name || 'Unknown';
    projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
  });

  const total = myTasks.value.length || 1;
  return Object.entries(projectCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
  }));
});

const priorityData = computed(() => {
  const priorityCounts: Record<string, { total: number; completed: number }> = {
    critical: { total: 0, completed: 0 },
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 },
  };

  myTasks.value.forEach((t) => {
    const priority = t.priority?.toLowerCase() || 'medium';
    if (priorityCounts[priority]) {
      priorityCounts[priority].total++;
      if (t.status === 'completed') {
        priorityCounts[priority].completed++;
      }
    }
  });

  return [
    {
      name: 'Critical',
      rate: priorityCounts.critical?.total
        ? Math.round((priorityCounts.critical.completed / priorityCounts.critical.total) * 100)
        : 100,
      color: 'negative',
    },
    {
      name: 'High',
      rate: priorityCounts.high?.total
        ? Math.round((priorityCounts.high.completed / priorityCounts.high.total) * 100)
        : 100,
      color: 'orange',
    },
    {
      name: 'Medium',
      rate: priorityCounts.medium?.total
        ? Math.round((priorityCounts.medium.completed / priorityCounts.medium.total) * 100)
        : 100,
      color: 'blue',
    },
    {
      name: 'Low',
      rate: priorityCounts.low?.total
        ? Math.round((priorityCounts.low.completed / priorityCounts.low.total) * 100)
        : 100,
      color: 'positive',
    },
  ];
});

const effortData = computed(() => {
  const tasksWithEffort = myTasks.value.filter((t) => t.expected_effort > 0).slice(0, 4);
  return tasksWithEffort.map((t) => ({
    name: t.title,
    estimated: t.expected_effort,
    actual: t.actual_effort || t.expected_effort,
  }));
});
</script>

<style scoped>
.chart-area {
  height: 260px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  border-bottom: 1px solid #e5e7eb;
}

.chart-column {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  min-width: 45px;
}

.chart-bars {
  height: 190px;
  display: flex;
  align-items: flex-end;
  gap: 5px;
}

.chart-bar {
  width: 20px;
  background: #d9dce5;
  border-radius: 5px 5px 0 0;
}

.completed-bar {
  background: #7c4dff;
}

.chart-value {
  font-weight: 700;
  margin-bottom: 5px;
}

.legend-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.assigned {
  background: #d9dce5;
}

.completed {
  background: #7c4dff;
}

.donut-wrapper {
  display: flex;
  justify-content: center;
}

.donut {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-center {
  width: 130px;
  height: 130px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.workload-item {
  position: relative;
  height: 42px;
  background: #f0f1f5;
  border-radius: 7px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  overflow: hidden;
}

.workload-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #e3dcff;
}

.workload-item span,
.workload-item strong {
  position: relative;
  z-index: 1;
}

.workload-item strong {
  margin-left: auto;
}
</style>
