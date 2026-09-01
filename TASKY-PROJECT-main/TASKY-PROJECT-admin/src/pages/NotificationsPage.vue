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
    <div class="row items-center justify-between q-mb-lg" style="flex: 0 0 auto">
      <div class="row items-center">
        <q-avatar
          color="indigo-1"
          text-color="indigo"
          icon="notifications"
          size="48px"
          class="q-mr-md"
          style="border-radius: 12px"
        />
        <div class="column">
          <div class="text-h5 text-weight-bold">Notifications Center</div>
          <div class="text-grey-7 text-caption">System alerts and daily updates</div>
        </div>
      </div>
      <q-btn
        unelevated
        outline
        color="indigo"
        icon="done_all"
        label="Mark all as read"
        no-caps
        class="rounded-borders bg-white"
        @click="markAllAsRead"
        :loading="notificationStore.loading"
      />
    </div>

    <!-- Feed -->
    <q-card
      flat
      bordered
      class="bg-white"
      style="flex: 1 1 0; display: flex; flex-direction: column"
    >
      <div
        v-if="notificationStore.loading && notificationStore.notifications.length === 0"
        class="flex flex-center full-height"
      >
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div
        v-else-if="notificationStore.notifications.length > 0"
        style="overflow-y: auto; flex: 1 1 0"
      >
        <q-list separator>
          <q-item
            v-for="notif in notificationStore.notifications"
            :key="notif.id"
            class="q-py-md"
            :class="{ 'bg-blue-1': !notif.is_read }"
          >
            <q-item-section avatar top>
              <q-avatar
                :color="getIconColor(notif.type)"
                text-color="white"
                :icon="getIcon(notif.type)"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ notif.title }}</q-item-label>
              <q-item-label caption class="text-grey-8 q-mt-xs">{{ notif.message }}</q-item-label>

              <div v-if="!notif.is_read" class="q-mt-sm row q-gutter-sm">
                <q-btn
                  unelevated
                  color="indigo"
                  label="Mark as read"
                  size="sm"
                  no-caps
                  @click="markAsRead(notif.id)"
                />
              </div>
            </q-item-section>

            <q-item-section side top>
              <q-item-label caption>{{ formatDate(notif.created_at) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div v-else class="flex flex-center full-height text-grey-6 text-subtitle1 column">
        <q-icon name="notifications_none" size="64px" color="grey-4" class="q-mb-md" />
        You're all caught up!
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNotificationStore } from '../stores/notificationStore';
import { date } from 'quasar';

const notificationStore = useNotificationStore();

onMounted(() => {
  notificationStore.fetchNotifications();
});

const markAsRead = async (id: string | number) => {
  await notificationStore.markAsRead(id.toString());
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const formatDate = (val: string) => {
  if (!val) return '';
  const notifDate = new Date(val);
  const now = new Date();

  if (notifDate.toDateString() === now.toDateString()) {
    return date.formatDate(val, 'h:mm a');
  }
  return date.formatDate(val, 'MMM D, h:mm a');
};

const getIcon = (type: string) => {
  if (type === 'system') return 'settings';
  if (type === 'alert') return 'warning';
  if (type === 'reminder') return 'history_edu';
  if (type === 'update') return 'info';
  return 'notifications';
};

const getIconColor = (type: string) => {
  if (type === 'alert') return 'red';
  if (type === 'reminder') return 'orange';
  if (type === 'system') return 'grey';
  return 'blue';
};
</script>

<style scoped>
/* Scrollbar styling */
.q-card::-webkit-scrollbar {
  width: 6px;
}
.q-card::-webkit-scrollbar-track {
  background: transparent;
}
.q-card::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.q-card::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
