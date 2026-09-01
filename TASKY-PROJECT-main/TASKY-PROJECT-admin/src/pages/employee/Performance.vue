<template>
  <q-page class="q-pa-md text-black">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="column">
        <div class="text-h5 text-weight-bold">Performance</div>
        <div class="text-grey-7 text-caption">
          Your progress, completed tasks, and review activity
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-3">
        <StatCard
          title="Total Points"
          :value="totalPoints.toString()"
          color="purple"
          icon="o_star"
          caption="Points earned"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Tasks Completed"
          :value="tasksCompleted.toString()"
          color="green"
          icon="o_check_circle"
          caption="Finished tasks"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Reviews Done"
          :value="reviewsDone.toString()"
          color="blue"
          icon="o_rate_review"
          caption="Tasks reviewed"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Completion Rate"
          :value="completionRate + '%'"
          color="orange"
          icon="o_trending_up"
          caption="Task completion"
        />
      </div>
    </div>

    <!-- Performance Details -->
    <div class="row q-col-gutter-md">
      <!-- Points Breakdown -->
      <div class="col-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-weight-bold">Points Breakdown</div>
            <div class="text-caption text-grey-7">How you earned your points</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="task_alt" color="green" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Task Owner Points</q-item-label>
                  <q-item-label caption>Points earned when your tasks are reviewed</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-h6 text-green">+{{ ownerPoints }}</div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="rate_review" color="blue" size="24px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Reviewer Points</q-item-label>
                  <q-item-label caption>Points earned for reviewing others' tasks</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-h6 text-blue">+{{ reviewerPoints }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-weight-bold">Recent Activity</div>
            <div class="text-caption text-grey-7">Your latest reviews and completions</div>
          </q-card-section>
          <q-card-section>
            <q-list separator v-if="recentActivity.length > 0">
              <q-item v-for="activity in recentActivity" :key="activity.id" class="q-py-sm">
                <q-item-section avatar>
                  <q-icon
                    :name="activity.type === 'review' ? 'rate_review' : 'check_circle'"
                    :color="activity.type === 'review' ? 'blue' : 'green'"
                    size="20px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ activity.title }}</q-item-label>
                  <q-item-label caption>{{ formatDate(activity.date) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    v-if="activity.points"
                    color="green"
                    label="+{{ activity.points }} pts"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="history" size="48px" class="q-mb-sm" />
              <div class="text-h6">No recent activity</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Task Statistics -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 text-weight-bold">Task Statistics</div>
        <div class="text-caption text-grey-7">Your task completion breakdown</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-3">
            <div class="text-center">
              <div class="text-h4 text-grey">{{ myTasks.length }}</div>
              <div class="text-caption text-grey-7">Total Tasks</div>
            </div>
          </div>
          <div class="col-3">
            <div class="text-center">
              <div class="text-h4 text-green">{{ tasksCompleted }}</div>
              <div class="text-caption text-grey-7">Completed</div>
            </div>
          </div>
          <div class="col-3">
            <div class="text-center">
              <div class="text-h4 text-blue">{{ tasksInProgress }}</div>
              <div class="text-caption text-grey-7">In Progress</div>
            </div>
          </div>
          <div class="col-3">
            <div class="text-center">
              <div class="text-h4 text-red">{{ tasksOverdue }}</div>
              <div class="text-caption text-grey-7">Overdue</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import StatCard from '../../components/StatCard.vue';

defineOptions({
  name: 'EmployeePerformance',
});

const authStore = useAuthStore();

const loading = ref(false);
const myTasks = ref<any[]>([]);
const reviewHistory = ref<any[]>([]);

const totalPoints = computed(() => {
  return reviewHistory.value.reduce(
    (acc: number, r: any) => acc + (r.task_owner_points || 0) + (r.reviewer_points || 0),
    0,
  );
});

const ownerPoints = computed(() => {
  return reviewHistory.value.reduce((acc: number, r: any) => acc + (r.task_owner_points || 0), 0);
});

const reviewerPoints = computed(() => {
  return reviewHistory.value.reduce((acc: number, r: any) => acc + (r.reviewer_points || 0), 0);
});

const tasksCompleted = computed(() => {
  return myTasks.value.filter((t: any) => t.status === 'completed').length;
});

const tasksInProgress = computed(() => {
  return myTasks.value.filter((t: any) => t.status === 'in-progress').length;
});

const tasksOverdue = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return myTasks.value.filter((t: any) => {
    if (!t.deadline || t.status === 'completed') return false;
    const deadline = new Date(t.deadline);
    return deadline < today;
  }).length;
});

const completionRate = computed(() => {
  if (myTasks.value.length === 0) return 0;
  return Math.round((tasksCompleted.value / myTasks.value.length) * 100);
});

const reviewsDone = computed(() => {
  return reviewHistory.value.filter(
    (r: any) => r.status === 'review-done' || r.status === 'finalized',
  ).length;
});

const recentActivity = computed(() => {
  const activities: any[] = [];

  reviewHistory.value.forEach((r: any) => {
    if (r.reviewer_points > 0) {
      activities.push({
        id: `review-${r.id}`,
        type: 'review',
        title: `Reviewed: ${r.title}`,
        date: r.reviewed_at || r.submitted_at,
        points: r.reviewer_points,
      });
    }
    if (r.task_owner_points > 0) {
      activities.push({
        id: `owner-${r.id}`,
        type: 'completion',
        title: `Task Completed: ${r.title}`,
        date: r.submitted_at,
        points: r.task_owner_points,
      });
    }
  });

  return activities
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
});

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
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(date: string) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>
