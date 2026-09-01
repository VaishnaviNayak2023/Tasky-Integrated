<template>
  <div class="bg-white q-pa-md shadow-1" style="border-radius: 12px">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-bold">Upcoming Deadline Risks</div>
      <q-btn
        flat
        dense
        no-caps
        color="grey-8"
        label="View All Tasks"
        size="12px"
        class="bg-grey-2 q-px-sm rounded-borders"
        style="font-weight: 500"
        @click="router.push('/dashboard/tasks')"
      />
    </div>

    <div v-if="analyticsStore.loading" class="flex flex-center q-pa-md">
      <q-spinner-dots size="24px" color="primary" />
    </div>

    <div
      v-else-if="analyticsStore.deadlineRisks && analyticsStore.deadlineRisks.length > 0"
      class="column q-gutter-y-md"
    >
      <div
        v-for="item in analyticsStore.deadlineRisks"
        :key="item.id"
        class="row items-center justify-between no-wrap"
      >
        <div
          class="row items-center no-wrap flex-1 cursor-pointer"
          style="min-width: 0"
          @click="router.push(`/dashboard/tasks?open=${item.id}`)"
        >
          <q-avatar
            v-if="getRiskLevel(item.days_left) === 'high'"
            color="red-1"
            text-color="red"
            icon="warning"
            size="28px"
            class="q-mr-sm"
            style="font-size: 14px"
          />
          <q-avatar
            v-else
            color="blue-1"
            text-color="blue"
            size="28px"
            class="q-mr-sm"
            style="font-size: 12px; font-weight: bold"
          >
            {{ item.project_name ? item.project_name.charAt(0).toUpperCase() : 'P' }}
          </q-avatar>
          <div class="column justify-center" style="min-width: 0">
            <div
              class="text-weight-bold text-grey-9 text-truncate"
              style="font-size: 12px; line-height: 1.2"
            >
              {{ item.title }}
            </div>
            <div
              class="text-caption text-grey-6 text-truncate"
              style="font-size: 10px; line-height: 1.2; margin-top: 2px"
            >
              {{ item.project_name }} • {{ formatDaysLeft(item.days_left) }}
            </div>
          </div>
        </div>
        <q-badge
          :color="getBadgeColor(getRiskLevel(item.days_left))"
          :text-color="getBadgeTextColor(getRiskLevel(item.days_left))"
          :label="formatRiskLevel(getRiskLevel(item.days_left))"
          class="text-weight-bold rounded-borders q-px-sm"
          style="font-size: 10px; min-width: 50px; display: flex; justify-content: center"
        />
      </div>
    </div>

    <div v-else class="text-center text-grey-6 q-pa-md text-caption">
      No upcoming deadline risks detected.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAnalyticsStore } from '../stores/analyticsStore';

const router = useRouter();
const analyticsStore = useAnalyticsStore();

const getRiskLevel = (days: number | null) => {
  if (days === null) return 'low';
  if (days < 0) return 'overdue';
  if (days <= 3) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
};

const formatRiskLevel = (level: string) => {
  if (level === 'overdue') return 'Overdue';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

const formatDaysLeft = (days: number | null) => {
  if (days === null) return 'No deadline';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  return `Due in ${days} days`;
};

const getBadgeColor = (level: string) => {
  if (level === 'overdue' || level === 'high') return 'red-1';
  if (level === 'medium') return 'orange-1';
  return 'green-1';
};

const getBadgeTextColor = (level: string) => {
  if (level === 'overdue' || level === 'high') return 'red';
  if (level === 'medium') return 'orange';
  return 'green';
};
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.flex-1 {
  flex: 1 1 0;
}
</style>
