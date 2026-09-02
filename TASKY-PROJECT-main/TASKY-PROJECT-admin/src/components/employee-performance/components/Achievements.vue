<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="text-h6 text-weight-bold q-mb-md">Achievements & Streaks</div>
    
    <div class="row q-col-gutter-md">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="col-12 col-sm-6 col-md-3"
      >
        <div 
          class="column items-center q-pa-md rounded-borders"
          :class="achievement.unlocked ? 'bg-yellow-1' : 'bg-grey-2'"
          :style="achievement.unlocked ? 'border: 2px solid #FFD700;' : 'opacity: 0.6;'"
        >
          <q-icon 
            :name="achievement.icon" 
            :color="achievement.unlocked ? 'yellow-8' : 'grey-6'" 
            size="48px"
            class="q-mb-sm"
          />
          <div class="text-body1 text-weight-medium text-center">{{ achievement.title }}</div>
          <div class="text-caption text-grey-7 text-center q-mt-xs">{{ achievement.description }}</div>
          <q-badge 
            v-if="achievement.unlocked"
            color="yellow-8" 
            class="q-mt-sm"
          >
            Unlocked
          </q-badge>
          <q-badge 
            v-else
            color="grey-6" 
            class="q-mt-sm"
          >
            Locked
          </q-badge>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
}>();
</script>
