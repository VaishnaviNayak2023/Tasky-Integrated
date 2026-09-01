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

      <!-- User Profile -->
      <div
        class="q-mb-md q-pa-sm rounded-borders"
        style="background-color: rgba(255, 255, 255, 0.05); border-radius: 12px"
      >
        <div class="row items-center">
          <q-avatar size="40px">
            <img :src="authStore.user?.avatar || 'https://i.pravatar.cc/150?img=1'" />
          </q-avatar>
          <div class="q-ml-sm">
            <div class="text-subtitle2 text-weight-bold">
              {{ authStore.user?.firstName }} {{ authStore.user?.surname }}
            </div>
            <div class="text-caption text-grey-6">
              {{ authStore.user?.role === 'pm' ? 'Project Manager' : 'Employee' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <q-list class="q-gutter-y-sm" padding>
        <q-item
          v-for="link in navigationLinks"
          :key="link.label"
          clickable
          v-ripple
          :to="link.link"
          :active="link.link === $route.path"
          active-class="bg-lime-13 text-black"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
      </q-list>

      <q-space />

      <!-- Bottom Navigation -->
      <q-list class="q-gutter-y-sm" padding>
        <q-item
          clickable
          v-ripple
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_notifications" />
          </q-item-section>
          <q-item-section>Notifications</q-item-section>
          <q-item-section side>
            <q-badge color="lime-13" text-color="black" label="1" rounded />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
          <q-item-section avatar>
            <q-icon name="o_settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="handleLogout"
          class="nav-item rounded-borders"
          style="border-radius: 12px; font-weight: 500"
        >
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const leftDrawerOpen = ref(true);

const navigationLinks = computed(() => {
  return [
    {
      label: 'Task Manager',
      icon: 'assignment',
      link: '/employee/task-manager',
    },
    {
      label: 'Planner',
      icon: 'calendar_month',
      link: '/employee/planner',
    },
    {
      label: 'Daily Tracker',
      icon: 'track_changes',
      link: '/employee/daily-tracker',
    },
    {
      label: 'Performance',
      icon: 'bar_chart',
      link: '/employee/performance',
    },
    {
      label: 'Reviews',
      icon: 'rate_review',
      link: '/employee/reviews',
    },
  ];
});

function handleLogout() {
  // Clear authentication data from localStorage
  localStorage.removeItem('tasky_user');
  localStorage.removeItem('tasky_token');
  localStorage.removeItem('pm_auth_token');
  localStorage.removeItem('pm_user_data');

  // Clear authStore
  authStore.logout();

  $q.notify({
    type: 'positive',
    message: 'Logged out successfully',
    position: 'top',
    timeout: 2000,
  });

  // Redirect to login page
  void router.push('/auth/login');
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
