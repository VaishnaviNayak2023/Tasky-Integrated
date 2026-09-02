<template>
  <div class="row q-col-gutter-md">
    <div class="col-12">
      <q-card>
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">My Tasks Across Projects</div>
            <q-btn
              color="primary"
              icon="add"
              label="Self-Assign Task"
              @click="$emit('open-create')"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <div v-if="tasks.length === 0" class="text-center text-grey-6 q-pa-md">
            <q-icon name="assignment" size="48px" class="q-mb-sm text-grey-4" />
            <div class="text-subtitle1">No tasks assigned yet</div>
            <div class="text-caption">Create a self-assigned task to get started</div>
          </div>
          <div v-else class="q-gutter-y-sm">
            <q-card
              v-for="task in tasks"
              :key="task.id"
              flat
              bordered
              class="cursor-pointer"
              @click="$emit('task-detail', task)"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center">
                  <div class="col-1 text-center">
                    <q-circular-progress
                      v-if="task.status === 'completed'"
                      show-value
                      class="text-green text-weight-bold"
                      :value="100"
                      size="28px"
                      color="green"
                      track-color="grey-3"
                      style="font-size: 10px"
                    >
                      100
                    </q-circular-progress>
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
                      v-else-if="task.status === 'in-review'"
                      name="rate_review"
                      color="purple"
                      size="sm"
                    />
                    <q-icon
                      v-else-if="task.status === 'blocked'"
                      name="cancel"
                      color="red"
                      size="sm"
                    />
                    <q-icon v-else name="radio_button_unchecked" color="grey-5" size="sm" />
                  </div>
                  <div class="col-6 q-pl-sm">
                    <div
                      class="text-weight-medium"
                      :class="{ 'text-strike text-grey-6': task.status === 'completed' }"
                    >
                      {{ task.title }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ getProjectName(task.project_id) }}
                    </div>
                  </div>
                  <div class="col-2 column items-center justify-center">
                    <q-badge
                      :color="`${getPriorityColor(task.priority)}-1`"
                      :text-color="getPriorityColor(task.priority)"
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
                  <div class="col-2 column items-end justify-center">
                    <q-badge
                      :color="`${getStatusColor(task.status)}-1`"
                      :text-color="getStatusColor(task.status)"
                      :label="task.status"
                      class="text-weight-bold"
                      style="font-size: 9px"
                    />
                    <div class="text-caption text-grey-7 q-mt-xs">{{ task.progress }}%</div>
                  </div>
                  <div class="col-1 column items-center justify-center">
                    <q-btn
                      v-if="task.status === 'in-progress' || task.status === 'not-started'"
                      flat
                      round
                      dense
                      icon="edit"
                      color="blue"
                      size="12px"
                      @click.stop="$emit('update-progress', task)"
                    />
                    <q-btn
                      v-if="
                        task.status === 'completed' ||
                        task.status === 'in-review' ||
                        (task.status === 'in-progress' && task.progress === 100)
                      "
                      flat
                      round
                      dense
                      icon="rate_review"
                      color="purple"
                      size="12px"
                      @click.stop="$emit('submit-review', task)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPriorityColor, getStatusColor } from '../../constants';

interface Props {
  tasks: any[];
  projects: any[];
}

defineProps<Props>();

const emit = defineEmits<{
  'task-detail': [task: any];
  'update-progress': [task: any];
  'submit-review': [task: any];
  'open-create': [];
}>();

function getProjectName(projectId: string | number) {
  return 'Unknown Project';
}

function formatDate(date: string) {
  if (!date) return 'No deadline';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>
