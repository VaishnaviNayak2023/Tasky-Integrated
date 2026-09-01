<template>
  <q-card flat class="quick-add-card q-pa-lg q-mb-lg">
    <div class="row items-center">
      <q-avatar size="48px" class="quick-add-icon">
        <q-icon name="add_task" size="25px" />
      </q-avatar>
      <div class="q-ml-md">
        <div class="quick-add-title">Have something new to work on?</div>
        <div class="quick-add-subtitle">Create a task and divide it into smaller subtasks.</div>
      </div>
      <q-space />
      <q-btn
        unelevated
        no-caps
        color="secondary"
        text-color="primary"
        icon="add"
        label="Create Task"
        class="q-px-lg"
        @click="$emit('create')"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
defineEmits(['create']);
</script>

<style scoped>
.quick-add-card {
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.quick-add-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.quick-add-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.quick-add-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}
</style>
