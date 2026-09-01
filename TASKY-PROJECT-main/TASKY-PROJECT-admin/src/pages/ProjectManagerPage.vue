<template>
  <q-page
    class="q-pa-md text-black"
    style="
      height: 100vh;
      max-height: 100vh;
      min-height: 0 !important;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    "
  >
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="column">
        <div class="text-h5 text-weight-bold">Command Center 👋</div>
        <div class="text-grey-7 text-caption">Overview of what needs your attention today</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          rounded
          bg-color="white"
          placeholder="Search attention items & logs..."
          style="width: 250px"
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
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar><q-icon name="logout" color="red" /></q-item-section>
                <q-item-section class="text-red">Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md" style="flex: 0 0 auto">
      <div class="col-3">
        <StatCard
          title="At Risk Projects"
          :value="dashboardStore.stats.atRiskProjects.toString()"
          color="red"
          icon="o_warning"
          caption="Needs immediate attention"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Overloaded Resources"
          :value="dashboardStore.stats.overloadedResources.toString()"
          color="orange"
          icon="o_groups"
          caption="Working across multiple projects"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Overdue Tasks"
          :value="dashboardStore.stats.overdueTasks.toString()"
          color="deep-orange"
          icon="o_schedule"
          caption="Past deadline"
        />
      </div>
      <div class="col-3">
        <StatCard
          title="Pending Reviews"
          :value="pendingReviewsCount.toString()"
          color="blue"
          icon="o_rate_review"
          caption="Tasks awaiting final review"
        />
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey-7 q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      style="flex: 0 0 auto"
    >
      <q-tab name="overview" label="Overview" icon="dashboard" />
    </q-tabs>

    <q-tab-panels
      v-model="activeTab"
      animated
      class="transparent"
      style="flex: 1 1 0; min-height: 0"
    >
      <!-- Overview Tab -->
      <q-tab-panel name="overview" class="q-pa-none">
        <div class="row q-col-gutter-md" style="height: 100%; min-height: 0">
          <!-- Needs Attention Column (Left) -->
          <div class="col-6" style="height: 100%; display: flex; flex-direction: column">
            <q-card class="full-height flex column">
              <q-card-section class="bg-red-1 text-red-9 q-pb-sm">
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <q-icon name="warning" size="24px" class="q-mr-sm" />
                    <div class="text-h6 text-weight-bold">Needs Attention</div>
                  </div>
                  <q-spinner-dots v-if="dashboardStore.loading" size="24px" />
                </div>
                <div class="text-caption">Critical items that require immediate PM action</div>
              </q-card-section>

              <q-card-section
                class="q-pt-none q-px-md q-pb-md"
                style="flex: 1 1 0; overflow-y: auto"
              >
                <q-list separator v-if="hasAttentionItems">
                  <!-- Delayed Projects -->
                  <template
                    v-for="project in filteredAttentionItems.delayedProjects"
                    :key="'proj-' + project.id"
                  >
                    <q-item class="q-py-md">
                      <q-item-section avatar>
                        <q-avatar color="red-1" text-color="red" icon="folder" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold"
                          >{{ project.name }} (Project)</q-item-label
                        >
                        <q-item-label caption
                          >Project is delayed by {{ project.days_delayed }} days.
                          {{ project.overdue_tasks }} overdue task(s).</q-item-label
                        >
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          unelevated
                          color="red"
                          label="Manage"
                          size="sm"
                          :to="`/dashboard/projects?search=${encodeURIComponent(project.name)}`"
                        />
                      </q-item-section>
                    </q-item>
                  </template>

                  <!-- Overloaded Resources -->
                  <template
                    v-for="resource in filteredAttentionItems.overloadedResources"
                    :key="'res-' + resource.id"
                  >
                    <q-item class="q-py-md">
                      <q-item-section avatar>
                        <q-avatar>
                          <img
                            :src="resource.avatar || `https://i.pravatar.cc/150?img=${resource.id}`"
                          />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold"
                          >{{ resource.first_name }} {{ resource.last_name }} ({{
                            resource.role_name
                          }})</q-item-label
                        >
                        <q-item-label caption
                          >Overloaded ({{ resource.utilization }}% capacity) across
                          {{ resource.project_count }} projects.</q-item-label
                        >
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          unelevated
                          color="orange"
                          label="Reassign"
                          size="sm"
                          :to="`/dashboard/resources?search=${encodeURIComponent(resource.employee_code)}`"
                        />
                      </q-item-section>
                    </q-item>
                  </template>

                  <!-- Overdue Tasks -->
                  <template
                    v-for="task in filteredAttentionItems.overdueTasks"
                    :key="'task-' + task.id"
                  >
                    <q-item class="q-py-md">
                      <q-item-section avatar>
                        <q-avatar color="deep-orange-1" text-color="deep-orange" icon="task" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold"
                          >{{ task.title }} (Task)</q-item-label
                        >
                        <q-item-label caption
                          >Overdue by {{ task.days_overdue }} days. Blocks
                          {{ task.blocking_count }} dependent tasks in
                          {{ task.project_name }}.</q-item-label
                        >
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          unelevated
                          outline
                          color="deep-orange"
                          label="View Task"
                          size="sm"
                          :to="`/dashboard/tasks?search=${encodeURIComponent(task.title)}`"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>

                <div v-else-if="!dashboardStore.loading" class="text-center q-pa-xl text-grey-6">
                  <q-icon name="check_circle" size="48px" class="q-mb-sm text-green-4" />
                  <div class="text-h6">All clear!</div>
                  <div>No items need your immediate attention.</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Team Members Column (Right) -->
          <div class="col-6" style="height: 100%; display: flex; flex-direction: column">
            <q-card class="full-height flex column">
              <q-card-section class="bg-green-1 text-green-9 q-pb-sm">
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <q-icon name="groups" size="24px" class="q-mr-sm" />
                    <div class="text-h6 text-weight-bold">Team Members</div>
                  </div>
                  <q-spinner-dots v-if="dashboardStore.loading" size="24px" />
                </div>
                <div class="text-caption">All users in your organization</div>
              </q-card-section>

              <q-card-section
                class="q-pt-none q-px-md q-pb-md"
                style="flex: 1 1 0; overflow-y: auto"
              >
                <q-list separator v-if="dashboardStore.users.length > 0">
                  <q-item
                    v-for="user in dashboardStore.users"
                    :key="user.id"
                    class="q-py-md cursor-pointer"
                    @click="showEmployeePerformance(user)"
                  >
                    <q-item-section avatar>
                      <q-avatar>
                        <img :src="user.avatar_url || `https://i.pravatar.cc/150?img=${user.id}`" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold"
                        >{{ user.first_name }} {{ user.last_name }}</q-item-label
                      >
                      <q-item-label caption
                        >{{ user.employee_code }} - {{ user.role_name }}</q-item-label
                      >
                      <q-item-label caption v-if="user.email" class="text-grey-7">{{
                        user.email
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge :color="user.access_level === 'manager' ? 'orange' : 'blue'">
                        {{ user.access_level === 'manager' ? 'Manager' : 'Employee' }}
                      </q-badge>
                    </q-item-section>
                  </q-item>
                </q-list>

                <div v-else-if="!dashboardStore.loading" class="text-center q-pa-xl text-grey-6">
                  <q-icon name="person_off" size="48px" class="q-mb-sm" />
                  <div class="text-h6">No users found</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Employee Performance Dialog -->
    <EmployeePerformanceReport v-model="showPerformanceDialog" :employee="selectedEmployee" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useDashboardStore } from '../stores/dashboardStore';
import StatCard from '../components/StatCard.vue';
import EmployeePerformanceReport from '../components/EmployeePerformanceReport.vue';

const router = useRouter();
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const searchQuery = ref('');
const selectedEmployee = ref<any>(null);
const showPerformanceDialog = ref(false);
const activeTab = ref('overview');

onMounted(() => {
  console.log('Project Manager Dashboard mounted');
  dashboardStore.loadAll();
  console.log('Users loaded:', dashboardStore.users);
});

const pendingReviewsCount = computed(() => 0);

const filteredAttentionItems = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const delayedProjects = dashboardStore.attentionItems.delayedProjects.filter((p: any) =>
    p.name.toLowerCase().includes(query),
  );
  const overloadedResources = dashboardStore.attentionItems.overloadedResources.filter(
    (r: any) =>
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(query) ||
      r.employee_code.toLowerCase().includes(query),
  );
  const overdueTasks = dashboardStore.attentionItems.overdueTasks.filter((t: any) =>
    t.title.toLowerCase().includes(query),
  );
  return { delayedProjects, overloadedResources, overdueTasks };
});

const hasAttentionItems = computed(
  () =>
    filteredAttentionItems.value.delayedProjects.length > 0 ||
    filteredAttentionItems.value.overloadedResources.length > 0 ||
    filteredAttentionItems.value.overdueTasks.length > 0,
);

const showEmployeePerformance = (user: any) => {
  selectedEmployee.value = user;
  showPerformanceDialog.value = true;
};

const logout = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>

<style scoped>
.z-top {
  z-index: 10;
}
.border-left-orange {
  border-left: 4px solid #ff9800;
}
</style>
