<template>
  <q-page class="q-pa-md" style="background-color: #f8f9fa">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-avatar color="indigo-1" text-color="indigo" icon="o_groups" size="48px" class="q-mr-md" />
        <div>
          <div class="text-h5 text-weight-bold">Resources & Workload</div>
          <div class="text-grey-7 text-caption">Monitor team capacity and workload</div>
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn flat color="indigo" label="Refresh" @click="fetchEmployees" :loading="loading" />
        <q-btn
          unelevated
          color="purple"
          icon="auto_awesome"
          label="Smart Rebalance"
          @click="analyzeRebalance"
          :loading="analyzing"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-1 q-pa-md rounded-borders q-mb-md">
      <div class="text-red text-weight-bold">Error loading resources</div>
      <div class="text-red-8">{{ error }}</div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- Employee List -->
    <div v-else-if="employees.length > 0">
      <q-table
        :rows="employees"
        :columns="columns"
        row-key="id"
        flat
        bordered
        class="bg-white"
        @row-click="openResourceDetail"
      >
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="32px" class="q-mr-sm">
                <img :src="props.row.avatar_url || `https://i.pravatar.cc/150?img=${props.row.id}`" />
              </q-avatar>
              <div>
                <div class="text-weight-bold">{{ props.row.first_name }} {{ props.row.last_name }}</div>
                <div class="text-caption text-grey-7">{{ props.row.employee_code }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-utilization="props">
          <q-td :props="props">
            <div class="text-weight-bold" :class="getUtilizationColor(props.row.utilization)">
              {{ props.row.utilization }}%
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.workload_status)">
              {{ formatStatus(props.row.workload_status) }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-center  q-pa-xl text-grey-6">
      <div class="text-center">
        <q-icon name="person_off" size="64px" color="grey-4" class="q-mb-md" />
        <div class="text-h6">No resources found</div>
      </div>
    </div>

    <!-- Resource Detail Dialog -->
    <ResourceDetailDialog
      v-model="showResourceDialog"
      :resource-id="selectedResourceId"
    />

    <!-- Smart Rebalance Dialog -->
    <q-dialog v-model="showRebalanceDialog" persistent>
      <q-card style="width: 700px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-purple-1 text-purple-9">
          <div class="text-h6 text-weight-bold">✨ Smart Rebalance Proposals</div>
          <div class="text-caption">
            {{ rebalanceSummary?.overloadedCount || 0 }} overloaded employees • 
            {{ rebalanceSummary?.proposalsCount || 0 }} task moves proposed
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none" style="max-height: 400px; overflow-y: auto">
          <div v-if="rebalanceProposals.length === 0" class="text-grey-6 text-center q-pa-md">
            No rebalancing proposals needed. All employees are within capacity.
          </div>
          <q-list v-else separator>
            <q-item v-for="(proposal, index) in rebalanceProposals" :key="index">
              <q-item-section avatar>
                <q-icon name="arrow_forward" color="purple" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ proposal.taskTitle }}</q-item-label>
                <q-item-label caption class="row items-center q-mt-xs">
                  <span class="q-mr-sm">{{ proposal.project }}</span>
                  <q-badge :color="getPriorityColor(proposal.taskPriority)" :label="proposal.taskPriority" style="font-size: 10px" />
                  <span>• {{ proposal.taskHours }}h</span>
                </q-item-label>
                <q-item-label caption class="row items-center q-mt-xs text-grey-7">
                  <span class="text-red">{{ proposal.fromEmployee.name }} ({{ proposal.fromEmployee.currentUtilization }}%)</span>
                  <q-icon name="arrow_forward" size="16px" class="q-mx-xs" />
                  <span class="text-green">{{ proposal.toEmployee.name }} ({{ proposal.toEmployee.currentUtilization }}% → {{ proposal.newUtilization }}%)</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="rebalanceSummary?.skippedCount > 0" class="q-mt-md bg-orange-1 q-pa-sm rounded-borders">
            <div class="text-caption text-orange-8">
              <q-icon name="info" class="q-mr-xs" />
              {{ rebalanceSummary.skippedCount }} tasks skipped (too much progress to reassign safely)
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Apply Rebalancing"
            color="purple"
            :disable="rebalanceProposals.length === 0"
            :loading="applyingRebalance"
            @click="applyRebalance"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ResourceDetailDialog from '../components/ResourceDetailDialog.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const employees = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showResourceDialog = ref(false);
const selectedResourceId = ref<number>(0);

// Smart rebalance state
const analyzing = ref(false);
const showRebalanceDialog = ref(false);
const rebalanceProposals = ref<any[]>([]);
const rebalanceSummary = ref<any>(null);
const applyingRebalance = ref(false);

const columns = [
  { name: 'name', label: 'Employee', field: 'first_name', align: 'left' as const, sortable: true },
  { name: 'role', label: 'Role', field: 'role_name', align: 'left' as const, sortable: true },
  { name: 'utilization', label: 'Utilization', field: 'utilization', align: 'center' as const, sortable: true },
  { name: 'tasks', label: 'Active Tasks', field: 'active_task_count', align: 'center' as const, sortable: true },
  { name: 'hours', label: 'Weekly Hours', field: 'weekly_required_hours', align: 'center' as const, sortable: true },
  { name: 'status', label: 'Status', field: 'workload_status', align: 'center' as const, sortable: true },
];

const fetchEmployees = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3001/api/pm/resources');
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.success) {
      employees.value = data.resources;
      console.log('Employees loaded:', employees.value.length);
    } else {
      error.value = data.error || 'Failed to load resources';
    }
  } catch (err: any) {
    error.value = err.message || 'Network error';
    console.error('Fetch error:', err);
  } finally {
    loading.value = false;
  }
};

const getUtilizationColor = (utilization: number) => {
  if (utilization >= 100) return 'text-red';
  if (utilization >= 85) return 'text-orange';
  if (utilization < 50) return 'text-blue';
  return 'text-green';
};

const getStatusColor = (status: string) => {
  if (status === 'overloaded') return 'red';
  return 'green';
};

const getPriorityColor = (priority: string) => {
  const map: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'green',
  };
  return map[priority] || 'grey';
};

const formatStatus = (status: string) => {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Normal';
};

const openResourceDetail = (evt: any, row: any) => {
  console.log('Opening resource detail for:', row);
  selectedResourceId.value = row.id;
  showResourceDialog.value = true;
  console.log('Dialog should open now, showResourceDialog:', showResourceDialog.value);
};

const analyzeRebalance = async () => {
  analyzing.value = true;
  try {
    const response = await fetch('http://localhost:3001/api/pm/resources/rebalance/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (data.success) {
      rebalanceProposals.value = data.proposals;
      rebalanceSummary.value = data.summary;
      showRebalanceDialog.value = true;
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to analyze rebalancing',
        caption: data.error,
      });
    }
  } catch (error: any) {
    console.error('Analyze rebalance error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to analyze rebalancing',
      caption: error.message,
    });
  } finally {
    analyzing.value = false;
  }
};

const applyRebalance = async () => {
  applyingRebalance.value = true;
  try {
    const response = await fetch('http://localhost:3001/api/pm/resources/rebalance/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposals: rebalanceProposals.value }),
    });
    const data = await response.json();
    if (data.success) {
      $q.notify({
        type: 'positive',
        message: data.message,
      });
      showRebalanceDialog.value = false;
      rebalanceProposals.value = [];
      rebalanceSummary.value = null;
      fetchEmployees();
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to apply rebalancing',
        caption: data.error,
      });
    }
  } catch (error: any) {
    console.error('Apply rebalance error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to apply rebalancing',
      caption: error.message,
    });
  } finally {
    applyingRebalance.value = false;
  }
};

onMounted(() => {
  fetchEmployees();
});
</script>

<style scoped>
/* Scrollbar styling for sidebar */
.col-4::-webkit-scrollbar {
  width: 6px;
}
.col-4::-webkit-scrollbar-track {
  background: transparent;
}
.col-4::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.col-4::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
