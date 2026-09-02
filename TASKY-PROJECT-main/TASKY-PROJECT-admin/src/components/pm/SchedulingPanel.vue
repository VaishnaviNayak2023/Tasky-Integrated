<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="text-h6 text-weight-bold q-mb-md">Smart Task Scheduler</div>

    <q-tabs v-model="tab" dense class="q-mb-md">
      <q-tab name="auto-assign" label="Auto-Assign" />
      <q-tab name="rebalance" label="Rebalance" />
      <q-tab name="impact" label="Impact Analysis" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <q-tab-panels v-model="tab" animated>
      <!-- AUTO-ASSIGN TAB -->
      <q-tab-panel name="auto-assign">
        <div class="text-body2 text-grey-7 q-mb-md">
          Automatically assign tasks to the most suitable team members based on skills, workload, and availability.
        </div>

        <q-select
          v-model="selectedTask"
          :options="unassignedTasks"
          label="Select Task to Assign"
          outlined
          emit-value
          map-options
          option-label="title"
          option-value="id"
          class="q-mb-md"
        />

        <q-btn
          label="Auto-Assign Task"
          color="primary"
          :loading="autoAssignLoading"
          @click="handleAutoAssign"
          :disable="!selectedTask"
          class="full-width"
        />

        <q-banner v-if="autoAssignResult" class="q-mt-md" :class="autoAssignResult.success ? 'bg-positive' : 'bg-negative'">
          <template v-slot:avatar>
            <q-icon :name="autoAssignResult.success ? 'check_circle' : 'error'" />
          </template>
          {{ autoAssignResult.message }}
        </q-banner>
      </q-tab-panel>

      <!-- REBALANCE TAB -->
      <q-tab-panel name="rebalance">
        <div class="text-body2 text-grey-7 q-mb-md">
          Identify overloaded team members and suggest task reassignments to balance workloads.
        </div>

        <q-select
          v-model="selectedProject"
          :options="projects"
          label="Select Project"
          outlined
          emit-value
          map-options
          option-label="name"
          option-value="id"
          class="q-mb-md"
        />

        <q-btn
          label="Analyze Workload"
          color="primary"
          :loading="rebalanceLoading"
          @click="handleRebalance"
          :disable="!selectedProject"
          class="full-width"
        />

        <div v-if="rebalanceSuggestions.length > 0" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Rebalancing Suggestions:</div>
          <q-list bordered separator>
            <q-item v-for="(suggestion, index) in rebalanceSuggestions" :key="index">
              <q-item-section avatar>
                <q-icon name="swap_horiz" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ suggestion.task.title }}</q-item-label>
                <q-item-label caption>
                  From: {{ suggestion.from.name }} ({{ suggestion.from.utilization }}%)
                  → To: {{ suggestion.to.name }} ({{ suggestion.to.new_utilization.toFixed(0) }}%)
                </q-item-label>
                <q-item-label caption class="text-grey-7">{{ suggestion.reason }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="check" color="positive" @click="applySuggestion(suggestion)" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-tab-panel>

      <!-- IMPACT ANALYSIS TAB -->
      <q-tab-panel name="impact">
        <div class="text-body2 text-grey-7 q-mb-md">
          Analyze the impact of delaying a task on project timeline and dependencies.
        </div>

        <q-select
          v-model="impactTask"
          :options="allTasks"
          label="Select Task"
          outlined
          emit-value
          map-options
          option-label="title"
          option-value="id"
          class="q-mb-md"
        />

        <q-input
          v-model.number="delayDays"
          type="number"
          label="Delay (days)"
          outlined
          min="0"
          class="q-mb-md"
        />

        <q-btn
          label="Analyze Impact"
          color="primary"
          :loading="impactLoading"
          @click="handleImpactAnalysis"
          :disable="!impactTask"
          class="full-width"
        />

        <div v-if="impactResult" class="q-mt-md">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle2 q-mb-sm">Impact Analysis Results:</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="text-caption text-grey-6">Affected Tasks</div>
                <div class="text-body1">{{ impactResult.affectedTasks || 0 }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Project Delay</div>
                <div class="text-body1">{{ impactResult.projectDelay || 0 }} days</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Risk Level</div>
                <div class="text-body1">
                  <q-badge :color="getRiskColor(impactResult.riskLevel)">
                    {{ impactResult.riskLevel || 'Low' }}
                  </q-badge>
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Critical Path</div>
                <div class="text-body1">{{ impactResult.onCriticalPath ? 'Yes' : 'No' }}</div>
              </div>
            </div>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/boot/axios';

const tab = ref('auto-assign');
const selectedTask = ref(null);
const selectedProject = ref(null);
const impactTask = ref(null);
const delayDays = ref(0);

const autoAssignLoading = ref(false);
const rebalanceLoading = ref(false);
const impactLoading = ref(false);

const autoAssignResult = ref(null);
const rebalanceSuggestions = ref([]);
const impactResult = ref(null);

// Mock data - would come from API
const unassignedTasks = ref([
  { id: 1, title: 'Design homepage UI' },
  { id: 2, title: 'Implement user authentication' },
  { id: 3, title: 'Create database schema' },
]);

const projects = ref([
  { id: 1, name: 'Website Redesign' },
  { id: 2, name: 'Mobile App' },
]);

const allTasks = ref([
  { id: 1, title: 'Design homepage UI' },
  { id: 2, title: 'Implement user authentication' },
  { id: 3, title: 'Create database schema' },
  { id: 4, title: 'Write unit tests' },
]);

async function handleAutoAssign() {
  autoAssignLoading.value = true;
  autoAssignResult.value = null;
  
  try {
    const response = await api.post('/pm/schedule/auto-assign', { task_id: selectedTask.value });
    autoAssignResult.value = response.data;
    if (response.data.success) {
      selectedTask.value = null;
    }
  } catch (error) {
    autoAssignResult.value = { success: false, message: 'Failed to auto-assign task' };
  } finally {
    autoAssignLoading.value = false;
  }
}

async function handleRebalance() {
  rebalanceLoading.value = true;
  rebalanceSuggestions.value = [];
  
  try {
    const response = await api.post('/pm/schedule/rebalance', { project_id: selectedProject.value });
    rebalanceSuggestions.value = response.data.suggestions || [];
  } catch (error) {
    console.error('Rebalance error:', error);
  } finally {
    rebalanceLoading.value = false;
  }
}

async function handleImpactAnalysis() {
  impactLoading.value = true;
  impactResult.value = null;
  
  try {
    const response = await api.post('/pm/schedule/impact-analysis', {
      task_id: impactTask.value,
      delay_days: delayDays.value,
    });
    impactResult.value = response.data.impact;
  } catch (error) {
    console.error('Impact analysis error:', error);
  } finally {
    impactLoading.value = false;
  }
}

function applySuggestion(suggestion: any) {
  // Implement suggestion application logic
  console.log('Applying suggestion:', suggestion);
}

function getRiskColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    low: 'positive',
    medium: 'warning',
    high: 'negative',
  };
  return colors[riskLevel?.toLowerCase()] || 'grey';
}
</script>
