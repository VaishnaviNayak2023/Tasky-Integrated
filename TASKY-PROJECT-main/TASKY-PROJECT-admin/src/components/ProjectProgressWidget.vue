<template>
  <div class="bg-white q-pa-md shadow-1 q-mb-md" style="border-radius: 12px">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-subtitle1 text-weight-bold">Project Progress</div>
      <q-btn
        flat
        dense
        no-caps
        color="grey-8"
        label="View All"
        size="12px"
        class="bg-grey-2 q-px-sm rounded-borders"
        style="font-weight: 500"
        @click="router.push('/dashboard/projects')"
      />
    </div>

    <div v-if="analyticsStore.loading" class="flex flex-center q-pa-md">
      <q-spinner-dots size="24px" color="primary" />
    </div>

    <div
      v-else-if="analyticsStore.projectProgress && analyticsStore.projectProgress.length > 0"
      class="column q-gutter-y-lg"
    >
      <div
        v-for="project in analyticsStore.projectProgress"
        :key="project.id"
        class="row items-center no-wrap justify-between"
      >
        <div class="row items-center no-wrap" style="width: 250px">
          <q-avatar
            :color="project.color || 'primary'"
            text-color="white"
            size="24px"
            class="q-mr-md cursor-pointer"
            style="font-weight: bold; font-size: 11px"
            @click="router.push(`/dashboard/projects?open=${project.id}`)"
          >
            {{ project.name.charAt(0).toUpperCase() }}
          </q-avatar>
          <div
            class="text-weight-bold text-grey-9 text-truncate cursor-pointer"
            style="font-size: 13px"
            @click="router.push(`/dashboard/projects?open=${project.id}`)"
          >
            {{ project.name }}
          </div>
        </div>

        <div class="flex-1 q-px-md">
          <q-linear-progress
            :value="(project.progress || 0) / 100"
            :color="getBarColor(project.progress)"
            size="4px"
            class="rounded-borders"
          />
        </div>

        <div class="row items-center no-wrap justify-end" style="width: 120px">
          <div class="text-weight-bold q-mr-md" style="font-size: 14px">
            {{ project.progress || 0 }}%
          </div>
          <div class="text-caption text-grey-6" style="font-size: 11px">
            {{ project.completed_tasks || 0 }} / {{ project.total_tasks || 0 }} tasks
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-grey-6 q-pa-md text-caption">No projects available.</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAnalyticsStore } from '../stores/analyticsStore';

const router = useRouter();
const analyticsStore = useAnalyticsStore();

const getBarColor = (progress: number) => {
  const p = progress || 0;
  if (p === 100) return 'green';
  if (p >= 50) return 'blue';
  if (p > 0) return 'orange';
  return 'grey-4';
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
