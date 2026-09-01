<template>
  <q-card :class="bgClass">
    <q-card-section>
      <div class="text-subtitle2 text-grey-7">{{ label }}</div>
      <div class="text-h4 text-weight-bold" :class="colorClass">{{ value }}</div>
      <div class="text-caption text-grey-6">{{ subtitle }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
  subtitle: string;
  bgClass: string;
  colorClass: string;
}

defineProps<Props>();
</script>
