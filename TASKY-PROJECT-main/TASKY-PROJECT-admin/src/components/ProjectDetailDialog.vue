<template>
  <q-dialog v-model="isOpen" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-grey-1 column" v-if="projectStore.currentProject">
      <!-- Header Area -->
      <q-card-section
        class="bg-white row items-center justify-between q-pa-md shadow-2 z-top"
        style="flex: 0 0 auto"
      >
        <div class="row items-center">
          <q-btn flat round dense icon="arrow_back" v-close-popup class="q-mr-sm" />
          <q-avatar
            :color="avatarColor"
            text-color="white"
            size="40px"
            class="q-mr-md text-weight-bold"
          >
            {{ avatarLetter }}
          </q-avatar>
          <div class="column">
            <div class="text-h6 text-weight-bold" style="line-height: 1.2">
              {{ projectStore.currentProject.name }}
            </div>
            <div class="text-caption text-grey-7">Project Details</div>
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <q-badge
            :color="statusColor"
            :text-color="statusTextColor"
            :label="formattedStatus"
            class="q-px-sm q-py-xs text-weight-bold"
            style="font-size: 11px"
          />
          <q-btn
            unelevated
            color="primary"
            label="Add Task"
            icon="add"
            @click="showCreateTaskDialog = true"
          />
        </div>
      </q-card-section>

      <!-- Main Content Area -->
      <div class="row q-col-gutter-md q-pa-md" style="flex: 1 1 0; overflow-y: auto">
        <!-- Left Column: Details & Team -->
        <div class="col-4 column q-gutter-y-md">
          <!-- Overview Card -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Overview</div>
              <div class="text-body2 text-grey-8 q-mb-md">
                {{ projectStore.currentProject.description || 'No description provided.' }}
              </div>

              <q-list dense>
                <q-item class="q-px-none">
                  <q-item-section avatar style="min-width: 32px"
                    ><q-icon name="priority_high" color="grey-6" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Priority</q-item-section>
                  <q-item-section side>
                    <q-badge
                      :color="`${priorityColor}-1`"
                      :text-color="priorityColor"
                      :label="formattedPriority"
                      class="text-weight-bold"
                    />
                  </q-item-section>
                </q-item>
                <q-item class="q-px-none">
                  <q-item-section avatar style="min-width: 32px"
                    ><q-icon name="calendar_today" color="grey-6" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Timeline</q-item-section>
                  <q-item-section side class="text-body2 text-weight-medium">
                    {{ formatDate(projectStore.currentProject.start_date) }} -
                    {{ formatDate(projectStore.currentProject.end_date) }}
                  </q-item-section>
                </q-item>
                <q-item class="q-px-none">
                  <q-item-section avatar style="min-width: 32px"
                    ><q-icon name="hourglass_empty" color="grey-6" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Time Left</q-item-section>
                  <q-item-section
                    side
                    class="text-body2 text-weight-medium"
                    :class="`text-${daysLeftColor}`"
                  >
                    {{ projectStore.currentProject.days_left }} days
                  </q-item-section>
                </q-item>
                <q-item class="q-px-none" v-if="projectStore.currentProject.health">
                  <q-item-section avatar style="min-width: 32px"
                    ><q-icon name="health_and_safety" color="grey-6" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Health</q-item-section>
                  <q-item-section side>
                    <q-badge
                      :color="healthColor"
                      :label="formattedHealth"
                      class="text-weight-bold"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="q-mt-md">
                <div class="row justify-between text-caption q-mb-xs">
                  <span class="text-grey-7">Overall Progress</span>
                  <span class="text-weight-bold"
                    >{{ projectStore.currentProject.progress || 0 }}%</span
                  >
                </div>
                <q-linear-progress
                  :value="(projectStore.currentProject.progress || 0) / 100"
                  :color="progressColor"
                  size="8px"
                  class="rounded-borders"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Task Statistics Card -->
          <q-card flat bordered class="bg-white" v-if="projectStore.currentProject.stats">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Task Statistics</div>
              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-6">
                  <div class="text-caption text-grey-7">Total Tasks</div>
                  <div class="text-h6 text-weight-bold">
                    {{ projectStore.currentProject.stats.totalTasks }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Completed</div>
                  <div class="text-h6 text-weight-bold text-green">
                    {{ projectStore.currentProject.stats.completedTasks }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">In Progress</div>
                  <div class="text-h6 text-weight-bold text-blue">
                    {{ projectStore.currentProject.stats.inProgressTasks }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Not Started</div>
                  <div class="text-h6 text-weight-bold text-grey">
                    {{ projectStore.currentProject.stats.notStartedTasks }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Blocked</div>
                  <div class="text-h6 text-weight-bold text-red">
                    {{ projectStore.currentProject.stats.blockedTasks }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7">Overdue</div>
                  <div class="text-h6 text-weight-bold text-orange">
                    {{ projectStore.currentProject.stats.overdueTasks }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Hours Summary Card -->
          <q-card flat bordered class="bg-white" v-if="projectStore.currentProject.stats">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Hours Summary</div>
              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-4">
                  <div class="text-caption text-grey-7">Estimated</div>
                  <div class="text-h6 text-weight-bold">
                    {{ projectStore.currentProject.stats.totalEstimatedHours }}h
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-caption text-grey-7">Worked</div>
                  <div class="text-h6 text-weight-bold text-blue">
                    {{ projectStore.currentProject.stats.totalActualHours }}h
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-caption text-grey-7">Remaining</div>
                  <div
                    class="text-h6 text-weight-bold"
                    :class="
                      projectStore.currentProject.stats.remainingHours > 0
                        ? 'text-orange'
                        : 'text-green'
                    "
                  >
                    {{ projectStore.currentProject.stats.remainingHours }}h
                  </div>
                </div>
              </div>
              <q-linear-progress
                :value="hoursProgress"
                color="blue"
                size="8px"
                class="rounded-borders"
              />
              <div class="text-caption text-right q-mt-xs">
                {{ hoursProgressPercent }}% complete
              </div>
            </q-card-section>
          </q-card>

          <!-- Team Card -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Project Team</div>
              <q-list
                v-if="
                  projectStore.currentProject.team && projectStore.currentProject.team.length > 0
                "
              >
                <q-item
                  v-for="member in projectStore.currentProject.team"
                  :key="member.id"
                  class="q-px-none"
                >
                  <q-item-section avatar>
                    <q-avatar size="32px">
                      <img :src="member.avatar || `https://i.pravatar.cc/150?img=${member.id}`" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium text-body2"
                      >{{ member.first_name }} {{ member.last_name }}</q-item-label
                    >
                    <q-item-label caption>{{ member.role_name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="mail"
                      color="grey-5"
                      size="sm"
                      :href="`mailto:${member.email}`"
                      v-if="member.email"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-caption text-grey text-center q-pa-md">
                No team members assigned yet.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column: Tasks -->
        <div class="col-8">
          <q-card flat bordered class="bg-white full-height flex column">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="text-subtitle1 text-weight-bold">
                Tasks ({{ projectStore.currentProject.tasks?.length || 0 }})
              </div>

              <!-- Simple Status Filter -->
              <q-btn-toggle
                v-model="taskFilter"
                flat
                stretch
                toggle-color="primary"
                :options="[
                  { label: 'All', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Completed', value: 'completed' },
                ]"
                size="sm"
              />
            </q-card-section>

            <q-card-section class="q-pt-md" style="flex: 1 1 0; overflow-y: auto">
              <div v-if="filteredTasks.length > 0" class="q-gutter-y-sm">
                <!-- Task Items -->
                <q-card
                  v-for="task in filteredTasks"
                  :key="task.id"
                  flat
                  bordered
                  class="cursor-pointer task-card"
                  @click="openTask(task)"
                >
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center">
                      <div class="col-1 text-center">
                        <q-icon
                          v-if="task.status === 'completed'"
                          name="check_circle"
                          color="green"
                          size="sm"
                        />
                        <q-circular-progress
                          v-else-if="task.status === 'in-progress'"
                          show-value
                          class="text-blue text-weight-bold"
                          :value="task.progress"
                          size="28px"
                          color="blue"
                          track-color="grey-3"
                          style="font-size: 10px"
                        >
                          {{ task.progress }}
                        </q-circular-progress>
                        <q-icon
                          v-else-if="task.status === 'blocked'"
                          name="cancel"
                          color="red"
                          size="sm"
                        />
                        <q-icon v-else name="radio_button_unchecked" color="grey-5" size="sm" />
                      </div>

                      <div class="col-7 q-pl-sm">
                        <div
                          class="text-weight-medium"
                          :class="{ 'text-strike text-grey-6': task.status === 'completed' }"
                        >
                          {{ task.title }}
                        </div>
                        <div
                          class="text-caption text-grey-7 text-ellipsis"
                          style="max-width: 100%; overflow: hidden; white-space: nowrap"
                        >
                          {{ task.description || 'No description' }}
                        </div>
                      </div>

                      <div class="col-2 row items-center justify-end">
                        <template v-if="task.assignees && task.assignees.length > 0">
                          <q-avatar
                            v-for="(a, i) in task.assignees.slice(0, 2)"
                            :key="a.id"
                            size="24px"
                            class="overlapping-avatar"
                            :style="`margin-left: ${i === 0 ? 0 : '-8px'}; border: 2px solid white;`"
                          >
                            <img :src="a.avatar || `https://i.pravatar.cc/150?img=${a.id}`" />
                            <q-tooltip>{{ a.first_name }} {{ a.last_name }}</q-tooltip>
                          </q-avatar>
                        </template>
                        <span v-else class="text-caption text-grey-5">Unassigned</span>
                      </div>

                      <div class="col-2 column items-end justify-center">
                        <q-badge
                          :color="`${getTaskPriorityColor(task.priority)}-1`"
                          :text-color="getTaskPriorityColor(task.priority)"
                          :label="task.priority"
                          class="q-mb-xs"
                          style="font-size: 9px"
                        />
                        <div
                          class="text-caption text-weight-medium"
                          :class="{
                            'text-red':
                              task.status !== 'completed' && new Date(task.deadline) < new Date(),
                          }"
                        >
                          {{ formatDate(task.deadline) }}
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div v-else class="text-center text-grey-6 q-pa-xl">
                <q-icon name="assignment" size="48px" class="q-mb-sm text-grey-4" />
                <div class="text-subtitle1">No tasks found</div>
                <div class="text-caption">Adjust filters or create a new task.</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>

    <!-- Loading State -->
    <q-card v-else class="bg-grey-1 flex flex-center">
      <q-spinner-dots size="40px" color="primary" />
    </q-card>

    <!-- Create Task Dialog -->
    <CreateTaskDialog
      v-model="showCreateTaskDialog"
      :initial-project-id="projectStore.currentProject?.id"
      @saved="projectStore.fetchProjectById(projectStore.currentProject.id)"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useProjectStore } from '../stores/projectStore';
import { date } from 'quasar';
import { useRouter } from 'vue-router';
import CreateTaskDialog from './CreateTaskDialog.vue';

const props = defineProps<{
  modelValue: boolean;
  projectId?: string;
}>();

const emit = defineEmits(['update:modelValue']);
const projectStore = useProjectStore();
const router = useRouter();

const isOpen = ref(props.modelValue);
const taskFilter = ref('all');
const showCreateTaskDialog = ref(false); // To be fully implemented when doing tasks

watch(
  () => props.modelValue,
  async (val) => {
    isOpen.value = val;
    if (val && props.projectId) {
      await projectStore.fetchProjectDetails(props.projectId);
    }
  },
);

watch(isOpen, (val) => {
  emit('update:modelValue', val);
  if (!val) {
    // Clear selected project on close
    projectStore.currentProject = null;
  }
});

const formatDate = (val: string) => {
  if (!val) return '';
  return date.formatDate(val, 'MMM D, YYYY');
};

// Computed properties for UI colors
const avatarLetter = computed(() => {
  return projectStore.currentProject?.name
    ? projectStore.currentProject.name.charAt(0).toUpperCase()
    : 'P';
});

const avatarColor = computed(() => {
  return projectStore.currentProject?.color || 'primary';
});

const priorityColor = computed(() => {
  const p = projectStore.currentProject?.priority;
  if (p === 'critical') return 'red';
  if (p === 'high') return 'orange';
  if (p === 'medium') return 'blue';
  return 'grey';
});

const formattedPriority = computed(() => {
  const p = projectStore.currentProject?.priority || 'medium';
  return p.charAt(0).toUpperCase() + p.slice(1);
});

const statusColor = computed(() => {
  const s = projectStore.currentProject?.computed_status || projectStore.currentProject?.status;
  if (s === 'on-going') return 'blue-1';
  if (s === 'not-started') return 'grey-2';
  if (s === 'completed') return 'green-1';
  if (s === 'delayed') return 'red-1';
  if (s === 'pending-completion') return 'orange-1';

  if (projectStore.currentProject?.status === 'active') return 'green-1';
  if (projectStore.currentProject?.status === 'planning') return 'blue-1';
  if (projectStore.currentProject?.status === 'completed') return 'grey-3';
  return 'orange-1';
});

const statusTextColor = computed(() => {
  const s = projectStore.currentProject?.computed_status || projectStore.currentProject?.status;
  if (s === 'on-going') return 'blue';
  if (s === 'not-started') return 'grey-8';
  if (s === 'completed') return 'green';
  if (s === 'delayed') return 'red';
  if (s === 'pending-completion') return 'orange';

  if (projectStore.currentProject?.status === 'active') return 'green';
  if (projectStore.currentProject?.status === 'planning') return 'blue';
  if (projectStore.currentProject?.status === 'completed') return 'grey-8';
  return 'orange';
});

const formattedStatus = computed(() => {
  const status =
    projectStore.currentProject?.computed_status ||
    projectStore.currentProject?.status ||
    'planning';
  return status
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

const progressColor = computed(() => {
  const p = projectStore.currentProject?.progress || 0;
  if (p < 30) return 'orange';
  if (p < 80) return 'blue';
  return 'green';
});

const daysLeftColor = computed(() => {
  if (projectStore.currentProject?.status === 'completed') return 'grey-6';
  const d = projectStore.currentProject?.days_left || 0;
  if (d < 0) return 'red';
  if (d <= 7) return 'orange';
  return 'grey-8';
});

const healthColor = computed(() => {
  const h = projectStore.currentProject?.health;
  if (h === 'on-track') return 'green-1';
  if (h === 'at-risk') return 'orange-1';
  if (h === 'delayed') return 'red-1';
  return 'grey-1';
});

const formattedHealth = computed(() => {
  const h = projectStore.currentProject?.health || 'unknown';
  return h
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

const hoursProgress = computed(() => {
  const stats = projectStore.currentProject?.stats;
  if (!stats || stats.totalEstimatedHours === 0) return 0;
  return stats.totalActualHours / stats.totalEstimatedHours;
});

const hoursProgressPercent = computed(() => {
  return Math.round(hoursProgress.value * 100);
});

const getTaskPriorityColor = (p: string) => {
  if (p === 'critical') return 'red';
  if (p === 'high') return 'orange';
  if (p === 'medium') return 'blue';
  return 'grey';
};

// Filtered tasks
const filteredTasks = computed(() => {
  const tasks = projectStore.currentProject?.tasks || [];
  if (taskFilter.value === 'all') return tasks;
  if (taskFilter.value === 'completed') return tasks.filter((t: any) => t.status === 'completed');
  if (taskFilter.value === 'pending') return tasks.filter((t: any) => t.status !== 'completed');
  return tasks;
});

const openTask = (task: any) => {
  // Navigate to Tasks page and open the specific task
  isOpen.value = false;
  router.push(`/dashboard/tasks?search=${encodeURIComponent(task.title)}&open=${task.id}`);
};
</script>

<style scoped>
.overlapping-avatar {
  z-index: 1;
}
.overlapping-avatar:hover {
  z-index: 10;
}
.task-card {
  transition: all 0.2s ease;
}
.task-card:hover {
  background-color: #f8f9fa;
  border-color: #d0d0d0;
}
</style>
