<template>
  <div class="empty-state column items-center justify-center q-pa-xl">
    <q-icon :name="icon" size="80px" color="grey-4" />
    
    <div class="text-h5 text-weight-medium text-grey-7 q-mt-md">
      {{ title }}
    </div>
    
    <div class="text-body1 text-grey-5 q-mt-sm text-center">
      {{ message }}
    </div>
    
    <q-btn
      v-if="actionLabel"
      :label="actionLabel"
      :icon="actionIcon"
      color="primary"
      outline
      class="q-mt-lg"
      @click="$emit('action')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  actionIcon?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'No Data Available',
  message: 'There is no data to display for the current selection.',
  icon: 'inbox',
  actionLabel: '',
  actionIcon: 'refresh',
});

defineEmits<{
  action: [];
}>();
</script>

<style scoped>
.empty-state {
  min-height: 300px;
}
</style>
