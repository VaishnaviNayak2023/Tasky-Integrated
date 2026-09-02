<template>
  <q-page class="planner-page q-pa-md">
    <!-- =========================================================
         HEADER
    ========================================================= -->

    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Planner</div>
        <div class="text-caption text-grey-6">
          Plan your work and keep your daily updates on track.
        </div>
      </div>
      <StreakCard :streak="streak" />
    </div>

    <!-- =========================================================
         VIEW TOGGLE
    ========================================================= -->

    <q-btn-toggle
      v-model="activeView"
      unelevated
      toggle-color="primary"
      color="white"
      text-color="grey-7"
      class="view-toggle q-mb-md"
      :options="[
        {
          label: 'Calendar',
          value: 'calendar',
          icon: 'calendar_month',
        },
        {
          label: 'Daily Log',
          value: 'log',
          icon: 'edit_note',
        },
      ]"
    />

    <!-- =========================================================
         CALENDAR VIEW
    ========================================================= -->

    <template v-if="activeView === 'calendar'">
      <q-card flat bordered class="calendar-card">
        <!-- HEADER -->
        <CalendarToolbar
          kicker="WORK CALENDAR"
          :month-name="monthName"
          :current-year="currentYear"
          @previous="previousMonth"
          @today="goCalendarToday"
          @next="nextMonth"
        />

        <!-- MONTH STATS -->
        <div class="compact-stats q-px-md q-py-sm">
          <div class="compact-stat">
            <div class="stat-icon worked-stat">
              <q-icon name="check" size="15px" />
            </div>
            <div>
              <div class="stat-value">
                {{ monthlyWorkedDays }}
              </div>
              <div class="stat-label">Worked</div>
            </div>
          </div>
          <div class="compact-stat">
            <div class="stat-icon activity-stat">
              <q-icon name="task_alt" size="15px" />
            </div>
            <div>
              <div class="stat-value">
                {{ monthlyTaskCount }}
              </div>
              <div class="stat-label">Tasks</div>
            </div>
          </div>
          <div class="compact-stat">
            <div class="stat-icon hours-stat">
              <q-icon name="schedule" size="15px" />
            </div>
            <div>
              <div class="stat-value">{{ monthlyHours }}h</div>
              <div class="stat-label">Logged</div>
            </div>
          </div>
        </div>

        <!-- WEEK DAYS -->
        <div class="calendar-grid calendar-week-header q-px-md">
          <div
            v-for="day in weekDays"
            :key="day"
            class="calendar-weekday"
            :class="{
              'weekend-heading': day === 'SAT' || day === 'SUN',
            }"
          >
            {{ day }}
          </div>
        </div>

        <!-- CALENDAR -->

        <div class="calendar-grid calendar-body q-pa-md">
          <div
            v-for="day in calendarDays"
            :key="day.key"
            class="calendar-cell"
            :class="{
              'calendar-empty': !day.date,

              'weekend-cell': day.isWeekend && day.status === 'weekend',

              'worked-cell': day.status === 'worked',

              'leave-cell': day.status === 'leave',

              'holiday-cell': day.status === 'holiday',

              'today-cell': day.isToday,

              'selected-cell': selectedDate === day.date,
            }"
            @click="day.date ? selectCalendarDay(day) : null"
          >
            <template v-if="day.date">
              <div class="row items-center justify-between">
                <div
                  class="calendar-day-number"
                  :class="{
                    'today-number': day.isToday,
                  }"
                >
                  {{ day.dayNumber }}
                </div>

                <div v-if="day.isToday" class="today-pill">TODAY</div>
              </div>

              <!-- STATUS -->

              <div class="calendar-status" :class="statusClass(day.status)">
                <q-icon :name="statusIcon(day.status)" size="11px" />

                {{ statusLabel(day.status) }}
              </div>

              <!-- LOG COUNT -->

              <div v-if="day.workLogs.length" class="calendar-work-summary">
                <q-icon name="task_alt" size="12px" />

                {{ day.workLogs.length }}

                {{ day.workLogs.length === 1 ? 'task' : 'tasks' }}

                <span> · {{ totalHours(day.workLogs) }}h </span>
              </div>

              <!-- ACTIVITY -->

              <div v-if="day.workLogs.length" class="activity-dots">
                <span v-for="index in Math.min(day.workLogs.length, 4)" :key="index" />
              </div>
            </template>
          </div>
        </div>
      </q-card>

      <!-- =======================================================
           SELECTED DAY
      ======================================================== -->

      <div class="row q-col-gutter-md q-mt-md">
        <!-- STATUS -->

        <div class="col-12 col-md-5">
          <q-card flat bordered class="compact-info-card">
            <div class="q-pa-md">
              <div class="row items-center justify-between">
                <div>
                  <div class="section-kicker">SELECTED DAY</div>

                  <div class="selected-date">
                    {{ selectedDateFormatted }}
                  </div>
                </div>

                <q-btn
                  v-if="selectedDayStatus === 'worked'"
                  unelevated
                  dense
                  no-caps
                  color="primary"
                  icon="add"
                  label="Add Work"
                  @click="openAddWorkDialog"
                />
              </div>

              <!-- STATUS OPTIONS -->

              <div class="compact-status-grid q-mt-md">
                <div
                  v-for="option in dayStatusOptions"
                  :key="option.value"
                  class="compact-status-option"
                  :class="{
                    'compact-status-active': selectedDayStatus === option.value,
                  }"
                  @click="selectedDayStatus = option.value as DayStatus"
                >
                  <q-icon :name="option.icon" size="16px" />

                  <span>
                    {{ option.label }}
                  </span>
                </div>
              </div>

              <q-btn
                unelevated
                dense
                no-caps
                color="primary"
                class="full-width q-mt-md"
                label="Save Day Status"
                @click="saveDayStatus"
              />
            </div>
          </q-card>
        </div>

        <!-- ACTIVITY -->

        <div class="col-12 col-md-7">
          <q-card flat bordered class="compact-info-card">
            <div class="q-pa-md">
              <div class="row items-center justify-between">
                <div>
                  <div class="section-kicker">WORK ACTIVITY</div>

                  <div class="selected-date">
                    {{ selectedDayActivity.length }}
                    {{ selectedDayActivity.length === 1 ? 'task' : 'tasks' }}
                    logged
                  </div>
                </div>

                <div v-if="selectedDayActivity.length" class="text-caption text-grey-6">
                  {{ totalHours(selectedDayActivity) }}h total
                </div>
              </div>

              <div v-if="selectedDayActivity.length" class="compact-activity-list q-mt-sm">
                <div v-for="log in selectedDayActivity" :key="log.id" class="compact-activity-row">
                  <div class="activity-task-icon">
                    <q-icon name="task_alt" size="15px" />
                  </div>

                  <div class="col">
                    <div class="compact-task-name">
                      {{ log.taskTitle }}
                    </div>

                    <div class="text-caption text-grey-6">
                      {{ log.project }}
                    </div>
                  </div>

                  <div class="compact-progress">
                    <div class="text-caption">{{ log.progress }}%</div>

                    <q-linear-progress
                      :value="log.progress / 100"
                      rounded
                      color="primary"
                      size="4px"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="compact-empty">
                <q-icon name="event_note" size="25px" />

                <span> No work logged for this day </span>

                <q-btn
                  v-if="selectedDayStatus === 'worked'"
                  flat
                  dense
                  no-caps
                  color="primary"
                  label="Add Work"
                  @click="openAddWorkDialog"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </template>

    <!-- =========================================================
         DAILY LOG
    ========================================================= -->

    <template v-else>
      <q-card flat bordered class="planner-card q-pa-md">
        <div class="row items-center justify-between">
          <div>
            <div class="section-kicker">DAILY WORK LOG</div>

            <div class="selected-date">
              {{ selectedDateFormatted }}
            </div>

            <div class="text-caption text-grey-6">
              Update today's work or recover missed updates from the previous 7 days.
            </div>
          </div>

          <div class="row items-center q-gutter-xs">
            <q-btn flat round dense icon="chevron_left" @click="previousLogDate" />

            <q-btn outline dense no-caps color="primary" label="Today" @click="goToday" />

            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              :disable="isTodaySelected"
              @click="nextLogDate"
            />
          </div>
        </div>

        <!-- DATE STRIP -->

        <div class="date-strip q-mt-md">
          <div
            v-for="date in availableLogDates"
            :key="date"
            class="date-chip"
            :class="{
              'date-chip-active': selectedDate === date,
            }"
            @click="selectLogDate(date)"
          >
            <div class="text-caption">
              {{ getShortDay(date) }}
            </div>

            <div class="date-chip-number">
              {{ getShortDate(date) }}
            </div>

            <q-icon v-if="hasUpdated(date)" name="check_circle" size="13px" />
          </div>
        </div>
      </q-card>

      <!-- REMINDER -->

      <q-banner v-if="showReminder" rounded class="reminder-banner q-mt-md">
        <template #avatar>
          <q-icon name="notifications_active" color="orange" size="22px" />
        </template>

        <div>
          <div class="text-weight-bold">Work update missing</div>

          <div class="text-caption">
            This day is marked as working, but no work has been recorded.
          </div>
        </div>
      </q-banner>

      <!-- ACTIVE TASKS -->

      <div class="row items-center justify-between q-mt-lg">
        <div>
          <div class="section-title">ACTIVE TASKS</div>

          <div class="text-caption text-grey-6">Tasks that need an update.</div>
        </div>

        <!-- IMPORTANT:
             For previous dates this allows
             adding work manually.
        -->

        <q-btn
          v-if="!isTodaySelected"
          unelevated
          dense
          no-caps
          color="primary"
          icon="add"
          label="Add Work Entry"
          @click="openAddWorkDialog"
        />
      </div>

      <!-- TASKS -->

      <div v-if="activeTasks.length" class="q-mt-sm">
        <q-card
          v-for="task in activeTasks"
          :key="task.id"
          flat
          bordered
          class="compact-task-card q-mb-sm"
        >
          <div class="q-pa-md">
            <div class="row items-center">
              <div class="task-title">
                {{ task.title }}
              </div>

              <q-badge
                class="q-ml-sm"
                :color="priorityColor(task.priority)"
                :label="task.priority"
              />

              <q-space />

              <q-badge outline color="primary" :label="task.status" />
            </div>

            <div class="text-caption text-grey-6">
              {{ task.project }}
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <!-- STATUS -->

              <div class="col-12 col-md-3">
                <q-select
                  v-model="task.status"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="taskStatusOptions"
                  option-label="label"
                  option-value="value"
                  label="Status"
                />
              </div>

              <!-- PROGRESS -->

              <div class="col-12 col-md-5">
                <div class="progress-label">
                  <span> Progress </span>

                  <span> {{ task.progress }}% </span>
                </div>

                <q-slider
                  v-model="task.progress"
                  :min="0"
                  :max="100"
                  :step="5"
                  color="primary"
                  dense
                />
              </div>

              <!-- NOTE -->

              <div class="col-12 col-md-4">
                <q-input v-model="task.note" outlined dense placeholder="Short work note..." />
              </div>
            </div>

            <!-- SUBTASKS -->

            <div class="compact-subtasks q-mt-sm">
              <div v-for="subtask in task.subtasks" :key="subtask.id" class="compact-subtask">
                <q-checkbox
                  v-model="subtask.completed"
                  dense
                  color="primary"
                  :label="subtask.title"
                />
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- EMPTY -->

      <q-card v-else flat bordered class="empty-card q-mt-sm">
        <q-icon name="task_alt" size="32px" color="primary" />

        <div class="text-weight-bold q-mt-sm">No work entries yet</div>

        <div class="text-caption text-grey-6">Add work that you completed on this day.</div>

        <q-btn
          unelevated
          dense
          no-caps
          color="primary"
          icon="add"
          label="Add Work Entry"
          class="q-mt-md"
          @click="openAddWorkDialog"
        />
      </q-card>

      <!-- SAVE -->

      <div v-if="activeTasks.length" class="row justify-end q-mt-md">
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="save"
          label="Save Updates"
          @click="saveAllUpdates"
        />
      </div>
    </template>

    <!-- =========================================================
         ADD WORK DIALOG
    ========================================================= -->

    <q-dialog v-model="showAddWorkDialog">
      <q-card class="add-work-dialog">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Add Work Entry</div>

              <div class="text-caption text-grey-6">
                {{ selectedDateFormatted }}
              </div>
            </div>

            <q-btn flat round icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input v-model="newWorkEntry.title" outlined dense label="Task title" />

          <q-input v-model="newWorkEntry.project" outlined dense label="Project" class="q-mt-sm" />

          <div class="row q-col-gutter-sm q-mt-xs">
            <div class="col-6">
              <q-select
                v-model="newWorkEntry.status"
                outlined
                dense
                label="Status"
                :options="taskStatusOptions"
                emit-value
                map-options
                option-label="label"
                option-value="value"
              />
            </div>

            <div class="col-6">
              <q-select
                v-model="newWorkEntry.priority"
                outlined
                dense
                label="Priority"
                :options="priorityOptions"
              />
            </div>
          </div>

          <div class="q-mt-sm">
            <div class="field-label">Progress: {{ newWorkEntry.progress }}%</div>

            <q-slider
              v-model="newWorkEntry.progress"
              :min="0"
              :max="100"
              :step="5"
              color="primary"
              dense
            />
          </div>

          <q-input
            v-model="newWorkEntry.note"
            outlined
            dense
            type="textarea"
            autogrow
            label="Work done"
            class="q-mt-sm"
          />

          <q-input
            v-model.number="newWorkEntry.hours"
            outlined
            dense
            type="number"
            label="Hours worked"
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancel" v-close-popup />

          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Add Work Entry"
            :disable="!newWorkEntry.title?.trim()"
            @click="addWorkEntry"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================================================
         SAVED DIALOG
    ========================================================= -->

    <q-dialog v-model="showSavedDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="text-center">
          <q-icon name="check_circle" color="positive" size="45px" />

          <div class="text-h6 text-weight-bold q-mt-sm">Updates Saved</div>

          <div class="text-caption text-grey-6 q-mt-xs">Your work log has been updated.</div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat no-caps color="primary" label="Done" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import StreakCard from '@/components/StreakCard.vue';
import CalendarToolbar from '@/components/CalendarToolbar.vue';
import { useAuthStore } from '@/stores/authStore';

/* ============================================================
   TYPES
============================================================ */

type DayStatus = 'worked' | 'leave' | 'holiday' | 'weekend' | 'no-entry';

type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface WorkLog {
  id: number;
  taskTitle: string;
  title?: string;
  project: string;
  progress: number;
  hours: number;
  note: string;
  status?: TaskStatus;
  priority?: string;
}

interface Task {
  id: number;
  title: string;
  project: string;
  priority: string;
  status: TaskStatus;
  progress: number;
  note: string;
  subtasks: Subtask[];
}

interface CalendarDay {
  key: string;
  date: string;
  dayNumber: number;
  isWeekend: boolean;
  isToday: boolean;
  status: DayStatus;
  workLogs: WorkLog[];
}

/* ============================================================
   CONSTANTS
============================================================ */

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const taskStatusOptions = [
  {
    label: 'Pending',
    value: 'Pending',
  },
  {
    label: 'In Progress',
    value: 'In Progress',
  },
  {
    label: 'Completed',
    value: 'Completed',
  },
  {
    label: 'Blocked',
    value: 'Blocked',
  },
];

const priorityOptions = ['Low', 'Medium', 'High'];

const dayStatusOptions = [
  {
    label: 'Worked',
    value: 'worked',
    icon: 'check_circle',
  },
  {
    label: 'Leave',
    value: 'leave',
    icon: 'event_busy',
  },
  {
    label: 'Holiday',
    value: 'holiday',
    icon: 'celebration',
  },
  {
    label: 'Weekend',
    value: 'weekend',
    icon: 'weekend',
  },
];

/* ============================================================
   TODAY
============================================================ */

const today = new Date();

const todayString = formatDate(today);

/* ============================================================
   VIEW
============================================================ */

const activeView = ref<'calendar' | 'log'>('calendar');

/* ============================================================
   CALENDAR MONTH
============================================================ */

const calendarMonth = ref(today.getMonth());

const calendarYear = ref(today.getFullYear());

/* ============================================================
   SELECTED DATE
============================================================ */

const selectedDate = ref(todayString);

const selectedDayStatus = ref<DayStatus>('worked');

/* ============================================================
   STREAK
============================================================ */

const streak = ref(5);

/* ============================================================
   WORK LOG STORAGE
============================================================ */

/*
  This object acts as your temporary frontend database.

  Later this can be replaced by:
  Pinia store
  +
  Node.js API
  +
  MySQL
*/

const workLogs = ref<Record<string, WorkLog[]>>({});

/* ============================================================
   DAY STATUS STORAGE
============================================================ */

const dayStatuses = ref<Record<string, DayStatus>>({});

/* ============================================================
   TASKS
============================================================ */

const tasks = ref<Task[]>([]);

const { user } = useAuthStore();

// Fetch tasks from database
const fetchTasks = async () => {
  if (!user?.id) {
    // Fallback to mock data if no user
    tasks.value = [
      {
        id: 1,
        title: 'Vehicle booking API',
        project: 'wheelO',
        priority: 'High',
        status: 'In Progress',
        progress: 70,
        note: '',
        subtasks: [],
      },
      {
        id: 2,
        title: 'Dashboard UI',
        project: 'wheelO',
        priority: 'Medium',
        status: 'In Progress',
        progress: 45,
        note: '',
        subtasks: [],
      },
    ];
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/tasks/employee/${user.id}`);
    const result = await response.json();

    if (result.success && result.tasks) {
      tasks.value = result.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        project: task.project_name || 'Unknown',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        progress: parseFloat(task.progress) || 0,
        note: task.description || '',
        subtasks: [],
      }));
    } else {
      // Fallback to mock data on error
      tasks.value = [
        {
          id: 1,
          title: 'Vehicle booking API',
          project: 'wheelO',
          priority: 'High',
          status: 'In Progress',
          progress: 70,
          note: '',
          subtasks: [],
        },
      ];
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Fallback to mock data on error
    tasks.value = [
      {
        id: 1,
        title: 'Vehicle booking API',
        project: 'wheelO',
        priority: 'High',
        status: 'In Progress',
        progress: 70,
        note: '',
        subtasks: [],
      },
    ];
  }
};

// Fetch work logs from database
const fetchWorkLogs = async () => {
  if (!user?.id) {
    // Fallback to empty object if no user
    workLogs.value = {};
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/work-logs/${user.id}/calendar`,
    );
    const result = await response.json();

    if (result.success && result.logs) {
      // Group work logs by date
      const logsByDate: Record<string, WorkLog[]> = {};
      result.logs.forEach((log: any) => {
        const date = log.log_date;
        if (!logsByDate[date]) {
          logsByDate[date] = [];
        }
        logsByDate[date].push({
          id: log.id,
          taskTitle: log.task_title || log.task_title,
          project: log.project_name || log.project || '',
          progress: parseFloat(log.progress) || 0,
          hours: parseFloat(log.hours_spent) || 0,
          note: log.notes || '',
        });
      });
      workLogs.value = logsByDate;
    } else {
      // Fallback to empty object on error
      workLogs.value = {};
    }
  } catch (error) {
    console.error('Error fetching work logs:', error);
    // Fallback to empty object on error
    workLogs.value = {};
  }
};

// Fetch data on mount
onMounted(() => {
  fetchTasks();
  fetchWorkLogs();
});

/* ============================================================
   ADD WORK
============================================================ */

const showAddWorkDialog = ref(false);

const newWorkEntry = ref<
  WorkLog & {
    priority: string;
    status: TaskStatus;
  }
>({
  id: 0,
  taskTitle: '',
  title: '',
  project: '',
  progress: 0,
  hours: 1,
  note: '',
  priority: 'Medium',
  status: 'Pending',
});

/* ============================================================
   SAVE DIALOG
============================================================ */

const showSavedDialog = ref(false);

/* ============================================================
   MONTH NAME
============================================================ */

const monthName = computed(() => {
  return monthNames[calendarMonth.value] || 'January';
});

const currentYear = computed(() => {
  return calendarYear.value;
});

/* ============================================================
   CALENDAR DAYS
============================================================ */

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = new Date(calendarYear.value, calendarMonth.value, 1);

  const lastDay = new Date(calendarYear.value, calendarMonth.value + 1, 0);

  /*
      JS:
      Sunday = 0
      Monday = 1

      Convert to:
      Monday = 0
      Sunday = 6
    */

  const firstWeekDay = (firstDay.getDay() + 6) % 7;

  const days: CalendarDay[] = [];

  /* EMPTY CELLS */

  for (let i = 0; i < firstWeekDay; i++) {
    days.push({
      key: `empty-${i}`,
      date: '',
      dayNumber: 0,
      isWeekend: false,
      isToday: false,
      status: 'weekend',
      workLogs: [],
    });
  }

  /* ACTUAL DAYS */

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(calendarYear.value, calendarMonth.value, day);

    const dateString = formatDate(date);

    const jsDay = date.getDay();

    const isWeekend = jsDay === 0 || jsDay === 6;

    const savedStatus = dayStatuses.value[dateString];

    const hasWorkLogs = workLogs.value[dateString] && workLogs.value[dateString].length > 0;

    const status: DayStatus =
      savedStatus ?? (hasWorkLogs ? 'worked' : isWeekend ? 'weekend' : 'no-entry');

    days.push({
      key: dateString,

      date: dateString,

      dayNumber: day,

      isWeekend,

      isToday: dateString === todayString,

      status,

      workLogs: workLogs.value[dateString] ?? [],
    });
  }

  return days;
});

/* ============================================================
   SELECTED ACTIVITY
============================================================ */

const selectedDayActivity = computed(() => {
  return workLogs.value[selectedDate.value] ?? [];
});

/* ============================================================
   SELECTED DATE FORMATTED
============================================================ */

const selectedDateFormatted = computed(() => {
  const date = parseDate(selectedDate.value);

  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

/* ============================================================
   ACTIVE TASKS
============================================================ */

const activeTasks = computed(() => {
  /*
          For the daily log we show only
          tasks that are not completed.
        */

  return tasks.value.filter((task) => task.status !== 'Completed');
});

/* ============================================================
   MONTHLY STATS
============================================================ */

const monthlyWorkedDays = computed(() => {
  return calendarDays.value.filter((day) => day.date && day.status === 'worked').length;
});

const monthlyTaskCount = computed(() => {
  return calendarDays.value.reduce((total, day) => total + day.workLogs.length, 0);
});

const monthlyHours = computed(() => {
  const hours = calendarDays.value.reduce(
    (total, day) => total + day.workLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0),
    0,
  );

  return hours.toFixed(1);
});

/* ============================================================
   SELECTED STATUS
============================================================ */

const selectedDayStatusComputed = computed(() => {
  if (dayStatuses.value[selectedDate.value]) {
    return dayStatuses.value[selectedDate.value];
  }

  const date = parseDate(selectedDate.value);

  const day = date.getDay();

  return day === 0 || day === 6 ? 'weekend' : 'worked';
});

/*
  Keep template-friendly value.
*/

watch(
  selectedDayStatusComputed,
  (value) => {
    if (value) {
      selectedDayStatus.value = value;
    }
  },
  {
    immediate: true,
  },
);

/* ============================================================
   LOG DATE RANGE
============================================================ */

const availableLogDates = computed(() => {
  const dates: string[] = [];

  const selected = parseDate(selectedDate.value);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(selected);

    date.setDate(selected.getDate() - i);

    dates.push(formatDate(date));
  }

  return dates;
});

/* ============================================================
   TODAY SELECTED
============================================================ */

const isTodaySelected = computed(() => {
  return selectedDate.value === todayString;
});

/* ============================================================
   REMINDER
============================================================ */

const showReminder = computed(() => {
  const status = dayStatuses.value[selectedDate.value] ?? selectedDayStatusComputed.value;

  const logs = workLogs.value[selectedDate.value] ?? [];

  return status === 'worked' && logs.length === 0;
});

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/* ============================================================
   PARSE DATE
============================================================ */

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

/* ============================================================
   CALENDAR NAVIGATION
============================================================ */

function previousMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11;

    calendarYear.value--;
  } else {
    calendarMonth.value--;
  }
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0;

    calendarYear.value++;
  } else {
    calendarMonth.value++;
  }
}

function goCalendarToday() {
  calendarMonth.value = today.getMonth();

  calendarYear.value = today.getFullYear();

  selectedDate.value = todayString;
}

/* ============================================================
   SELECT CALENDAR DAY
============================================================ */

function selectCalendarDay(day: CalendarDay) {
  selectedDate.value = day.date;

  selectedDayStatus.value = day.status;
}

/* ============================================================
   SAVE DAY STATUS
============================================================ */

function saveDayStatus() {
  dayStatuses.value[selectedDate.value] = selectedDayStatus.value;
}

/* ============================================================
   STATUS HELPERS
============================================================ */

function statusLabel(status: DayStatus): string {
  switch (status) {
    case 'worked':
      return 'Worked';

    case 'leave':
      return 'Leave';

    case 'holiday':
      return 'Holiday';

    case 'weekend':
      return 'Weekend';

    default:
      return 'Unknown';
  }
}

function statusIcon(status: DayStatus): string {
  switch (status) {
    case 'worked':
      return 'check_circle';

    case 'leave':
      return 'event_busy';

    case 'holiday':
      return 'celebration';

    case 'weekend':
      return 'weekend';

    default:
      return 'help';
  }
}

function statusClass(status: DayStatus): string {
  return `status-${status}`;
}

/* ============================================================
   WORK LOG HELPERS
============================================================ */

function totalHours(logs: WorkLog[]): string {
  const total = logs.reduce((sum, log) => sum + Number(log.hours || 0), 0);

  return total.toFixed(1);
}

/* ============================================================
   ADD WORK DIALOG
============================================================ */

function openAddWorkDialog() {
  newWorkEntry.value = {
    id: Date.now(),

    taskTitle: '',

    title: '',

    project: '',

    progress: 0,

    hours: 1,

    note: '',

    priority: 'Medium',

    status: 'Pending',
  };

  showAddWorkDialog.value = true;
}

/* ============================================================
   ADD WORK ENTRY
============================================================ */

function addWorkEntry() {
  const date = selectedDate.value;

  if (!workLogs.value[date]) {
    workLogs.value[date] = [];
  }

  workLogs.value[date].push({
    id: Date.now(),

    taskTitle: newWorkEntry.value.taskTitle,

    project: newWorkEntry.value.project,

    progress: newWorkEntry.value.progress,

    hours: Number(newWorkEntry.value.hours),

    note: newWorkEntry.value.note,
  });

  /*
      If employee adds work on weekend,
      automatically mark that day as worked.
    */

  dayStatuses.value[date] = 'worked';

  selectedDayStatus.value = 'worked';

  showAddWorkDialog.value = false;
}

/* ============================================================
   DATE LOG NAVIGATION
============================================================ */

function selectLogDate(date: string) {
  selectedDate.value = date;
}

function previousLogDate() {
  const date = parseDate(selectedDate.value);

  date.setDate(date.getDate() - 1);

  selectedDate.value = formatDate(date);
}

function nextLogDate() {
  if (isTodaySelected.value) {
    return;
  }

  const date = parseDate(selectedDate.value);

  date.setDate(date.getDate() + 1);

  const next = formatDate(date);

  /*
      Don't allow future dates.
    */

  if (next <= todayString) {
    selectedDate.value = next;
  }
}

function goToday() {
  selectedDate.value = todayString;
}

/* ============================================================
   DATE STRIP
============================================================ */

function getShortDay(dateString: string): string {
  return parseDate(dateString)
    .toLocaleDateString('en-IN', {
      weekday: 'short',
    })
    .toUpperCase();
}

function getShortDate(dateString: string): string {
  return parseDate(dateString).getDate().toString();
}

/* ============================================================
   UPDATED CHECK
============================================================ */

function hasUpdated(date: string): boolean {
  return (workLogs.value[date] ?? []).length > 0;
}

/* ============================================================
   PRIORITY COLOR
============================================================ */

function priorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'negative';

    case 'medium':
      return 'warning';

    case 'low':
      return 'positive';

    default:
      return 'primary';
  }
}

/* ============================================================
   SAVE ALL DAILY UPDATES
============================================================ */

function saveAllUpdates() {
  /*
      Here you will later call your backend API.

      Example:

      await axios.put(
        '/api/work-logs',
        {
          date: selectedDate.value,
          tasks: activeTasks.value
        }
      )
    */

  showSavedDialog.value = true;
}
</script>

<style scoped>
.planner-page {
  min-height: 100vh;
  background: var(--color-background);
}

.streak-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.view-toggle {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.calendar-card,
.planner-card,
.compact-info-card,
.compact-task-card,
.empty-card {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-lg);
}

.calendar-toolbar {
  min-height: 52px;
  border-bottom: 1px solid var(--color-border-light);
}

.calendar-kicker,
.section-kicker,
.section-title {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.09em;
  color: var(--color-text-secondary);
}

.calendar-month {
  font-size: 18px;
  font-weight: 750;
}

.compact-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 48px;
}

.compact-stat {
  display: flex;
  align-items: center;
  gap: 7px;
}

.stat-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
}

.worked-stat {
  color: var(--color-success);
  background: var(--color-success-light);
}

.activity-stat {
  color: var(--color-purple);
  background: var(--color-purple-light);
}

.hours-stat {
  color: var(--color-blue);
  background: var(--color-info-light);
}

.stat-value {
  font-size: 13px;
  font-weight: 750;
}

.stat-label {
  font-size: 9px;
  color: var(--color-text-muted);
}

.calendar-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.worked-dot {
  background: var(--color-success);
}

.leave-dot {
  background: var(--color-warning);
}

.holiday-dot {
  background: var(--color-blue);
}

.weekend-label {
  padding: 2px 5px;
  border-radius: 3px;
  background: #eeeeef;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.calendar-week-header {
  padding-top: 7px;
  padding-bottom: 7px;
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

.calendar-weekday {
  text-align: center;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: var(--color-text-secondary);
}

.weekend-heading {
  color: #aaaab2;
}

.calendar-cell {
  position: relative;
  min-height: 83px;
  padding: 8px 9px;
  border: 1px solid var(--color-border-light);
  border-radius: 7px;
  background: var(--color-surface);
  cursor: pointer;
  transition: 0.15s ease;
}

.calendar-cell:hover {
  transform: translateY(-1px);
  border-color: #c9c6f6;
  box-shadow: var(--shadow-sm);
}

.calendar-empty {
  visibility: hidden;
  pointer-events: none;
}

.weekend-cell {
  background: #f5f5f7;
}

.worked-cell {
  background: #fcfff9;
}

.worked-cell::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;
  width: 2px;
  border-radius: 0 3px 3px 0;
  background: var(--color-success);
}

.leave-cell {
  background: #fffaf0;
}

.holiday-cell {
  background: #f7f8ff;
}

.today-cell {
  border: 2px solid var(--color-purple);
}

.calendar-day-number {
  font-size: 14px;
  font-weight: 750;
}

.today-number {
  color: var(--color-purple);
}

.today-pill {
  padding: 2px 4px;
  border-radius: 3px;
  background: var(--color-purple-light);
  color: var(--color-purple);
  font-size: 7px;
  font-weight: 800;
}

.calendar-status {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 7px;
  padding: 3px 5px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 700;
}

.status-worked {
  color: var(--color-success);
  background: var(--color-success-light);
}

.status-weekend {
  color: #858691;
  background: #eaeaec;
}

.status-leave {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.status-holiday {
  color: var(--color-blue);
  background: var(--color-info-light);
}

.calendar-work-summary {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 6px;
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.calendar-work-summary span {
  color: var(--color-text-muted);
}

.activity-dots {
  display: flex;
  gap: 2px;
  margin-top: 5px;
}

.activity-dots span {
  width: 11px;
  height: 2px;
  border-radius: 3px;
  background: var(--color-purple);
}

.selected-cell {
  box-shadow: 0 0 0 2px rgba(116, 103, 240, 0.15);
}

.compact-info-card {
  min-height: 135px;
}

.selected-date {
  font-size: 16px;
  font-weight: 750;
}

.compact-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.compact-status-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 32px;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 9px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.compact-status-active {
  color: var(--color-purple);
  background: var(--color-purple-light);
  border-color: var(--color-purple);
  font-weight: 700;
}

.compact-activity-list {
  max-height: 105px;
  overflow-y: auto;
}

.compact-activity-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.activity-task-icon {
  width: 27px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--color-purple);
  background: var(--color-purple-light);
}

.compact-task-name {
  font-size: 12px;
  font-weight: 650;
}

.compact-progress {
  width: 75px;
}

.compact-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding-top: 18px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.date-strip {
  display: flex;
  gap: 5px;
}

.date-chip {
  min-width: 58px;
  padding: 6px;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  cursor: pointer;
  color: var(--color-text-secondary);
  background: var(--color-surface);
}

.date-chip-active {
  color: white;
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.date-chip-number {
  font-size: 15px;
  font-weight: 750;
}

.reminder-banner {
  color: var(--color-text);
  background: var(--color-warning-light);
  border: 1px solid #f7dda4;
}

.compact-task-card {
  transition: 0.15s ease;
}

.compact-task-card:hover {
  border-color: #d5d2f8;
  box-shadow: var(--shadow-sm);
}

.task-title {
  font-size: 16px;
  font-weight: 750;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 650;
  color: var(--color-text-secondary);
}

.compact-subtasks {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  padding-top: 5px;
  border-top: 1px solid var(--color-border-light);
}

.empty-card {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.add-work-dialog {
  width: 540px;
  max-width: 94vw;
  border-radius: var(--radius-lg);
}

.field-label {
  font-size: 11px;
  font-weight: 650;
  color: var(--color-text-secondary);
}

@media (max-width: 850px) {
  .calendar-cell {
    min-height: 75px;
    padding: 7px;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-legend {
    display: none;
  }
}

@media (max-width: 600px) {
  .planner-page {
    padding: 10px !important;
  }

  .streak-card {
    display: none;
  }

  .calendar-cell {
    min-height: 62px;
    padding: 5px;
  }

  .calendar-day-number {
    font-size: 12px;
  }

  .calendar-status {
    font-size: 7px;
  }

  .calendar-work-summary {
    font-size: 7px;
  }

  .activity-dots {
    display: none;
  }

  .compact-status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
