<template>
  <div class="row items-center justify-between q-mb-md" style="flex: 0 0 auto">
    <div class="row items-center q-gutter-x-sm">
      <q-select
        v-for="filter in filters"
        :key="filter.key"
        v-model="filterValues[filter.key]"
        outlined
        dense
        :options="filter.options"
        :style="{ width: filter.width }"
        bg-color="white"
        rounded
        emit-value
        map-options
        @update:model-value="handleFilterChange(filter.key)"
      >
        <template v-slot:prepend v-if="filter.icon">
          <q-icon :name="filter.icon" size="18px" />
        </template>
      </q-select>
    </div>

    <div class="row items-center q-gutter-x-sm">
      <q-btn
        v-if="hasActiveFilters"
        flat
        :color="clearButtonColor"
        :icon="clearButtonIcon"
        :label="clearButtonLabel"
        :no-caps="clearButtonNoCaps"
        :size="clearButtonSize"
        :class="clearButtonClass"
        @click="handleClearFilters"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Props
interface FilterOption {
  label: string;
  value: string | number;
}

interface Filter {
  key: string;
  options: FilterOption[];
  width?: string;
  icon?: string;
}

interface Props {
  filters: Filter[];
  modelValue: Record<string, string | number>;
  clearButtonColor?: string;
  clearButtonIcon?: string;
  clearButtonLabel?: string;
  clearButtonNoCaps?: boolean;
  clearButtonSize?: string;
  clearButtonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  clearButtonColor: 'grey-7',
  clearButtonIcon: 'o_filter_alt_off',
  clearButtonLabel: 'Clear Filters',
  clearButtonNoCaps: true,
  clearButtonSize: 'sm',
  clearButtonClass: 'bg-white rounded-borders q-px-sm',
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string | number>];
  'filter-change': [key: string, value: string | number];
  'clear-filters': [];
}>();

const filterValues = ref<Record<string, string | number>>({ ...props.modelValue });

const hasActiveFilters = computed(() => {
  return Object.values(filterValues.value).some(
    (value) => value !== 'all' && value !== '' && value !== null,
  );
});

const handleFilterChange = (key: string) => {
  emit('update:modelValue', { ...filterValues.value });
  emit('filter-change', key, filterValues.value[key] as string | number);
};

const handleClearFilters = () => {
  const clearedValues: Record<string, string | number> = {};
  props.filters.forEach((filter) => {
    clearedValues[filter.key] = 'all';
  });
  filterValues.value = clearedValues;
  emit('update:modelValue', clearedValues);
  emit('clear-filters');
};

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    filterValues.value = { ...newValue };
  },
  { deep: true },
);
</script>
