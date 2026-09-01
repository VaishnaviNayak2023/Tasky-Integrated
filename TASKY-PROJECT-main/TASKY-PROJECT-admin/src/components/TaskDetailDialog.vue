<template>
  <q-dialog
    v-model="isOpen"
    position="right"
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card
      style="width: 600px; max-width: 100vw"
      class="full-height column bg-grey-1"
      v-if="taskStore.currentTask"
    >
      <!-- Header -->
      <q-card-section
        class="bg-white row items-center justify-between q-pa-md shadow-2 z-top"
        style="flex: 0 0 auto"
      >
        <div class="row items-center">
          <q-btn flat round dense icon="close" v-close-popup class="q-mr-sm" />
          <div class="column">
            <div class="text-caption text-grey-7 text-uppercase">
              {{ taskStore.currentTask.project_name }}
            </div>
            <div class="text-h6 text-weight-bold" style="line-height: 1.2">
              {{ taskStore.currentTask.title }}
            </div>
          </div>
        </div>

        <div>
          <q-btn flat round dense icon="edit" color="primary" @click="onEdit" />
          <q-btn flat round dense icon="more_vert" color="grey-7">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="handleDelete">
                  <q-item-section avatar
                    ><q-icon name="delete" size="sm" color="red"
                  /></q-item-section>
                  <q-item-section class="text-red">Delete Task</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-card-section>

      <!-- Main Content -->
      <q-card-section class="q-pa-md" style="flex: 1 1 0; overflow-y: auto">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="details" label="Details" />
          <q-tab name="timeline" label="Progress Timeline" />
          <q-tab name="impact" label="Simulate Impact" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated class="bg-transparent q-mt-md">
          <!-- Details Tab -->
          <q-tab-panel name="details" class="q-pa-none">
            <div class="row q-col-gutter-md">
              <!-- Left Column (Details) -->
              <div class="col-8 column q-gutter-y-md">
                <q-card flat bordered class="bg-white q-pa-md">
                  <div class="text-subtitle2 text-grey-7 q-mb-sm">Description</div>
                  <div class="text-body2" style="white-space: pre-wrap">
                    {{ taskStore.currentTask.description || 'No description provided.' }}
                  </div>
                </q-card>

                <q-card flat bordered class="bg-white q-pa-md">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-subtitle2 text-grey-7">Progress</div>
                    <div class="row items-center q-gutter-x-sm">
                      <div class="text-weight-bold">{{ taskStore.currentTask.progress || 0 }}%</div>
                      <q-btn
                        size="sm"
                        flat
                        round
                        icon="edit"
                        color="primary"
                        @click="showProgressDialog = true"
                      />
                    </div>
                  </div>
                  <q-linear-progress
                    :value="(taskStore.currentTask.progress || 0) / 100"
                    :color="getProgressColor(taskStore.currentTask.progress)"
                    size="8px"
                    class="rounded-borders"
                  />
                </q-card>
              </div>

              <!-- Right Column (Meta info) -->
              <div class="col-4 column q-gutter-y-md">
                <q-card flat bordered class="bg-white">
                  <q-list dense separator>
                    <q-item class="q-py-md">
                      <q-item-section>
                        <q-item-label caption>Status</q-item-label>
                        <q-item-label>
                          <q-badge
                            :color="`${getStatusColor(taskStore.currentTask.status)}-1`"
                            :text-color="getStatusColor(taskStore.currentTask.status)"
                            :label="formatName(taskStore.currentTask.status)"
                            class="text-weight-bold"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item class="q-py-md">
                      <q-item-section>
                        <q-item-label caption>Priority</q-item-label>
                        <q-item-label>
                          <q-badge
                            :color="`${getPriorityColor(taskStore.currentTask.priority)}-1`"
                            :text-color="getPriorityColor(taskStore.currentTask.priority)"
                            :label="formatName(taskStore.currentTask.priority)"
                            class="text-weight-bold"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item class="q-py-md">
                      <q-item-section>
                        <q-item-label caption>Deadline</q-item-label>
                        <q-item-label class="text-weight-medium" :class="{ 'text-red': isOverdue }">
                          {{ formatDate(taskStore.currentTask.deadline) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item class="q-py-md">
                      <q-item-section>
                        <q-item-label caption>Expected Effort</q-item-label>
                        <q-item-label class="text-weight-medium"
                          >{{ taskStore.currentTask.expected_effort || 0 }} hrs</q-item-label
                        >
                      </q-item-section>
                    </q-item>

                    <q-item class="q-py-md">
                      <q-item-section>
                        <q-item-label caption>Resources Needed</q-item-label>
                        <q-item-label class="text-weight-medium">{{
                          taskStore.currentTask.resources_needed || 1
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>

                <q-card flat bordered class="bg-white q-pa-md">
                  <div class="text-subtitle2 text-grey-7 q-mb-sm">Assignees</div>
                  <q-list
                    v-if="
                      taskStore.currentTask.assignees && taskStore.currentTask.assignees.length > 0
                    "
                    dense
                  >
                    <q-item
                      v-for="assignee in taskStore.currentTask.assignees"
                      :key="assignee.id"
                      class="q-px-none q-py-sm"
                    >
                      <q-item-section avatar>
                        <q-avatar size="32px">
                          <img
                            :src="assignee.avatar || `https://i.pravatar.cc/150?img=${assignee.id}`"
                          />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium"
                          >{{ assignee.first_name }} {{ assignee.last_name }}</q-item-label
                        >
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-caption text-grey">No assignees</div>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Timeline Tab -->
          <q-tab-panel name="timeline" class="q-pa-none">
            <q-card flat bordered class="bg-white q-pa-md q-mb-md">
              <div class="text-subtitle2 text-weight-bold q-mb-md">Progress Updates & Comments</div>
              <q-timeline color="primary">
                <template v-for="(item, index) in timelineItems" :key="index">
                  <q-timeline-entry
                    :title="item.title"
                    :subtitle="formatDateWithTime(item.date)"
                    :icon="item.icon"
                    :color="item.color"
                  >
                    <div class="row items-center q-mb-sm" v-if="item.user">
                      <q-avatar size="24px" class="q-mr-sm">
                        <img
                          :src="item.user.avatar || `https://i.pravatar.cc/150?img=${item.user.id}`"
                        />
                      </q-avatar>
                      <span class="text-weight-medium text-caption">{{ item.user.name }}</span>
                    </div>
                    <div class="text-body2" style="white-space: pre-wrap">{{ item.content }}</div>
                  </q-timeline-entry>
                </template>
                <div
                  v-if="timelineItems.length === 0"
                  class="text-caption text-grey text-center q-pa-md"
                >
                  No timeline events recorded.
                </div>
              </q-timeline>
            </q-card>
          </q-tab-panel>

          <!-- Impact Analysis Tab -->
          <q-tab-panel name="impact" class="q-pa-none">
            <q-card flat bordered class="bg-white q-pa-md">
              <div class="text-subtitle2 text-weight-bold q-mb-md">Simulate Impact</div>
              <div class="text-body2 text-grey-7 q-mb-md">
                Simulate changing the progress of this task to see its impact on the project
                schedule and workloads.
              </div>
              <q-btn
                outline
                color="primary"
                label="Run Impact Simulation"
                @click="runSimulation"
                :loading="simulationLoading"
              />

              <div v-if="simulationResult" class="q-mt-md q-pa-md bg-grey-2 rounded-borders">
                <div class="text-weight-bold q-mb-sm">Simulation Results</div>
                <div class="text-body2" style="white-space: pre-wrap">{{ simulationResult }}</div>
              </div>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>

    <q-card v-else class="bg-grey-1 flex flex-center" style="width: 600px; max-width: 100vw">
      <q-spinner-dots size="40px" color="primary" />
    </q-card>

    <!-- Progress Dialog -->
    <q-dialog v-model="showProgressDialog">
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Adjust Progress</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="q-mb-md">
            <div class="row justify-between text-caption q-mb-xs">
              <span class="text-grey-7">New Progress</span>
              <span class="text-weight-bold">{{ newProgress }}%</span>
            </div>
            <q-slider v-model="newProgress" :min="0" :max="100" color="primary" label />
          </div>

          <q-input
            v-model="progressNote"
            type="textarea"
            outlined
            label="Add a note (optional)"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            @click="saveProgress"
            :loading="savingProgress"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePmTaskStore } from '../stores/pmTaskStore';
import { date } from 'quasar';

const props = defineProps<{
  modelValue: boolean;
  taskId?: string;
}>();

const emit = defineEmits(['update:modelValue', 'edit', 'deleted']);
const taskStore = usePmTaskStore();

const isOpen = ref(props.modelValue);
const tab = ref('details');

const showProgressDialog = ref(false);
const newProgress = ref(0);
const progressNote = ref('');
const savingProgress = ref(false);

const simulationLoading = ref(false);
const simulationResult = ref('');

watch(
  () => props.modelValue,
  async (val) => {
    isOpen.value = val;
    if (val && props.taskId) {
      await taskStore.fetchTaskById(props.taskId);
      newProgress.value = parseFloat(taskStore.currentTask?.progress) || 0;
    }
  },
);

watch(isOpen, (val) => {
  emit('update:modelValue', val);
  if (!val) {
    taskStore.currentTask = null;
  }
});

const onEdit = () => {
  emit('edit', taskStore.currentTask);
};

const formatName = (val: string) => {
  if (!val) return '';
  return val
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (val: string) => {
  if (!val) return 'None';
  return date.formatDate(val, 'MMM D, YYYY');
};

const getPriorityColor = (priority: string) => {
  if (priority === 'critical') return 'red';
  if (priority === 'high') return 'orange';
  if (priority === 'medium') return 'blue';
  return 'grey';
};

const getStatusColor = (status: string) => {
  if (status === 'completed') return 'green';
  if (status === 'in-progress') return 'blue';
  if (status === 'blocked') return 'red';
  if (status === 'not-started') return 'grey';
  return 'grey';
};

const getProgressColor = (progress: number) => {
  const p = progress || 0;
  if (p === 100) return 'green';
  if (p >= 50) return 'blue';
  if (p > 0) return 'orange';
  return 'grey-4';
};

const isOverdue = computed(() => {
  if (!taskStore.currentTask) return false;
  if (taskStore.currentTask.status === 'completed') return false;
  if (!taskStore.currentTask.deadline) return false;
  return new Date(taskStore.currentTask.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
});

const formatDateWithTime = (val: string) => {
  if (!val) return 'None';
  return date.formatDate(val, 'MMM D, YYYY h:mm A');
};

const timelineItems = computed(() => {
  if (!taskStore.currentTask) return [];
  const items: any[] = [];

  if (taskStore.currentTask.progressHistory) {
    taskStore.currentTask.progressHistory.forEach((ph: any) => {
      items.push({
        type: 'progress',
        date: ph.created_at,
        title: `Progress updated from ${ph.previous_progress}% to ${ph.new_progress}%`,
        content: ph.notes || '',
        icon: 'trending_up',
        color: 'blue',
        user: { id: ph.user_id, name: `${ph.first_name} ${ph.last_name}`, avatar: ph.avatar },
      });
    });
  }

  if (taskStore.currentTask.comments) {
    taskStore.currentTask.comments.forEach((c: any) => {
      items.push({
        type: 'comment',
        date: c.created_at,
        title: c.is_sticky ? 'Pinned Comment' : 'Comment',
        content: c.content,
        icon: 'comment',
        color: c.is_sticky ? 'orange' : 'grey-7',
        user: { id: c.user_id, name: `${c.first_name} ${c.last_name}`, avatar: c.avatar },
      });
    });
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const saveProgress = async () => {
  if (!taskStore.currentTask) return;
  savingProgress.value = true;
  try {
    await taskStore.adjustProgress(taskStore.currentTask.id, newProgress.value, progressNote.value);
    showProgressDialog.value = false;
    progressNote.value = '';
    // Refresh task to get new history
    await taskStore.fetchTaskById(taskStore.currentTask.id);
  } catch (error) {
    console.error('Error saving progress:', error);
  } finally {
    savingProgress.value = false;
  }
};

const handleDelete = async () => {
  if (!taskStore.currentTask) return;
  try {
    await taskStore.deleteTask(taskStore.currentTask.id);
    isOpen.value = false;
    emit('deleted');
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

const runSimulation = () => {
  simulationLoading.value = true;
  setTimeout(() => {
    simulationResult.value =
      "If this task is delayed by 2 weeks:\n- The 'Shopping Cart' task will be blocked.\n- 'Sarah Johnson' will be underutilized for 14 hours.\n- The 'E-Commerce Platform' project end date will push out by 5 days.";
    simulationLoading.value = false;
  }, 1000);
};
</script>
