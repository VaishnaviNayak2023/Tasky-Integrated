<template>
  <div class="bg-white q-pa-md shadow-1 q-mb-md" style="border-radius: 12px">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle1 text-weight-bold">Project Performance Summary</div>
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

    <q-table
      :rows="analyticsStore.projectPerformance"
      :columns="columns"
      row-key="id"
      flat
      hide-bottom
      dense
      :loading="analyticsStore.loading"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- Project Column -->
      <template v-slot:body-cell-project="props">
        <q-td
          :props="props"
          class="cursor-pointer"
          @click="router.push(`/dashboard/projects?open=${props.row.id}`)"
        >
          <div
            class="text-weight-bold text-grey-9 text-truncate"
            style="font-size: 12px; max-width: 150px"
          >
            {{ props.row.name }}
          </div>
        </q-td>
      </template>

      <!-- Progress Column -->
      <template v-slot:body-cell-progress="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-linear-progress
              :value="(props.row.progress || 0) / 100"
              :color="getBarColor(props.row.progress)"
              size="4px"
              class="rounded-borders"
              style="width: 40px; display: inline-block; vertical-align: middle"
            />
            <span
              class="q-ml-sm text-weight-bold text-grey-8"
              style="font-size: 10px"
              v-if="props.row.progress > 0"
              >{{ props.row.progress }}%</span
            >
          </div>
        </q-td>
      </template>

      <!-- Completion Rate Column -->
      <template v-slot:body-cell-completionRate="props">
        <q-td :props="props">
          <div class="text-orange text-weight-bold" style="font-size: 12px">
            {{ props.row.completion_rate || 0 }}%
          </div>
        </q-td>
      </template>

      <!-- At Risk Column -->
      <template v-slot:body-cell-atRisk="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.at_risk_tasks > 0 ? 'red' : 'grey-4'"
            :text-color="props.row.at_risk_tasks > 0 ? 'white' : 'grey-7'"
            :label="props.row.at_risk_tasks || 0"
            class="text-weight-bold rounded-borders"
            style="
              font-size: 10px;
              min-width: 18px;
              padding: 2px 4px;
              display: inline-flex;
              justify-content: center;
            "
          />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-pa-md">
          <span class="q-ml-sm">No project performance data available.</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import type { QTableProps } from 'quasar';
import { useRouter } from 'vue-router';
import { useAnalyticsStore } from '../stores/analyticsStore';

const router = useRouter();
const analyticsStore = useAnalyticsStore();

const columns: QTableProps['columns'] = [
  { name: 'project', label: 'Project', field: 'name', align: 'left' },
  { name: 'totalTasks', label: 'Total Tasks', field: 'total_tasks', align: 'center' },
  { name: 'completed', label: 'Completed', field: 'completed_tasks', align: 'center' },
  { name: 'progress', label: 'Progress', field: 'progress', align: 'left' },
  { name: 'completionRate', label: 'Completion Rate', field: 'completion_rate', align: 'center' },
  { name: 'atRisk', label: 'At Risk', field: 'at_risk_tasks', align: 'center' },
];

const getBarColor = (progress: number) => {
  const p = progress || 0;
  if (p === 100) return 'green';
  if (p >= 50) return 'blue';
  if (p > 0) return 'orange';
  return 'grey-4';
};
</script>

<style scoped>
:deep(th) {
  font-weight: 600 !important;
  color: #757575 !important;
  font-size: 10px !important;
  border-bottom: 1px solid #f0f0f0 !important;
}
:deep(td) {
  font-size: 12px !important;
  color: #555;
  border-bottom: 1px solid #f9f9f9 !important;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
