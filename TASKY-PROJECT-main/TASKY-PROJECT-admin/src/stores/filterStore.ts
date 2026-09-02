/**
 * Filter Store
 * 
 * Responsibilities:
 * - Global filters
 * - URL sync
 * - Saved filters
 * - Filter builder
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import FilterEngine, {
  type FilterGroup,
  type FilterCondition,
  type FilterPreset,
} from '@/services/performance/FilterEngine';
import * as performanceApi from '@/services/performance/performanceApi';

export const useFilterStore = defineStore('filter', () => {
  // State
  const currentFilter = ref<FilterGroup>(FilterEngine.createEmptyFilter());
  const savedPresets = ref<FilterPreset[]>([]);
  const currentPresetId = ref<string | null>(null);
  const isFilterBuilderOpen = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Page-specific filter states
  const pageFilters = ref<Record<string, FilterGroup>>({});

  // Computed
  const hasActiveFilters = computed(() => currentFilter.value.conditions.length > 0);
  const currentPreset = computed(() =>
    savedPresets.value.find((p) => p.id === currentPresetId.value)
  );
  const favoritePresets = computed(() =>
    savedPresets.value.filter((p) => p.isFavorite)
  );
  const sharedPresets = computed(() =>
    savedPresets.value.filter((p) => p.isShared)
  );

  // Actions
  function setFilter(filter: FilterGroup) {
    if (FilterEngine.validateFilter(filter)) {
      currentFilter.value = filter;
    } else {
      console.error('Invalid filter structure');
    }
  }

  function addCondition(condition: FilterCondition) {
    currentFilter.value = FilterEngine.addCondition(currentFilter.value, condition);
  }

  function removeCondition(index: number) {
    currentFilter.value = FilterEngine.removeCondition(currentFilter.value, index);
  }

  function updateCondition(index: number, condition: FilterCondition) {
    currentFilter.value = FilterEngine.updateCondition(currentFilter.value, index, condition);
  }

  function clearFilter() {
    currentFilter.value = FilterEngine.createEmptyFilter();
    currentPresetId.value = null;
  }

  function setPageFilter(pageType: string, filter: FilterGroup) {
    pageFilters.value[pageType] = filter;
  }

  function getPageFilter(pageType: string): FilterGroup {
    return pageFilters.value[pageType] || FilterEngine.createEmptyFilter();
  }

  function syncWithURL() {
    // Check URL for filter parameter
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam) {
      const filter = FilterEngine.deserializeFromURL(filterParam);
      if (filter) {
        setFilter(filter);
      }
    }
  }

  function updateURL() {
    if (hasActiveFilters.value) {
      const url = new URL(window.location.href);
      url.searchParams.set('filter', FilterEngine.serializeToURL(currentFilter.value));
      window.history.replaceState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('filter');
      window.history.replaceState({}, '', url.toString());
    }
  }

  async function loadPresets(pageType: string) {
    loading.value = true;
    error.value = null;
    try {
      // Try to load from API first
      const apiPresets = await performanceApi.getFilterPresets(pageType);
      // Convert API presets to FilterEngine format
      savedPresets.value = apiPresets.map((p) => ({
        ...p,
        filterJson: p.filterJson as FilterGroup,
      }));

      // Also load from localStorage as fallback
      FilterEngine.loadFromLocalStorage(pageType);
      const localState = FilterEngine.getFilterState(pageType);
      if (localState.savedPresets.length > 0) {
        // Merge local presets with API presets
        const localIds = new Set(savedPresets.value.map((p) => p.id));
        localState.savedPresets.forEach((preset) => {
          if (!localIds.has(preset.id!)) {
            savedPresets.value.push(preset);
          }
        });
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to load presets:', err);
      // Fallback to localStorage only
      FilterEngine.loadFromLocalStorage(pageType);
      const localState = FilterEngine.getFilterState(pageType);
      savedPresets.value = localState.savedPresets;
    } finally {
      loading.value = false;
    }
  }

  async function savePreset(preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    error.value = null;
    try {
      // Save to API
      const apiPreset = await performanceApi.createFilterPreset(preset);
      
      // Convert API preset to FilterEngine format
      const convertedPreset: FilterPreset = {
        ...apiPreset,
        filterJson: apiPreset.filterJson as FilterGroup,
      };

      // Also save to localStorage as backup
      FilterEngine.savePreset(preset.pageType, {
        ...preset,
        id: convertedPreset.id,
        createdAt: convertedPreset.createdAt,
        updatedAt: convertedPreset.updatedAt,
      });

      // Update local state
      const existingIndex = savedPresets.value.findIndex((p) => p.id === convertedPreset.id);
      if (existingIndex >= 0) {
        savedPresets.value[existingIndex] = convertedPreset;
      } else {
        savedPresets.value.push(convertedPreset);
      }

      return convertedPreset;
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to save preset:', err);
      // Fallback to localStorage only
      const localPreset: FilterPreset = {
        ...preset,
        id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      FilterEngine.savePreset(preset.pageType, localPreset);
      savedPresets.value.push(localPreset);
      return localPreset;
    } finally {
      loading.value = false;
    }
  }

  async function updatePreset(id: string, updates: Partial<FilterPreset>) {
    loading.value = true;
    error.value = null;
    try {
      // Update in API
      const apiPreset = await performanceApi.updateFilterPreset(id, updates);

      // Convert API preset to FilterEngine format
      const convertedPreset: FilterPreset = {
        ...apiPreset,
        filterJson: apiPreset.filterJson as FilterGroup,
      };

      // Update in localStorage
      const preset = savedPresets.value.find((p) => p.id === id);
      if (preset) {
        FilterEngine.savePreset(preset.pageType, { ...preset, ...convertedPreset });
      }

      // Update local state
      const index = savedPresets.value.findIndex((p) => p.id === id);
      if (index >= 0) {
        savedPresets.value[index] = convertedPreset;
      }

      return convertedPreset;
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to update preset:', err);
      // Fallback to localStorage only
      const preset = savedPresets.value.find((p) => p.id === id);
      if (preset) {
        const localPreset = { ...preset, ...updates, updatedAt: new Date().toISOString() };
        FilterEngine.savePreset(preset.pageType, localPreset);
        const index = savedPresets.value.findIndex((p) => p.id === id);
        if (index >= 0) {
          savedPresets.value[index] = localPreset;
        }
        return localPreset;
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deletePreset(id: string, pageType: string) {
    loading.value = true;
    error.value = null;
    try {
      // Delete from API
      await performanceApi.deleteFilterPreset(id);
      
      // Delete from localStorage
      FilterEngine.deletePreset(pageType, id);
      
      // Update local state
      savedPresets.value = savedPresets.value.filter((p) => p.id !== id);
      
      if (currentPresetId.value === id) {
        currentPresetId.value = null;
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to delete preset:', err);
      // Fallback to localStorage only
      FilterEngine.deletePreset(pageType, id);
      savedPresets.value = savedPresets.value.filter((p) => p.id !== id);
      if (currentPresetId.value === id) {
        currentPresetId.value = null;
      }
    } finally {
      loading.value = false;
    }
  }

  function loadPreset(id: string, pageType: string) {
    const preset = savedPresets.value.find((p) => p.id === id);
    if (preset) {
      setFilter(preset.filterJson as FilterGroup);
      currentPresetId.value = id;
      setPageFilter(pageType, preset.filterJson as FilterGroup);
      updateURL();
    }
  }

  function toggleFilterBuilder() {
    isFilterBuilderOpen.value = !isFilterBuilderOpen.value;
  }

  function closeFilterBuilder() {
    isFilterBuilderOpen.value = false;
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    currentFilter.value = FilterEngine.createEmptyFilter();
    savedPresets.value = [];
    currentPresetId.value = null;
    isFilterBuilderOpen.value = false;
    loading.value = false;
    error.value = null;
    pageFilters.value = {};
  }

  return {
    // State
    currentFilter,
    savedPresets,
    currentPresetId,
    isFilterBuilderOpen,
    loading,
    error,
    pageFilters,

    // Computed
    hasActiveFilters,
    currentPreset,
    favoritePresets,
    sharedPresets,

    // Actions
    setFilter,
    addCondition,
    removeCondition,
    updateCondition,
    clearFilter,
    setPageFilter,
    getPageFilter,
    syncWithURL,
    updateURL,
    loadPresets,
    savePreset,
    updatePreset,
    deletePreset,
    loadPreset,
    toggleFilterBuilder,
    closeFilterBuilder,
    clearError,
    reset,
  };
});
