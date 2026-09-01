<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between">
      <div class="row items-center">
        <q-avatar size="46px" class="my-task-icon">
          <q-icon name="checklist" size="24px" />
        </q-avatar>
        <div class="q-ml-md">
          <div class="text-h6 text-weight-bold">
            {{ title }}
          </div>
          <div class="text-body2 text-grey-6">
            {{ taskCount }} tasks
            <span v-if="activeTab !== 'all'"> · {{ activeTabLabel }} </span>
          </div>
        </div>
      </div>

      <q-btn-toggle
        :model-value="viewMode"
        unelevated
        toggle-color="primary"
        :options="[
          { value: 'list', icon: 'view_list' },
          { value: 'grid', icon: 'grid_view' },
        ]"
        @update:model-value="$emit('view-change', $event)"
      />
    </div>

    <q-tabs
      :model-value="activeTab"
      align="left"
      active-color="primary"
      indicator-color="primary"
      class="q-mt-lg"
      no-caps
      @update:model-value="$emit('tab-change', $event)"
    >
      <q-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :label="tab.label" />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  taskCount: number;
  activeTab: string;
  activeTabLabel: string;
  viewMode: 'list' | 'grid';
  tabs: Array<{ name: string; label: string }>;
}

defineProps<Props>();

defineEmits(['view-change', 'tab-change']);
</script>

<style scoped>
.my-task-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
