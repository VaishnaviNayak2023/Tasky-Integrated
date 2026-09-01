<template>
  <div class="bg-white q-pa-md shadow-1 q-mb-md" style="border-radius: 12px">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-bold">Resource Conflicts</div>
      <div class="text-indigo text-caption cursor-pointer text-weight-medium">View All</div>
    </div>

    <div v-if="resourceStore.loading" class="flex flex-center q-pa-md">
      <q-spinner-dots size="24px" color="primary" />
    </div>

    <div v-else-if="resourceStore.overloadedResources.length > 0" class="column q-gutter-y-md">
      <div
        v-for="conflict in resourceStore.overloadedResources"
        :key="conflict.id"
        class="row items-start no-wrap justify-between"
      >
        <div class="row no-wrap">
          <q-icon name="warning" color="red" size="16px" class="q-mr-sm q-mt-xs" />
          <div class="column">
            <div class="text-weight-bold" style="font-size: 13px; color: #333; line-height: 1.2">
              {{ conflict.first_name }} {{ conflict.last_name }}
            </div>
            <div class="text-caption text-grey-7" style="font-size: 11px; margin-top: 2px">
              {{ conflict.estimated_hours || 0 }}h allocated • {{ conflict.utilization || 0 }}%
              utilization
            </div>
          </div>
        </div>
        <q-badge
          color="red-1"
          text-color="red"
          label="Overloaded"
          class="text-weight-bold q-ml-sm q-py-xs rounded-borders"
          style="font-size: 10px; height: fit-content"
        />
      </div>
    </div>

    <div v-else class="text-center text-grey-6 q-pa-md">
      <q-icon name="check_circle" color="green" size="24px" class="q-mb-sm" />
      <div class="text-caption">No resource conflicts detected!</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStore } from '../stores/resourceStore';

const resourceStore = useResourceStore();
</script>
