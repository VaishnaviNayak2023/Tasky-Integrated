<template>
  <q-page
    class="q-pa-md text-black flex column bg-grey-1"
    style="height: 100vh; max-height: 100vh; min-height: 0 !important"
  >
    <!-- Header -->
    <div class="row items-start justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="row items-center">
        <q-avatar
          color="indigo-1"
          text-color="indigo"
          icon="o_calendar_view_week"
          size="48px"
          class="q-mr-md rounded-borders"
        />
        <div class="column">
          <div class="text-h5 text-weight-bold">Cross-Project Timeline</div>
          <div class="text-grey-7 text-caption">
            Visualize task deadlines, resource availability, and milestones
          </div>
        </div>
      </div>
      <q-btn
        unelevated
        color="indigo"
        icon="add"
        label="Add Event"
        no-caps
        rounded
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Main Content -->
    <div
      class="bg-white q-pa-md shadow-1 rounded-borders"
      style="
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      "
    >
      <!-- Toolbar -->
      <div class="row items-center justify-between q-mb-md" style="flex: 0 0 auto">
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            flat
            round
            dense
            icon="chevron_left"
            color="grey-8"
            aria-label="Previous month"
            @click="changeMonth(-1)"
          />
          <div class="text-subtitle1 text-weight-bold q-px-sm">{{ monthLabel }}</div>
          <q-btn
            flat
            round
            dense
            icon="chevron_right"
            color="grey-8"
            aria-label="Next month"
            @click="changeMonth(1)"
          />
        </div>

        <div class="row items-center q-gutter-x-sm">
          <q-badge
            color="blue-1"
            text-color="blue"
            label="Task Deadline"
            class="q-pa-xs rounded-borders"
          />
          <q-badge
            color="orange-1"
            text-color="orange"
            label="Milestone"
            class="q-pa-xs rounded-borders"
          />
          <q-badge
            color="green-1"
            text-color="green"
            label="Available"
            class="q-pa-xs rounded-borders"
          />
          <q-badge color="red-1" text-color="red" label="Leave" class="q-pa-xs rounded-borders" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="calendarStore.loading" class="row items-center justify-center full-height full-width">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <!-- Resource timeline -->
      <div class="resource-timeline" style="flex: 1 1 0">
        <div class="timeline-head">
          <div class="resource-col text-caption text-grey-7 text-weight-bold">RESOURCE</div>
          <div
            class="days-col"
            :style="{ gridTemplateColumns: `repeat(${monthDays.length}, minmax(28px, 1fr))` }"
          >
            <div
              v-for="day in monthDays"
              :key="day.key"
              class="day-label"
              :class="{ 'today-label': day.isToday }"
            >
              {{ day.label }}
            </div>
          </div>
          <div class="completion-col text-caption text-grey-7 text-weight-bold">COMPLETE</div>
        </div>

        <div v-if="resourceRows.length === 0" class="empty-timeline">
          <q-icon name="view_timeline" size="48px" color="grey-4" />
          <div class="text-subtitle1 text-grey-7 q-mt-sm">No assigned tasks this month.</div>
        </div>
        <div v-for="row in resourceRows" :key="row.id" class="timeline-row">
          <div class="resource-col resource-name">
            <q-avatar
              size="30px"
              color="indigo-1"
              text-color="indigo"
              :src="row.avatar || undefined"
              >{{ row.initials }}</q-avatar
            >
            <div class="ellipsis q-ml-sm">{{ row.name }}</div>
          </div>
          <div
            class="days-col task-track"
            :style="{ gridTemplateColumns: `repeat(${monthDays.length}, minmax(28px, 1fr))` }"
          >
            <div
              v-for="day in monthDays"
              :key="day.key"
              class="day-cell"
              :class="{ 'today-cell': day.isToday }"
            />
            <q-tooltip v-if="row.tasks.length">{{
              row.tasks.map((task: any) => task.title).join(' • ')
            }}</q-tooltip>
            <div
              v-for="task in row.tasks"
              :key="task.id"
              class="task-bar"
              :style="task.style"
              :class="`task-${task.status}`"
            >
              <span class="task-title">{{ task.title }}</span>
              <span class="task-progress">{{ task.progress }}%</span>
            </div>
          </div>
          <div class="completion-col completion-value" :class="completionClass(row.completion)">
            {{ row.completion }}%
          </div>
        </div>
      </div>
    </div>
  </q-page>
  <CreateTaskDialog v-model="showCreateDialog" @saved="refreshCalendar" />
</template>

<script setup lang="ts">
import { useCalendarPage } from '../../composables/useCalendarPage';
import CreateTaskDialog from '../CreateTaskDialog.vue';

const {
  calendarStore,
  showCreateDialog,
  monthLabel,
  monthDays,
  resourceRows,
  changeMonth,
  refreshCalendar,
  completionClass,
} = useCalendarPage();
</script>

<style scoped>
/* Custom styles for complex grid layouts that cannot be easily replaced with Quasar utilities */
.resource-timeline {
  overflow: auto;
  border: 1px solid #edf0f5;
  border-radius: 10px;
  min-width: 760px;
}
.timeline-head,
.timeline-row {
  display: grid;
  grid-template-columns: 190px minmax(420px, 1fr) 78px;
  align-items: center;
}
.timeline-head {
  min-height: 42px;
  background: #f7f8fb;
  border-bottom: 1px solid #e8ebf0;
  position: sticky;
  top: 0;
  z-index: 2;
}
.timeline-row {
  min-height: 64px;
  border-bottom: 1px solid #f0f2f5;
}
.resource-col,
.completion-col {
  padding: 0 14px;
}
.resource-name {
  display: flex;
  align-items: center;
  min-width: 0;
  font-weight: 600;
  color: #3b4658;
}
.days-col {
  display: grid;
  height: 100%;
  position: relative;
}
.day-label {
  text-align: center;
  padding-top: 13px;
  font-size: 11px;
  color: #8c98aa;
}
.today-label {
  color: #4f46e5;
  font-weight: 700;
}
.task-track {
  min-height: 64px;
  align-items: center;
}
.day-cell {
  height: 100%;
  border-left: 1px solid #f1f3f6;
  grid-row: 1;
}
.today-cell {
  background: #f2f2ff;
}
.task-bar {
  position: absolute;
  z-index: 1;
  top: 21px;
  height: 23px;
  border-radius: 6px;
  padding: 3px 7px;
  display: flex;
  justify-content: space-between;
  gap: 6px;
  align-items: center;
  color: white;
  font-size: 11px;
  overflow: hidden;
  box-shadow: 0 2px 5px #263e7a25;
}
.task-not-started {
  background: #64748b;
}
.task-in-progress {
  background: #4f46e5;
}
.task-in-review {
  background: #8b5cf6;
}
.task-completed {
  background: #16a34a;
}
.task-blocked {
  background: #dc2626;
}
.task-title,
.task-progress {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-progress {
  font-weight: 700;
}
.completion-value {
  font-weight: 700;
  font-size: 13px;
}
.empty-timeline {
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
