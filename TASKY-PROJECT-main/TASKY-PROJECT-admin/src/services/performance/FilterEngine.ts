/**
 * Enterprise Filter Engine
 * 
 * Responsibilities:
 * - Validation
 * - URL Serialization
 * - Query Generation
 * - Preset Storage
 * - Filter Hydration
 * - API Sync
 * - State Sync
 */

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
}

export interface FilterGroup {
  operator: 'AND' | 'OR';
  conditions: (FilterCondition | FilterGroup)[];
}

export interface FilterPreset {
  id?: string;
  name: string;
  pageType: string;
  isDefault: boolean;
  isFavorite: boolean;
  isShared: boolean;
  filterJson: FilterGroup;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterState {
  activeFilters: FilterGroup;
  savedPresets: FilterPreset[];
  currentPresetId: string | null;
}

class FilterEngine {
  private static instance: FilterEngine;
  private filterState: Map<string, FilterState> = new Map();

  private constructor() {}

  static getInstance(): FilterEngine {
    if (!FilterEngine.instance) {
      FilterEngine.instance = new FilterEngine();
    }
    return FilterEngine.instance;
  }

  /**
   * Validate filter structure
   */
  validateFilter(filter: FilterGroup): boolean {
    if (!filter || !filter.operator || !Array.isArray(filter.conditions)) {
      return false;
    }

    if (!['AND', 'OR'].includes(filter.operator)) {
      return false;
    }

    for (const condition of filter.conditions) {
      if ('operator' in condition) {
        // It's a FilterCondition
        if (!this.validateCondition(condition as FilterCondition)) {
          return false;
        }
      } else {
        // It's a nested FilterGroup
        if (!this.validateFilter(condition as FilterGroup)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate individual filter condition
   */
  private validateCondition(condition: FilterCondition): boolean {
    const validOperators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'starts_with', 'ends_with'];
    
    if (!condition.field || !condition.operator || condition.value === undefined) {
      return false;
    }

    if (!validOperators.includes(condition.operator)) {
      return false;
    }

    return true;
  }

  /**
   * Serialize filter to URL-safe string
   */
  serializeToURL(filter: FilterGroup): string {
    const encoded = btoa(JSON.stringify(filter));
    return encodeURIComponent(encoded);
  }

  /**
   * Deserialize filter from URL string
   */
  deserializeFromURL(urlString: string): FilterGroup | null {
    try {
      const decoded = decodeURIComponent(urlString);
      const filter = JSON.parse(atob(decoded));
      
      if (this.validateFilter(filter)) {
        return filter;
      }
      return null;
    } catch (error) {
      console.error('Failed to deserialize filter from URL:', error);
      return null;
    }
  }

  /**
   * Convert filter to API query parameters
   */
  toQueryParams(filter: FilterGroup): Record<string, any> {
    const params: Record<string, any> = {};
    
    const processCondition = (condition: FilterCondition, prefix = '') => {
      const key = prefix ? `${prefix}.${condition.field}` : condition.field;
      
      switch (condition.operator) {
        case 'eq':
          params[key] = condition.value;
          break;
        case 'ne':
          params[`${key}__ne`] = condition.value;
          break;
        case 'gt':
          params[`${key}__gt`] = condition.value;
          break;
        case 'gte':
          params[`${key}__gte`] = condition.value;
          break;
        case 'lt':
          params[`${key}__lt`] = condition.value;
          break;
        case 'lte':
          params[`${key}__lte`] = condition.value;
          break;
        case 'in':
          params[`${key}__in`] = Array.isArray(condition.value) ? condition.value.join(',') : condition.value;
          break;
        case 'not_in':
          params[`${key}__not_in`] = Array.isArray(condition.value) ? condition.value.join(',') : condition.value;
          break;
        case 'contains':
          params[`${key}__contains`] = condition.value;
          break;
        case 'starts_with':
          params[`${key}__starts_with`] = condition.value;
          break;
        case 'ends_with':
          params[`${key}__ends_with`] = condition.value;
          break;
      }
    };

    const processGroup = (group: FilterGroup, prefix = '') => {
      if (group.operator === 'AND') {
        group.conditions.forEach((condition) => {
          if ('operator' in condition) {
            processCondition(condition as FilterCondition, prefix);
          } else {
            processGroup(condition as FilterGroup, prefix);
          }
        });
      } else {
        // For OR groups, we might need special handling
        // For now, we'll just process all conditions
        group.conditions.forEach((condition) => {
          if ('operator' in condition) {
            processCondition(condition as FilterCondition, prefix);
          } else {
            processGroup(condition as FilterGroup, prefix);
          }
        });
      }
    };

    processGroup(filter);
    return params;
  }

  /**
   * Get filter state for a page
   */
  getFilterState(pageType: string): FilterState {
    if (!this.filterState.has(pageType)) {
      this.filterState.set(pageType, {
        activeFilters: { operator: 'AND', conditions: [] },
        savedPresets: [],
        currentPresetId: null,
      });
    }
    return this.filterState.get(pageType)!;
  }

  /**
   * Set filter state for a page
   */
  setFilterState(pageType: string, state: FilterState): void {
    this.filterState.set(pageType, state);
  }

  /**
   * Save filter preset
   */
  savePreset(pageType: string, preset: FilterPreset): void {
    const state = this.getFilterState(pageType);
    
    if (!preset.id) {
      preset.id = `preset_${Date.now()}`;
      preset.createdAt = new Date().toISOString();
    }
    
    preset.updatedAt = new Date().toISOString();
    
    const existingIndex = state.savedPresets.findIndex((p) => p.id === preset.id);
    if (existingIndex >= 0) {
      state.savedPresets[existingIndex] = preset;
    } else {
      state.savedPresets.push(preset);
    }
    
    this.setFilterState(pageType, state);
    this.persistToLocalStorage(pageType);
  }

  /**
   * Delete filter preset
   */
  deletePreset(pageType: string, presetId: string): void {
    const state = this.getFilterState(pageType);
    state.savedPresets = state.savedPresets.filter((p) => p.id !== presetId);
    
    if (state.currentPresetId === presetId) {
      state.currentPresetId = null;
    }
    
    this.setFilterState(pageType, state);
    this.persistToLocalStorage(pageType);
  }

  /**
   * Load preset
   */
  loadPreset(pageType: string, presetId: string): FilterGroup | null {
    const state = this.getFilterState(pageType);
    const preset = state.savedPresets.find((p) => p.id === presetId);
    
    if (preset) {
      state.activeFilters = preset.filterJson;
      state.currentPresetId = presetId;
      this.setFilterState(pageType, state);
      return preset.filterJson;
    }
    
    return null;
  }

  /**
   * Persist to localStorage
   */
  private persistToLocalStorage(pageType: string): void {
    const state = this.getFilterState(pageType);
    try {
      localStorage.setItem(`filter_state_${pageType}`, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist filter state to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage(pageType: string): void {
    try {
      const stored = localStorage.getItem(`filter_state_${pageType}`);
      if (stored) {
        const state = JSON.parse(stored);
        this.setFilterState(pageType, state);
      }
    } catch (error) {
      console.error('Failed to load filter state from localStorage:', error);
    }
  }

  /**
   * Clear filter state for a page
   */
  clearFilterState(pageType: string): void {
    this.filterState.delete(pageType);
    localStorage.removeItem(`filter_state_${pageType}`);
  }

  /**
   * Sync with API (to be implemented with actual API calls)
   */
  async syncWithAPI(pageType: string, preset: FilterPreset): Promise<void> {
    // TODO: Implement API sync when backend is ready
    // This will handle saving/loading presets from the server
    console.log('Syncing preset with API:', preset);
  }

  /**
   * Create empty filter group
   */
  createEmptyFilter(): FilterGroup {
    return { operator: 'AND', conditions: [] };
  }

  /**
   * Add condition to filter
   */
  addCondition(filter: FilterGroup, condition: FilterCondition): FilterGroup {
    return {
      ...filter,
      conditions: [...filter.conditions, condition],
    };
  }

  /**
   * Remove condition from filter
   */
  removeCondition(filter: FilterGroup, index: number): FilterGroup {
    return {
      ...filter,
      conditions: filter.conditions.filter((_, i) => i !== index),
    };
  }

  /**
   * Update condition in filter
   */
  updateCondition(filter: FilterGroup, index: number, condition: FilterCondition): FilterGroup {
    return {
      ...filter,
      conditions: filter.conditions.map((c, i) => (i === index ? condition : c)),
    };
  }
}

export default FilterEngine.getInstance();
