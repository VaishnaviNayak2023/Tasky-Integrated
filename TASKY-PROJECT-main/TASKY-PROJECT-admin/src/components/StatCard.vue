<template>
  <q-card flat class="rounded-borders q-pa-sm shadow-1" style="border-radius: 8px">
    <div class="row justify-between items-center q-mb-xs">
      <div class="text-grey-7 text-caption text-weight-medium" style="font-size: 10px">
        {{ title }}
      </div>
      <q-avatar size="24px" :color="`${color}-1`" :text-color="color" :icon="icon" />
    </div>
    <div :class="`text-h6 text-weight-bold text-${color}`" style="line-height: 1">{{ value }}</div>
    <div
      class="row items-center text-grey-6"
      style="font-size: 9px; line-height: 1; margin-top: 2px"
    >
      <slot name="caption">{{ caption }}</slot>
    </div>
    <q-linear-progress
      v-if="progressValue !== undefined"
      :value="progressValue"
      :color="color"
      size="3px"
      class="q-mt-xs rounded-borders"
    />
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  color: string;
  icon: string;
  caption?: string;
  progressValue?: number;
}>();
</script>
