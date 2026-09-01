<template>
  <div class="error-state column items-center justify-center q-pa-xl">
    <q-icon name="error_outline" size="80px" color="negative" />
    
    <div class="text-h5 text-weight-medium text-negative q-mt-md">
      {{ title }}
    </div>
    
    <div class="text-body1 text-grey-6 q-mt-sm text-center">
      {{ message }}
    </div>
    
    <q-btn
      :label="retryLabel"
      icon="refresh"
      color="primary"
      class="q-mt-lg"
      @click="$emit('retry')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  message?: string;
  retryLabel?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Something Went Wrong',
  message: 'An error occurred while loading the data. Please try again.',
  retryLabel: 'Retry',
});

defineEmits<{
  retry: [];
}>();
</script>

<style scoped>
.error-state {
  min-height: 300px;
}
</style>
