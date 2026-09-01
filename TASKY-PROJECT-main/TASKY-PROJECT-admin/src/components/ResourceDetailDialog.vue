<template>
  <!-- Resource Detail Dialog -->
  <q-dialog
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card
      style="
        width: 800px;
        max-width: 90vw;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        max-height: 90vh;
      "
    >
      <!-- Header -->
      <div
        class="row items-center justify-between bg-grey-1 q-pa-md"
        style="border-bottom: 1px solid #e0e0e0; flex: 0 0 auto"
      >
        <div class="row items-center">
          <q-avatar size="48px" class="q-mr-md shadow-1">
            <img
              :src="
                resourceStore.currentResource?.avatar ||
                `https://i.pravatar.cc/150?img=${resourceId}`
              "
            />
          </q-avatar>
          <div class="column">
            <div class="text-h6 text-weight-bold" style="line-height: 1.2">
              {{ resourceStore.currentResource?.first_name }}
              {{ resourceStore.currentResource?.last_name }}
            </div>
            <div class="text-caption text-grey-7" style="font-size: 13px">
              {{ formatRole(resourceStore.currentResource?.role_name) }} •
              {{ resourceStore.currentResource?.employee_code }}
            </div>
          </div>
        </div>
        <q-btn icon="close" flat round dense v-close-popup />
      </div>

      <!-- Content -->
      <div class="q-pa-md" style="flex: 1 1 auto; overflow-y: auto">
        <div v-if="resourceStore.loading" class="flex flex-center q-pa-xl">
          <q-spinner-dots size="40px" color="primary" />
        </div>
        <div v-else-if="resourceStore.currentResource" class="column q-gutter-y-lg">
          <!-- Summary Stats -->
          <div class="row q-gutter-md">
            <div class="col bg-blue-1 q-pa-md rounded-borders column items-center justify-center">
              <div class="text-h5 text-weight-bold text-blue-9">
                {{ resourceStore.currentResource.tasks?.length || 0 }}
              </div>
              <div class="text-caption text-blue-8">Total Tasks</div>
            </div>
            <div class="col bg-orange-1 q-pa-md rounded-borders column items-center justify-center">
              <div class="text-h5 text-weight-bold text-orange-9">
                {{ calculateTotalHours(resourceStore.currentResource.workloadByProject) }}h
              </div>
              <div class="text-caption text-orange-8">Estimated Workload</div>
            </div>
            <div class="col bg-green-1 q-pa-md rounded-borders column items-center justify-center">
              <div class="text-h5 text-weight-bold text-green-9">
                {{ resourceStore.currentResource.max_hours_per_week || 40 }}h
              </div>
              <div class="text-caption text-green-8">Max Capacity / Week</div>
            </div>
            <div class="col bg-purple-1 q-pa-md rounded-borders column items-center justify-center">
              <div class="text-h5 text-weight-bold text-purple-9">
                {{ Math.round(resourceStore.currentResource.utilization || 0) }}%
              </div>
              <div class="text-caption text-purple-8">Utilization</div>
            </div>
          </div>

          <!-- Active Tasks Section -->
          <div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm row items-center justify-between">
              <div class="row items-center">
                <q-icon name="list_alt" color="grey-7" size="20px" class="q-mr-xs" />
                Assigned Tasks
              </div>
              <q-btn
                unelevated
                color="indigo-5"
                icon="add"
                label="Assign Task"
                size="sm"
                no-caps
                @click="showAssignTaskDialog = true"
              />
            </div>
            <template v-if="!resourceStore.currentResource.tasks || resourceStore.currentResource.tasks.length === 0">
              <div class="text-grey-6 bg-grey-1 q-pa-md rounded-borders text-center">
                No active tasks assigned to this resource.
              </div>
            </template>
            <template v-else>
              <q-list
                separator
                class="bg-white rounded-borders"
                style="border: 1px solid #e0e0e0"
              >
                <q-expansion-item
                  v-for="task in resourceStore.currentResource.tasks"
                  :key="task.id"
                  class="q-py-sm"
                  header-class="q-py-md"
                  expand-icon="expand_more"
                  expanded-icon="expand_less"
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-avatar
                        :color="task.project_color || 'indigo'"
                        text-color="white"
                        size="32px"
                        class="q-mr-sm"
                      >
                        {{ task.project_name?.charAt(0) || 'P' }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ task.title }}</q-item-label>
                      <q-item-label caption class="row items-center q-mt-xs">
                        <span class="q-mr-sm">{{ task.project_name }}</span>
                        <q-badge
                          :color="getStatusColor(task.status)"
                          :label="task.status"
                          class="q-mr-sm"
                          style="font-size: 10px"
                        />
                        <span>• {{ task.expected_effort || 0 }}h</span>
                      </q-item-label>
                      <q-item-label caption class="row items-center q-mt-xs">
                        <span class="q-mr-sm">Deadline: {{ formatDate(task.deadline) }}</span>
                        <span>• Progress: {{ task.progress || 0 }}%</span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge
                        :color="getPriorityColor(task.priority)"
                        :label="task.priority"
                        class="text-weight-bold q-mb-xs"
                      />
                      <q-linear-progress
                        :value="(task.progress || 0) / 100"
                        :color="getProgressColor(task.progress)"
                        size="4px"
                        class="rounded-borders"
                        style="width: 60px"
                      />
                    </q-item-section>
                  </template>

                  <!-- Task Details -->
                  <q-card flat class="bg-grey-1 q-pa-md">
                    <div class="row q-gutter-md q-mb-md">
                      <div class="col">
                        <div class="text-caption text-grey-7">Description</div>
                        <div class="text-body2">{{ task.description || 'No description' }}</div>
                      </div>
                    </div>

                    <!-- Subtasks -->
                    <div v-if="task.subtasks && task.subtasks.length > 0">
                      <div class="text-subtitle2 text-weight-bold q-mb-sm">Subtasks</div>
                      <q-list separator class="bg-white rounded-borders">
                        <q-item v-for="subtask in task.subtasks" :key="subtask.id">
                          <q-item-section avatar>
                            <q-checkbox
                              :model-value="subtask.status === 'completed'"
                              disable
                              color="green"
                            />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label :class="{ 'text-grey-6': subtask.status === 'completed' }">
                              {{ subtask.title }}
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-badge
                              :color="subtask.status === 'completed' ? 'green' : 'grey'"
                              :label="subtask.status"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>

                    <!-- Reassign Button -->
                    <div class="q-mt-md">
                      <q-btn
                        flat
                        color="orange"
                        icon="person_remove"
                        label="Reassign Task"
                        size="sm"
                        no-caps
                        @click="openReassignDialog(task)"
                      />
                    </div>

                    <!-- Go to Task Button -->
                    <div class="q-mt-sm">
                      <q-btn
                        flat
                        color="blue"
                        icon="open_in_new"
                        label="View Task Details"
                        size="sm"
                        no-caps
                        @click="goToTask(task.id)"
                      />
                    </div>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </template>
          </div>

          <!-- Workload Breakdown -->
          <div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm row items-center">
              <q-icon name="pie_chart" color="grey-7" size="20px" class="q-mr-xs" />
              Workload Breakdown by Project
            </div>
            <div
              v-if="
                !resourceStore.currentResource.workloadByProject ||
                resourceStore.currentResource.workloadByProject.length === 0
              "
              class="text-grey-6 bg-grey-1 q-pa-md rounded-borders text-center"
            >
              No workload data available.
            </div>
            <div
              v-else
              class="column q-gutter-y-sm bg-white rounded-borders q-pa-md"
              style="border: 1px solid #e0e0e0"
            >
              <div
                v-for="wp in resourceStore.currentResource.workloadByProject"
                :key="wp.id"
                class="row items-center justify-between cursor-pointer hover-bg-grey-1 q-pa-xs rounded-borders"
                @click="goToProject(wp.id)"
              >
                <div class="row items-center">
                  <div
                    class="q-mr-sm"
                    :style="`width: 12px; height: 12px; border-radius: 50%; background-color: var(--q-${wp.color || 'indigo'})`"
                  ></div>
                  <span class="text-weight-medium text-primary">{{ wp.name }}</span>
                </div>
                <div class="text-grey-8 text-weight-bold">{{ Math.round(wp.hours) }}h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- Task Assignment Dialog -->
    <q-dialog v-model="showAssignTaskDialog">
      <q-card style="width: 500px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-indigo-1 text-indigo-9">
          <div class="text-h6 text-weight-bold">Assign Task to Resource</div>
          <div class="text-caption">Select an unassigned task to assign to this resource</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="availableTasks.length === 0" class="text-grey-6 text-center q-pa-md">
            No unassigned tasks available
          </div>
          <q-list v-else separator>
            <q-item
              v-for="task in availableTasks"
              :key="task.id"
              clickable
              @click="selectedTask = task"
              :class="{ 'bg-indigo-1': selectedTask && selectedTask.id === task.id }"
            >
              <q-item-section avatar>
                <q-avatar color="indigo" text-color="white" size="32px">
                  {{ task.project_name?.charAt(0) || 'P' }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ task.title }}</q-item-label>
                <q-item-label caption>{{ task.project_name }}</q-item-label>
                <q-item-label caption class="row items-center q-mt-xs">
                  <span class="q-mr-sm">{{ task.expected_effort || 0 }}h</span>
                  <q-badge :color="getPriorityColor(task.priority)" :label="task.priority" style="font-size: 10px" />
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio v-model="selectedTask" :val="task" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Assign Task"
            color="indigo-5"
            :disable="!selectedTask"
            :loading="assigningTask"
            @click="assignTask"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Task Reassignment Dialog -->
    <q-dialog v-model="showReassignDialog">
      <q-card style="width: 600px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-orange-1 text-orange-9">
          <div class="text-h6 text-weight-bold">Reassign Task</div>
          <div class="text-caption">
            Move "{{ taskToReassign?.title }}" to another employee
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="eligibleEmployees.length === 0" class="text-grey-6 text-center q-pa-md">
            No eligible employees available
          </div>
          <q-list v-else separator>
            <q-item
              v-for="emp in eligibleEmployees"
              :key="emp.id"
              clickable
              @click="selectedNewEmployee = emp"
              :class="{ 'bg-orange-1': selectedNewEmployee && selectedNewEmployee.id === emp.id }"
            >
              <q-item-section avatar>
                <q-avatar size="32px">
                  <img :src="emp.avatar_url || `https://i.pravatar.cc/150?img=${emp.id}`" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ emp.first_name }} {{ emp.last_name }}
                </q-item-label>
                <q-item-label caption>{{ emp.role_name }}</q-item-label>
                <q-item-label caption class="row items-center q-mt-xs">
                  <span class="q-mr-sm">Utilization: {{ emp.utilization }}%</span>
                  <span>• Available: {{ emp.remaining_hours }}h</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end">
                  <q-badge
                    :color="emp.utilization >= 100 ? 'red' : emp.utilization >= 85 ? 'orange' : 'green'"
                    :label="emp.utilization >= 100 ? 'Overloaded' : emp.utilization >= 85 ? 'Near Capacity' : 'Available'"
                  />
                  <q-radio v-model="selectedNewEmployee" :val="emp" class="q-mt-sm" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Reassign Task"
            color="orange"
            :disable="!selectedNewEmployee"
            :loading="reassigning"
            @click="reassignTask"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useResourceStore } from '../stores/resourceStore';
import { useQuasar } from 'quasar';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  resourceId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

console.log('ResourceDetailDialog props:', props);

const resourceStore = useResourceStore();
const router = useRouter();
const $q = useQuasar();

// Task assignment dialog state
const showAssignTaskDialog = ref(false);
const availableTasks = ref<any[]>([]);
const selectedTask = ref<any>(null);
const assigningTask = ref(false);

// Task reassignment dialog state
const showReassignDialog = ref(false);
const taskToReassign = ref<any>(null);
const eligibleEmployees = ref<any[]>([]);
const selectedNewEmployee = ref<any>(null);
const reassigning = ref(false);

watch(
  () => props.modelValue,
  async (newVal: boolean) => {
    if (newVal && props.resourceId) {
      await resourceStore.fetchResourceById(props.resourceId.toString());
    }
  },
);

const formatRole = (role: string) => {
  if (!role) return 'Employee';
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    completed: 'green',
    'in-progress': 'blue',
    'in-review': 'purple',
    'not-started': 'grey',
    blocked: 'red',
  };
  return map[status] || 'grey';
};

const getProgressColor = (progress: number) => {
  if (progress >= 75) return 'green';
  if (progress >= 50) return 'blue';
  if (progress >= 25) return 'orange';
  return 'red';
};

const calculateTotalHours = (workload: any[]) => {
  if (!workload) return 0;
  return Math.round(workload.reduce((sum, wp) => sum + Number(wp.hours), 0));
};

const goToTask = (taskId: number) => {
  emit('update:modelValue', false);
  router.push(`/dashboard/tasks?open=${taskId}`);
};

const goToProject = (projectId: number) => {
  emit('update:modelValue', false);
  router.push(`/dashboard/projects?open=${projectId}`);
};

// Manual task assignment functions
const fetchUnassignedTasks = async () => {
  try {
    const token = localStorage.getItem('tasky_token');
    const response = await fetch('http://localhost:3001/api/pm/tasks/unassigned', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      availableTasks.value = data.tasks;
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to fetch unassigned tasks',
        caption: data.error,
      });
    }
  } catch (error: any) {
    console.error('Fetch unassigned tasks error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch unassigned tasks',
      caption: error.message,
    });
  }
};

const assignTask = async () => {
  if (!selectedTask.value) {
    $q.notify({
      type: 'warning',
      message: 'Please select a task to assign',
    });
    return;
  }

  assigningTask.value = true;
  try {
    const token = localStorage.getItem('tasky_token');
    const response = await fetch('http://localhost:3001/api/pm/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taskId: selectedTask.value.id,
        userId: props.resourceId,
      }),
    });
    const data = await response.json();
    if (data.success) {
      $q.notify({
        type: 'positive',
        message: 'Task assigned successfully!',
      });
      showAssignTaskDialog.value = false;
      selectedTask.value = null;
      // Refresh resource data to show new task
      await resourceStore.fetchResourceById(props.resourceId.toString());
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to assign task',
        caption: data.error,
      });
    }
  } catch (error: any) {
    console.error('Assign task error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to assign task',
      caption: error.message,
    });
  } finally {
    assigningTask.value = false;
  }
};

// Watch for dialog opening to fetch unassigned tasks
watch(
  () => showAssignTaskDialog.value,
  (newVal: boolean) => {
    if (newVal) {
      fetchUnassignedTasks();
    }
  },
);

// Task reassignment functions
const openReassignDialog = async (task: any) => {
  taskToReassign.value = task;
  selectedNewEmployee.value = null;
  await fetchEligibleEmployees();
  showReassignDialog.value = true;
};

const fetchEligibleEmployees = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/pm/resources');
    const data = await response.json();
    if (data.success) {
      // Filter out current employee
      eligibleEmployees.value = data.resources.filter(
        (r: any) => r.id !== props.resourceId
      );
    }
  } catch (error: any) {
    console.error('Fetch eligible employees error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch eligible employees',
      caption: error.message,
    });
  }
};

const reassignTask = async () => {
  if (!taskToReassign.value || !selectedNewEmployee.value) {
    $q.notify({
      type: 'warning',
      message: 'Please select an employee to reassign to',
    });
    return;
  }

  // Check if new employee is overloaded
  const newEmployeeUtil = selectedNewEmployee.value.utilization || 0;
  const taskHours = taskToReassign.value.expected_effort || 0;
  const newUtil = newEmployeeUtil + (taskHours / selectedNewEmployee.value.max_hours_per_week * 100);

  if (newUtil > 100) {
    $q.dialog({
      title: 'Warning',
      message: `${selectedNewEmployee.value.first_name} ${selectedNewEmployee.value.last_name} will be overloaded (${Math.round(newUtil)}%) after this assignment. Continue?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await executeReassignment();
    });
  } else {
    await executeReassignment();
  }
};

const executeReassignment = async () => {
  reassigning.value = true;
  try {
    const response = await fetch('http://localhost:3001/api/pm/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId: taskToReassign.value.id,
        fromUserId: props.resourceId,
        toUserId: selectedNewEmployee.value.id,
      }),
    });
    const data = await response.json();
    if (data.success) {
      $q.notify({
        type: 'positive',
        message: `Task reassigned to ${selectedNewEmployee.value.first_name} ${selectedNewEmployee.value.last_name}`,
      });
      showReassignDialog.value = false;
      taskToReassign.value = null;
      selectedNewEmployee.value = null;
      // Refresh resource data
      await resourceStore.fetchResourceById(props.resourceId.toString());
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to reassign task',
        caption: data.error,
      });
    }
  } catch (error: any) {
    console.error('Reassign task error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to reassign task',
      caption: error.message,
    });
  } finally {
    reassigning.value = false;
  }
};
</script>

<style scoped>
.hover-bg-grey-1:hover {
  background-color: #f5f5f5 !important;
}
</style>
