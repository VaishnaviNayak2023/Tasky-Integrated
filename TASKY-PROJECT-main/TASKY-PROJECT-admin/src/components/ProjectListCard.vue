<template>
  <q-card
    flat
    bordered
    class="q-pa-md q-mb-md cursor-pointer"
    style="border-radius: 8px; border-color: #f0f0f0"
    @click="$emit('click')"
  >
    <div class="row items-center">
      <!-- Left Section -->
      <div class="col-5 row no-wrap items-start">
        <q-avatar
          :color="avatarColor"
          text-color="white"
          size="48px"
          class="q-mr-md"
          style="font-weight: bold"
        >
          {{ avatarLetter }}
        </q-avatar>
        <div class="column">
          <div class="text-subtitle1 text-weight-bold" style="line-height: 1.2">
            {{ project.name }}
          </div>
          <div
            class="text-caption text-grey-7 q-mb-xs q-mt-xs"
            style="line-height: 1.3; font-size: 11px; max-width: 90%"
          >
            {{ project.description || 'No description provided' }}
          </div>
          <div class="row items-center q-gutter-x-sm q-mb-sm q-mt-xs">
            <q-badge
              :color="statusColor"
              :text-color="statusTextColor"
              :label="formattedStatus"
              class="q-px-sm q-py-xs text-weight-bold"
              style="font-size: 10px"
            />
            <q-badge
              :color="`${priorityColor}-1`"
              :text-color="priorityColor"
              :label="formattedPriority"
              class="q-px-sm q-py-xs text-weight-bold rounded-borders"
              style="font-size: 10px"
            />
          </div>
          <div class="row items-center text-grey-6" style="font-size: 11px">
            <q-icon name="o_calendar_today" size="14px" class="q-mr-xs" />
            <span class="q-mr-md"
              >{{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}</span
            >
            <q-icon name="o_assignment" size="14px" class="q-mr-xs" />
            <span>{{ project.total_tasks || 0 }} tasks</span>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="col-2 column justify-center">
        <div class="text-grey-7" style="font-size: 11px; margin-bottom: 2px">Progress</div>
        <div :class="`text-weight-bold text-${progressColor}`" style="font-size: 14px">
          {{ project.progress }}%
        </div>
        <q-linear-progress
          :value="(project.progress || 0) / 100"
          :color="progressColor"
          size="4px"
          class="q-mt-xs rounded-borders"
          style="width: 80%"
        />
      </div>

      <!-- Tasks Section -->
      <div class="col-1 column justify-center">
        <div class="text-grey-7" style="font-size: 11px; margin-bottom: 2px">Tasks</div>
        <div class="text-weight-bold" style="font-size: 14px">{{ project.total_tasks || 0 }}</div>
        <div class="text-grey-6" style="font-size: 10px">
          {{ project.completed_tasks || 0 }} completed
        </div>
      </div>

      <!-- Team Section -->
      <div class="col-2 column justify-center">
        <div class="text-grey-7" style="font-size: 11px; margin-bottom: 4px">Team</div>
        <div class="row items-center">
          <template v-if="project.team && project.team.length > 0">
            <q-avatar
              v-for="(member, i) in project.team.slice(0, 3)"
              :key="i"
              size="26px"
              class="overlapping-avatar"
              :style="`margin-left: ${i === 0 ? 0 : '-10px'}; border: 2px solid white;`"
            >
              <img :src="member.avatar || `https://i.pravatar.cc/150?img=${member.id}`" />
              <q-tooltip>{{ member.first_name }} {{ member.last_name }}</q-tooltip>
            </q-avatar>
            <q-avatar
              v-if="project.team.length > 3"
              size="26px"
              color="indigo-1"
              text-color="indigo"
              class="overlapping-avatar"
              style="
                margin-left: -10px;
                border: 2px solid white;
                font-size: 10px;
                font-weight: bold;
              "
            >
              +{{ project.team.length - 3 }}
            </q-avatar>
          </template>
          <template v-else>
            <div class="text-caption text-grey-5">No members</div>
          </template>
        </div>
      </div>

      <!-- Deadline Section -->
      <div class="col-2 row justify-between items-center">
        <div class="column justify-center">
          <div class="text-grey-7" style="font-size: 11px; margin-bottom: 2px">Deadline</div>
          <div class="text-weight-bold" style="font-size: 13px">
            {{ formatDate(project.end_date) }}
          </div>
          <div :class="`text-${daysLeftColor}`" style="font-size: 10px; font-weight: bold">
            {{
              project.days_left > 0
                ? `${project.days_left} days left`
                : project.days_left < 0
                  ? `${Math.abs(project.days_left)} days overdue`
                  : 'Due today'
            }}
          </div>
        </div>
        <div>
          <q-btn
            flat
            round
            dense
            icon="more_vert"
            color="grey-7"
            size="10px"
            class="bg-grey-2 q-mr-sm"
            @click.stop
          >
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="$emit('edit', project)">
                  <q-item-section avatar><q-icon name="edit" size="sm" /></q-item-section>
                  <q-item-section>Edit Project</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="$emit('mark-complete', project)"
                  v-if="project.status !== 'completed'"
                >
                  <q-item-section avatar
                    ><q-icon name="check_circle" size="sm" color="green"
                  /></q-item-section>
                  <q-item-section class="text-green">Mark Complete</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$emit('delete', project)">
                  <q-item-section avatar
                    ><q-icon name="delete" size="sm" color="red"
                  /></q-item-section>
                  <q-item-section class="text-red">Delete Project</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { date } from 'quasar';

const props = defineProps<{
  project: any;
}>();

defineEmits(['click', 'edit', 'delete', 'mark-complete']);

const formatDate = (val: string) => {
  if (!val) return '';
  return date.formatDate(val, 'MMM D, YYYY');
};

const avatarLetter = computed(() => {
  return props.project.name ? props.project.name.charAt(0).toUpperCase() : 'P';
});

const avatarColor = computed(() => {
  const colors = ['blue', 'red', 'green', 'orange', 'purple', 'teal', 'pink'];
  const code = props.project.name ? props.project.name.charCodeAt(0) : 0;
  return colors[code % colors.length];
});

const priorityColor = computed(() => {
  if (props.project.priority === 'critical') return 'red';
  if (props.project.priority === 'high') return 'orange';
  if (props.project.priority === 'medium') return 'blue';
  return 'grey';
});

const formattedPriority = computed(() => {
  const p = props.project.priority || 'medium';
  return p.charAt(0).toUpperCase() + p.slice(1);
});

const statusColor = computed(() => {
  const status = props.project.computed_status || props.project.status;
  if (status === 'on-going') return 'blue-1';
  if (status === 'not-started') return 'grey-2';
  if (status === 'completed') return 'green-1';
  if (status === 'delayed') return 'red-1';
  if (status === 'pending-completion') return 'orange-1';

  if (props.project.status === 'active') return 'blue-1';
  if (props.project.status === 'planning') return 'grey-2';
  if (props.project.status === 'completed') return 'green-1';
  return 'orange-1';
});

const statusTextColor = computed(() => {
  const status = props.project.computed_status || props.project.status;
  if (status === 'on-going') return 'blue';
  if (status === 'not-started') return 'grey-8';
  if (status === 'completed') return 'green';
  if (status === 'delayed') return 'red';
  if (status === 'pending-completion') return 'orange';

  if (props.project.status === 'active') return 'blue';
  if (props.project.status === 'planning') return 'grey-8';
  if (props.project.status === 'completed') return 'green';
  return 'orange';
});

const formattedStatus = computed(() => {
  const status = props.project.computed_status || props.project.status || 'planning';
  return status
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

const progressColor = computed(() => {
  if (props.project.progress < 30) return 'orange';
  if (props.project.progress < 80) return 'blue';
  return 'green';
});

const daysLeftColor = computed(() => {
  if (props.project.status === 'completed') return 'grey-6';
  if (props.project.days_left < 0) return 'red';
  if (props.project.days_left <= 7) return 'orange';
  return 'grey-6';
});
</script>

<style scoped>
.overlapping-avatar {
  z-index: 1;
}
.overlapping-avatar:hover {
  z-index: 10;
}
.q-card {
  transition: all 0.2s ease;
}
.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #e0e0e0;
}
</style>
