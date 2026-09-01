<template>
  <div class="bg-white q-pa-md shadow-1" style="border-radius: 12px">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-bold">Team Availability</div>
      <div
        class="text-indigo text-caption cursor-pointer text-weight-medium"
        @click="router.push('/dashboard/calendar')"
      >
        View Calendar
      </div>
    </div>

    <div v-if="resourceStore.loading" class="flex flex-center q-pa-sm">
      <q-spinner-dots size="24px" color="primary" />
    </div>

    <div v-else class="row q-gutter-x-sm q-mb-md no-wrap">
      <div class="col rounded-borders q-pa-sm" style="background-color: #f1f8f1">
        <div class="text-h5 text-weight-bold text-green">
          {{ resourceStore.availability.counts.available || 0 }}
        </div>
        <div class="text-caption text-grey-8" style="font-size: 10px">Available Now</div>
      </div>
      <div class="col rounded-borders q-pa-sm" style="background-color: #fbebeb">
        <div class="text-h5 text-weight-bold text-red">
          {{ resourceStore.availability.counts.unavailable || 0 }}
        </div>
        <div class="text-caption text-grey-8" style="font-size: 10px">Unavailable</div>
      </div>
    </div>

    <q-btn
      unelevated
      color="indigo-1"
      text-color="indigo"
      icon="o_person_add"
      label="Request Resource"
      no-caps
      class="full-width rounded-borders text-weight-bold"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useResourceStore } from '../stores/resourceStore';

const router = useRouter();
const resourceStore = useResourceStore();
</script>
