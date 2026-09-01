<template>
  <div
    class="table-container bg-white q-pa-md shadow-1"
    :style="
      compact
        ? 'border-radius: 12px;'
        : 'height: 100%; min-height: 0; overflow: hidden; display: flex; flex-direction: column; border-radius: 12px;'
    "
  >
    <div class="row items-center justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="text-subtitle1 text-weight-bold">
        Resource Workload{{ compact ? '' : ' Overview' }}
      </div>
      <div class="row q-gutter-sm" v-if="!compact">
        <q-select
          v-model="filterMonth"
          outlined
          dense
          :options="['This Month']"
          style="width: 140px"
          bg-color="white"
          rounded
        >
          <template v-slot:prepend><q-icon name="o_calendar_today" size="18px" /></template>
        </q-select>
      </div>
      <q-btn
        v-else
        flat
        dense
        no-caps
        color="grey-8"
        label="View All"
        size="12px"
        class="bg-grey-2 q-px-sm rounded-borders"
        style="font-weight: 500"
        to="/dashboard/resources"
      />
    </div>

    <q-table
      :rows="resourceStore.resources"
      :columns="columns"
      row-key="id"
      flat
      hide-bottom
      v-model:pagination="pagination"
      @row-click="(evt, row) => openDialog(row.id)"
      :class="compact ? '' : 'full-height-table'"
      :style="compact ? '' : 'flex: 1 1 0; min-height: 0;'"
      :loading="resourceStore.loading"
      class="cursor-pointer"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- Resource Column -->
      <template v-slot:body-cell-resource="props">
        <q-td :props="props" style="width: 200px">
          <div class="row items-center no-wrap">
            <q-avatar size="32px" class="q-mr-sm">
              <img :src="props.row.avatar || `https://i.pravatar.cc/150?img=${props.row.id}`" />
            </q-avatar>
            <div class="column">
              <div class="text-weight-bold" style="font-size: 13px; color: #333">
                {{ props.row.first_name }} {{ props.row.last_name }}
              </div>
              <div class="text-caption text-grey-7" style="font-size: 11px">
                {{ formatRole(props.row.role_name) }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Role Column -->
      <template v-slot:body-cell-role="props">
        <q-td :props="props">
          <div class="text-grey-8" style="font-size: 13px">
            {{ formatRole(props.row.role_name) }}
          </div>
        </q-td>
      </template>

      <!-- Workload Column -->
      <template v-slot:body-cell-workload="props">
        <q-td :props="props" style="width: 120px">
          <div class="column">
            <div class="text-weight-bold text-grey-8 q-mb-xs" style="font-size: 12px">
              {{ Math.round(props.row.weekly_required_hours || 0) }}h /
              {{ props.row.max_hours_per_week || 40 }}h (per week)
            </div>
            <q-linear-progress
              :value="(props.row.utilization || 0) / 100"
              :color="getUtilizationColor(props.row.utilization)"
              size="3px"
              class="rounded-borders"
            />
          </div>
        </q-td>
      </template>

      <!-- Utilization Column -->
      <template v-slot:body-cell-utilization="props">
        <q-td :props="props">
          <div
            class="text-weight-bold"
            :class="`text-${getUtilizationColor(props.row.utilization)}`"
            style="font-size: 13px"
          >
            {{ props.row.utilization || 0 }}%
          </div>
        </q-td>
      </template>

      <!-- Status Column -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="`${getStatusColor(props.row.workload_status)}-1`"
            :text-color="getStatusColor(props.row.workload_status)"
            :label="formatName(props.row.workload_status)"
            class="q-px-sm q-py-xs text-weight-bold rounded-borders"
            style="font-size: 10px"
          />
        </q-td>
      </template>

      <!-- Tasks Column -->
      <template v-slot:body-cell-tasks="props">
        <q-td :props="props">
          <div class="column items-center">
            <div class="text-weight-bold text-grey-8" style="font-size: 13px">
              {{ props.row.active_task_count || 0 }}
            </div>
            <div class="text-caption text-grey-6" style="font-size: 10px">active</div>
          </div>
        </q-td>
      </template>

      <!-- Projects Column -->
      <template v-slot:body-cell-projects="props">
        <q-td :props="props">
          <div class="row items-center justify-center q-gutter-x-xs">
            <div v-if="props.row.project_count > 0" class="text-weight-bold">
              {{ props.row.project_count }} projects
            </div>
            <div v-else class="text-grey-5">-</div>
          </div>
        </q-td>
      </template>

      <!-- Empty state -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-pa-xl">
          <q-icon size="2em" name="person_off" />
          <span class="q-ml-sm">No resources found.</span>
        </div>
      </template>

      <!-- Custom Bottom / Pagination -->
      <template v-slot:bottom v-if="!compact">
        <div
          class="row items-center justify-between text-grey-7 full-width q-py-sm"
          style="font-size: 13px; border-top: 1px solid #f0f0f0"
        >
          <div>
            Showing {{ showingStart }} to {{ showingEnd }} of
            {{ resourceStore.resources.length }} resources
          </div>
          <div class="row items-center q-gutter-x-sm">
            <span>Rows per page:</span>
            <q-select
              v-model="pagination.rowsPerPage"
              outlined
              dense
              :options="[6, 10, 20]"
              class="q-mr-md bg-white"
              style="width: 70px"
              rounded
              @update:model-value="pagination.page = 1"
            />
            <q-btn
              flat
              round
              dense
              icon="chevron_left"
              :disable="pagination.page === 1"
              @click="pagination.page--"
            />
            <q-btn
              v-for="p in totalPages"
              :key="p"
              :unelevated="p === pagination.page"
              :flat="p !== pagination.page"
              round
              dense
              :color="p === pagination.page ? 'indigo-1' : ''"
              :text-color="p === pagination.page ? 'indigo' : 'grey-7'"
              :label="p"
              size="12px"
              @click="pagination.page = p"
            />
            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              :disable="pagination.page === totalPages"
              @click="pagination.page++"
            />
          </div>
        </div>
      </template>
    </q-table>

    <!-- Resource Detail Dialog -->
    <ResourceDetailDialog v-model="dialogOpen" :resource-id="selectedResourceId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QTableProps } from 'quasar';
import { useResourceStore } from '../stores/resourceStore';
import ResourceDetailDialog from './ResourceDetailDialog.vue';

const props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});

const resourceStore = useResourceStore();
const filterMonth = ref('This Month');
const dialogOpen = ref(false);
const selectedResourceId = ref(0);

const openDialog = (id: number) => {
  console.log('Opening dialog for resource ID:', id);
  selectedResourceId.value = id;
  dialogOpen.value = true;
};

const baseColumns: QTableProps['columns'] = [
  { name: 'resource', label: 'Resource', field: 'first_name', align: 'left', sortable: true },
  { name: 'role', label: 'Role', field: 'role_name', align: 'left', sortable: true },
  {
    name: 'workload',
    label: 'Workload',
    field: 'weekly_required_hours',
    align: 'left',
    sortable: true,
  },
  {
    name: 'utilization',
    label: 'Utilization',
    field: 'utilization',
    align: 'center',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'workload_status', align: 'center', sortable: true },
  { name: 'tasks', label: 'Tasks', field: 'active_task_count', align: 'center', sortable: true },
  { name: 'projects', label: 'Projects', field: 'project_count', align: 'center' },
];

const columns = computed(() => {
  if (props.compact) {
    return baseColumns.filter((c) =>
      ['resource', 'workload', 'utilization', 'status'].includes(c.name),
    );
  }
  return baseColumns;
});

const formatRole = (role: string) => {
  if (!role) return 'Employee';
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatName = (val: string) => {
  if (!val) return 'Optimal';
  return val.charAt(0).toUpperCase() + val.slice(1);
};

const getUtilizationColor = (utilization: number) => {
  const u = utilization || 0;
  if (u >= 100) return 'red';
  if (u >= 85) return 'orange';
  if (u < 50) return 'blue';
  return 'green';
};

const getStatusColor = (status: string) => {
  if (status === 'overloaded') return 'red';
  if (status === 'near-capacity') return 'orange';
  if (status === 'available') return 'green';
  if (status === 'optimal') return 'green';
  if (status === 'underutilized') return 'blue';
  return 'grey';
};

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(resourceStore.resources.length / pagination.value.rowsPerPage)),
);
const showingStart = computed(() =>
  resourceStore.resources.length === 0
    ? 0
    : (pagination.value.page - 1) * pagination.value.rowsPerPage + 1,
);
const showingEnd = computed(() =>
  Math.min(pagination.value.page * pagination.value.rowsPerPage, resourceStore.resources.length),
);
</script>

<style scoped>
:deep(.q-field--dense .q-field__bottom) {
  display: none;
}
:deep(.q-field--outlined .q-field__control) {
  padding: 0 12px;
}

/* Sticky Header Table styling */
.full-height-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.full-height-table .q-table__middle) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
:deep(.full-height-table thead tr th) {
  position: sticky;
  z-index: 1;
  background-color: #fff;
  font-weight: 600;
  color: #757575;
  border-bottom: 1px solid #f0f0f0;
}
:deep(.full-height-table thead tr:first-child th) {
  top: 0;
}
</style>
