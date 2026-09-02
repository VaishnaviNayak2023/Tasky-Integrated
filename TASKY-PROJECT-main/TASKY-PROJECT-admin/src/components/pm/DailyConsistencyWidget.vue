<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="text-h6 text-weight-bold q-mb-md">Team Daily Consistency</div>
    
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6">
        <div class="text-body2 text-grey-6 q-mb-sm">Team Completion Rate Today</div>
        <div class="text-h4 text-weight-bold">{{ teamCompletionRate }}%</div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="text-body2 text-grey-6 q-mb-sm">Active Team Members</div>
        <div class="text-h4 text-weight-bold">{{ activeMembers }}</div>
      </div>
    </div>

    <div class="q-mb-md">
      <div class="text-body2 text-grey-6 q-mb-sm">Weekly Consistency Trend</div>
      <div class="row q-col-gutter-xs">
        <div v-for="(day, index) in weeklyTrend" :key="index" class="col-auto">
          <div class="column items-center">
            <div class="text-caption text-grey-6 q-mb-xs">{{ day.label }}</div>
            <div
              class="rounded-borders"
              :style="{
                width: '32px',
                height: `${day.rate * 1.5}px`,
                backgroundColor: getRateColor(day.rate),
                minHeight: '4px'
              }"
            />
            <div class="text-caption q-mt-xs">{{ day.rate }}%</div>
          </div>
        </div>
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <div class="text-body2 text-grey-6 q-mb-sm">Top Performers Today</div>
    <q-list dense>
      <q-item v-for="(member, index) in topPerformers" :key="member.id" class="q-pa-none">
        <q-item-section avatar>
          <q-avatar size="32px">
            <img :src="member.avatar || `https://i.pravatar.cc/150?img=${member.id}`" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ member.name }}</q-item-label>
          <q-item-label caption>{{ member.completed }}/{{ member.assigned }} tasks</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge :color="getRateColor(member.rate)" :label="member.rate + '%'" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  teamCompletionRate: number;
  activeMembers: number;
  weeklyTrend: Array<{ label: string; rate: number }>;
  topPerformers: Array<{ id: number; name: string; avatar?: string; assigned: number; completed: number; rate: number }>;
}>();

function getRateColor(rate: number): string {
  if (rate >= 90) return '#4CAF50';
  if (rate >= 70) return '#2196F3';
  if (rate >= 50) return '#FF9800';
  return '#F44336';
}
</script>
