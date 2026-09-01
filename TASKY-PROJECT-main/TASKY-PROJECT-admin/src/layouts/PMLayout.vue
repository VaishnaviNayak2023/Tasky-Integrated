<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="260"
      class="text-white q-pa-md flex column"
      style="background-color: #1a1a27; border-radius: 0 32px 32px 0"
    >
      <!-- Logo -->
      <div class="row items-center q-mb-xl q-pl-sm q-pt-md">
        <q-icon name="o_task_alt" size="32px" class="q-mr-sm" />
        <div class="text-h5 text-weight-bold">Tasky</div>
      </div>

      <!-- Navigation -->
      <q-list class="q-gutter-y-sm" padding>
        <q-item
          clickable
          v-ripple
          exact
          to="/dashboard"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="grid_view" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/dashboard/projects"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_folder" />
          </q-item-section>
          <q-item-section>Projects</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/dashboard/tasks"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_check_circle" />
          </q-item-section>
          <q-item-section>Tasks</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/dashboard/resources"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_people" />
          </q-item-section>
          <q-item-section>Resources</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/dashboard/analytics"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_bar_chart" />
          </q-item-section>
          <q-item-section>Analytics</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/dashboard/calendar"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_calendar_today" />
          </q-item-section>
          <q-item-section>Calendar</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/dashboard/organisation"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_domain" />
          </q-item-section>
          <q-item-section>Organisation</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="navigateToEmployeeDashboard"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_people" />
          </q-item-section>
          <q-item-section>Employee Dashboard</q-item-section>
        </q-item>
      </q-list>

      <q-space />

      <!-- Bottom Navigation -->
      <q-list class="q-gutter-y-sm" padding>
        <q-item
          clickable
          v-ripple
          to="/dashboard/notifications"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
        >
          <q-item-section avatar>
            <q-icon name="o_notifications" />
          </q-item-section>
          <q-item-section>Notifications</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="handleLogout" class="nav-item rounded-borders">
          <q-item-section avatar>
            <q-icon name="o_logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const leftDrawerOpen = ref(true);

function handleLogout() {
  // Clear authentication data from localStorage
  localStorage.removeItem('tasky_user');
  localStorage.removeItem('tasky_token');
  localStorage.removeItem('pm_auth_token');
  localStorage.removeItem('pm_user_data');

  // Redirect to login page in same project
  router.push('/auth/login');
}

function navigateToEmployeeDashboard() {
  // Navigate to employee dashboard within the same project
  router.push('/employee/dashboard');
}
</script>

<style scoped>
.nav-item {
  color: #bdbdbd;
}
.q-item.q-router-link--active,
.q-item--active {
  background-color: #d8f760;
  color: #000 !important;
}
.bg-lime-13 {
  background-color: #d8f760 !important;
}
</style>
