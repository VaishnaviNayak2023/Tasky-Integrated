<template>
  <q-dialog v-model="isOpen" maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Saved Filters</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md q-mb-md">
          <q-input
            v-model="newPresetName"
            label="Save current filters as..."
            outlined
            dense
            class="col"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                label="Save"
                color="primary"
                :disable="!newPresetName || !hasActiveFilters"
                @click="saveCurrentFilters"
              />
            </template>
          </q-input>
        </div>

        <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
          <q-tab name="all" label="All" />
          <q-tab name="favorites" label="Favorites" />
          <q-tab name="shared" label="Shared" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="all">
            <q-list separator>
              <q-item v-for="preset in filteredPresets" :key="preset.id || preset.name" clickable @click="loadPreset(preset)">
                <q-item-section avatar>
                  <q-icon :name="preset.isFavorite ? 'star' : 'bookmark_border'" :color="preset.isFavorite ? 'amber' : 'grey-6'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ preset.name }}</q-item-label>
                  <q-item-label caption>{{ formatDate(preset.updatedAt || '') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      dense
                      :icon="preset.isFavorite ? 'star' : 'star_border'"
                      :color="preset.isFavorite ? 'amber' : 'grey-6'"
                      @click.stop="toggleFavorite(preset)"
                    />
                    <q-btn flat round dense icon="more_vert" @click.stop>
                      <q-menu>
                        <q-list>
                          <q-item clickable v-close-popup @click="editPreset(preset)">
                            <q-item-section avatar>
                              <q-icon name="edit" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>Edit</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup @click="duplicatePreset(preset)">
                            <q-item-section avatar>
                              <q-icon name="content_copy" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>Duplicate</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup @click="deletePreset(preset)">
                            <q-item-section avatar>
                              <q-icon name="delete" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>Delete</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
              <q-item v-if="filteredPresets.length === 0">
                <q-item-section>
                  <q-item-label class="text-center text-grey-6">No saved filters</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="favorites">
            <q-list separator>
              <q-item v-for="preset in favoritePresets" :key="preset.id || preset.name" clickable @click="loadPreset(preset)">
                <q-item-section avatar>
                  <q-icon name="star" color="amber" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ preset.name }}</q-item-label>
                  <q-item-label caption>{{ formatDate(preset.updatedAt || '') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="favoritePresets.length === 0">
                <q-item-section>
                  <q-item-label class="text-center text-grey-6">No favorite filters</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="shared">
            <q-list separator>
              <q-item v-for="preset in sharedPresets" :key="preset.id || preset.name" clickable @click="loadPreset(preset)">
                <q-item-section avatar>
                  <q-icon name="share" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ preset.name }}</q-item-label>
                  <q-item-label caption>{{ formatDate(preset.updatedAt || '') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="sharedPresets.length === 0">
                <q-item-section>
                  <q-item-label class="text-center text-grey-6">No shared filters</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFilterStore } from '@/stores/filterStore';
import FilterEngine from '@/services/performance/FilterEngine';
import type { FilterPreset } from '@/services/performance/FilterEngine';

interface Props {
  pageType: string;
  currentFilter: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'load-preset': [preset: FilterPreset];
}>();

const filterStore = useFilterStore();
const isOpen = ref(false);
const newPresetName = ref('');
const activeTab = ref('all');

const savedPresets = computed(() => filterStore.savedPresets);
const favoritePresets = computed(() => filterStore.favoritePresets);
const sharedPresets = computed(() => filterStore.sharedPresets);
const hasActiveFilters = computed(() => FilterEngine.validateFilter(props.currentFilter) && props.currentFilter.conditions.length > 0);

const filteredPresets = computed(() => {
  switch (activeTab.value) {
    case 'favorites':
      return favoritePresets.value;
    case 'shared':
      return sharedPresets.value;
    default:
      return savedPresets.value;
  }
});

function open() {
  isOpen.value = true;
  filterStore.loadPresets(props.pageType);
}

function close() {
  isOpen.value = false;
  newPresetName.value = '';
}

async function saveCurrentFilters() {
  if (!newPresetName.value || !hasActiveFilters.value) return;

  try {
    await filterStore.savePreset({
      name: newPresetName.value,
      pageType: props.pageType,
      isDefault: false,
      isFavorite: false,
      isShared: false,
      filterJson: props.currentFilter,
    });
    newPresetName.value = '';
  } catch (error) {
    console.error('Failed to save preset:', error);
  }
}

async function toggleFavorite(preset: FilterPreset) {
  try {
    await filterStore.updatePreset(preset.id!, { isFavorite: !preset.isFavorite });
  } catch (error) {
    console.error('Failed to update preset:', error);
  }
}

function editPreset(preset: FilterPreset) {
  newPresetName.value = preset.name;
  // Could open a dialog for editing
}

async function duplicatePreset(preset: FilterPreset) {
  try {
    await filterStore.savePreset({
      name: `${preset.name} (Copy)`,
      pageType: preset.pageType,
      isDefault: false,
      isFavorite: false,
      isShared: false,
      filterJson: preset.filterJson,
    });
  } catch (error) {
    console.error('Failed to duplicate preset:', error);
  }
}

async function deletePreset(preset: FilterPreset) {
  try {
    await filterStore.deletePreset(preset.id!, props.pageType);
  } catch (error) {
    console.error('Failed to delete preset:', error);
  }
}

function loadPreset(preset: FilterPreset) {
  filterStore.loadPreset(preset.id!, props.pageType);
  emit('load-preset', preset);
  close();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

defineExpose({
  open,
  close,
});
</script>
