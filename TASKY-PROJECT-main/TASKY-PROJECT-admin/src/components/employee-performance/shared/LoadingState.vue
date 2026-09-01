<template>
  <div class="loading-state column items-center justify-center q-pa-xl">
    <q-spinner color="primary" size="60px" />
    
    <div class="text-body1 text-grey-6 q-mt-md">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: 'Loading data...',
});
</script>

<style scoped>
.loading-state {
  min-height: 300px;
}
</style>
