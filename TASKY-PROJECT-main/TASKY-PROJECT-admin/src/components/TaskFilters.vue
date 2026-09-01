<template>
  <div class="row items-center q-gutter-sm q-mb-md">
    <q-input
      :model-value="searchQuery"
      outlined
      dense
      rounded
      bg-color="white"
      placeholder="Search tasks..."
      style="width: 300px"
      @update:model-value="$emit('search', $event)"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-select
      :model-value="selectedProject"
      outlined
      dense
      :options="projectOptions"
      label="Project"
      style="width: 170px"
      bg-color="white"
      rounded
      emit-value
      map-options
      @update:model-value="$emit('project-change', $event)"
    />

    <q-select
      :model-value="selectedPriority"
      outlined
      dense
      :options="priorityOptions"
      label="Priority"
      style="width: 170px"
      bg-color="white"
      rounded
      emit-value
      map-options
      @update:model-value="$emit('priority-change', $event)"
    />

    <q-select
      :model-value="selectedStatus"
      outlined
      dense
      :options="statusOptions"
      label="Status"
      style="width: 170px"
      bg-color="white"
      rounded
      emit-value
      map-options
      @update:model-value="$emit('status-change', $event)"
    />

    <q-btn
      v-if="hasActiveFilters"
      flat
      color="grey-7"
      icon="o_filter_alt_off"
      label="Clear Filters"
      no-caps
      size="sm"
      class="bg-white rounded-borders q-px-sm"
      style="border: 1px solid #e0e0e0"
      @click="$emit('clear-filters')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  searchQuery: string;
  selectedProject: string;
  selectedPriority: string;
  selectedStatus: string;
  projects: Array<{ label: string; value: string }>;
}

const props = defineProps<Props>();

defineEmits(['search', 'project-change', 'priority-change', 'status-change', 'clear-filters']);

const projectOptions = computed(() => [
  { label: 'All Projects', value: 'All Projects' },
  ...props.projects,
]);

const priorityOptions = [
  { label: 'All Priorities', value: 'All Priorities' },
  { label: 'Critical', value: 'Critical' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

const statusOptions = [
  { label: 'All Statuses', value: 'All Statuses' },
  { label: 'Not Started', value: 'Not Started' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Blocked', value: 'Blocked' },
];

const hasActiveFilters = computed(() => {
  return (
    props.searchQuery !== '' ||
    props.selectedProject !== 'All Projects' ||
    props.selectedPriority !== 'All Priorities' ||
    props.selectedStatus !== 'All Statuses'
  );
});
</script>
