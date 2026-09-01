<template>
  <div class="global-filter-bar q-pb-md">
    <div class="row items-center q-gutter-md">
      <!-- Time Period Filter -->
      <q-select
        v-model="filters.timePeriod"
        :options="timePeriodOptions"
        label="Time Period"
        outlined
        dense
        style="min-width: 150px"
        emit-value
        map-options
        @update:model-value="handleFilterChange"
      />

      <!-- Date Range Filter -->
      <q-input
        v-model="filters.dateRange"
        label="Date Range"
        outlined
        dense
        readonly
        style="min-width: 200px"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="filters.dateRange" range />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <!-- Project Filter -->
      <q-select
        v-model="filters.project"
        :options="projectOptions"
        label="Project"
        outlined
        dense
        clearable
        style="min-width: 180px"
        emit-value
        map-options
        :loading="loadingProjects"
        @update:model-value="handleFilterChange"
      />

      <!-- Team Filter -->
      <q-select
        v-model="filters.team"
        :options="teamOptions"
        label="Team"
        outlined
        dense
        clearable
        style="min-width: 150px"
        emit-value
        map-options
        :loading="loadingTeams"
        @update:model-value="handleFilterChange"
      />

      <!-- Priority Filter -->
      <q-select
        v-model="filters.priority"
        :options="priorityOptions"
        label="Priority"
        outlined
        dense
        clearable
        style="min-width: 120px"
        emit-value
        map-options
        @update:model-value="handleFilterChange"
      />

      <!-- Status Filter -->
      <q-select
        v-model="filters.status"
        :options="statusOptions"
        label="Status"
        outlined
        dense
        clearable
        style="min-width: 150px"
        emit-value
        map-options
        @update:model-value="handleFilterChange"
      />

      <!-- More Filters Button -->
      <q-btn
        flat
        label="More Filters"
        icon="filter_list"
        @click="$emit('open-advanced-filters')"
      />

      <!-- Spacer -->
      <q-space />

      <!-- Saved Filters -->
      <q-btn
        flat
        round
        dense
        icon="bookmark_border"
        @click="$emit('open-saved-filters')"
      >
        <q-tooltip>Save Filters</q-tooltip>
      </q-btn>

      <!-- Clear Filters -->
      <q-btn
        flat
        round
        dense
        icon="clear"
        :disable="!hasActiveFilters"
        @click="handleClearFilters"
      >
        <q-tooltip>Clear Filters</q-tooltip>
      </q-btn>
    </div>

    <!-- Active Filter Chips -->
    <div v-if="hasActiveFilters" class="row q-gutter-sm q-mt-md">
      <q-chip
        v-for="(value, key) in activeFilterChips"
        :key="key"
        removable
        @remove="removeFilter(key)"
        icon="filter_alt"
        color="primary"
        text-color="white"
        size="md"
      >
        {{ getFilterLabel(key) }}: {{ getFilterValueLabel(key, value) }}
      </q-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as performanceApi from '@/services/performance/performanceApi';

interface FilterValues {
  timePeriod: string;
  dateRange: string;
  project: string;
  team: string;
  priority: string;
  status: string;
}

interface Props {
  pageType: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'filter-change': [filters: Record<string, any>];
  'open-advanced-filters': [];
  'open-saved-filters': [];
}>();

const filters = ref<FilterValues>({
  timePeriod: 'this_month',
  dateRange: '',
  project: '',
  team: '',
  priority: '',
  status: '',
});

const loadingProjects = ref(false);
const loadingTeams = ref(false);

const timePeriodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom', value: 'custom' },
];

const projectOptions = ref<Array<{ label: string; value: string }>>([]);
const teamOptions = ref<Array<{ label: string; value: string }>>([]);
const priorityOptions = ref<Array<{ label: string; value: string }>>([]);
const statusOptions = ref<Array<{ label: string; value: string }>>([]);

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some((value) => value !== '' && value !== 'this_month');
});

const activeFilterChips = computed(() => {
  const chips: Record<string, any> = {};
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== '' && value !== 'this_month') {
      chips[key] = value;
    }
  });
  return chips;
});

async function loadMetadata() {
  try {
    loadingProjects.value = true;
    loadingTeams.value = true;

    const [projects, teams, priorities, statuses] = await Promise.all([
      performanceApi.getProjects(),
      performanceApi.getTeams(),
      performanceApi.getPriorities(),
      performanceApi.getStatuses(),
    ]);

    projectOptions.value = projects.map((p) => ({ label: p.name, value: p.id }));
    teamOptions.value = teams.map((t) => ({ label: t.name, value: t.id }));
    priorityOptions.value = priorities.map((p) => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }));
    statusOptions.value = statuses.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '), value: s }));
  } catch (error) {
    console.error('Failed to load metadata:', error);
  } finally {
    loadingProjects.value = false;
    loadingTeams.value = false;
  }
}

function handleFilterChange() {
  const activeFilters: Record<string, any> = {};
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== '' && value !== 'this_month') {
      activeFilters[key] = value;
    }
  });
  emit('filter-change', activeFilters);
}

function handleClearFilters() {
  filters.value = {
    timePeriod: 'this_month',
    dateRange: '',
    project: '',
    team: '',
    priority: '',
    status: '',
  };
  emit('filter-change', {});
}

function removeFilter(key: string) {
  (filters.value as any)[key] = key === 'timePeriod' ? 'this_month' : '';
  handleFilterChange();
}

function getFilterLabel(key: string): string {
  const labels: Record<string, string> = {
    timePeriod: 'Time Period',
    dateRange: 'Date Range',
    project: 'Project',
    team: 'Team',
    priority: 'Priority',
    status: 'Status',
  };
  return labels[key] || key;
}

function getFilterValueLabel(key: string, value: string): string {
  const optionsMap: Record<string, any> = {
    timePeriod: timePeriodOptions,
    project: projectOptions.value,
    team: teamOptions.value,
    priority: priorityOptions.value,
    status: statusOptions.value,
  };

  const options = optionsMap[key];
  if (options) {
    const option = options.find((opt: any) => opt.value === value);
    return option ? option.label : value;
  }

  return value;
}

onMounted(() => {
  loadMetadata();
});
</script>

<style scoped>
.global-filter-bar {
  border-bottom: 1px solid #e0e0e0;
}
</style>
