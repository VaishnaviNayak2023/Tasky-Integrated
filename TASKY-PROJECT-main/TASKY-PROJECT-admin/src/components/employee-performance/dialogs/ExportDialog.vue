<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Export Report</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-subtitle1 q-mb-md">Select Export Format</div>
        
        <q-option-group
          v-model="selectedFormat"
          :options="formatOptions"
          color="primary"
        />

        <div class="text-subtitle1 q-mt-lg q-mb-md">Export Options</div>
        
        <q-list>
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="includeCharts" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Include Charts</q-item-label>
              <q-item-label caption>Add visual charts to the export</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="includeInsights" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Include Insights</q-item-label>
              <q-item-label caption>Add AI-generated insights to the export</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="includeFilters" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Include Applied Filters</q-item-label>
              <q-item-label caption>Add filter information to the export</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="text-subtitle1 q-mt-lg q-mb-md">Date Range</div>
        
        <q-input
          v-model="dateRange"
          label="Custom Date Range"
          outlined
          dense
          readonly
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="dateRange" range />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat label="Cancel" color="grey" v-close-popup />
        <q-btn
          flat
          label="Export"
          color="primary"
          :loading="exporting"
          @click="handleExport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as performanceApi from '@/services/performance/performanceApi';

const isOpen = ref(false);
const exporting = ref(false);
const selectedFormat = ref('pdf');
const includeCharts = ref(true);
const includeInsights = ref(true);
const includeFilters = ref(true);
const dateRange = ref('');

const formatOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel (XLSX)', value: 'xlsx' },
  { label: 'CSV', value: 'csv' },
];

const emit = defineEmits<{
  export: [format: string, blob: Blob];
}>();

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

async function handleExport() {
  exporting.value = true;
  
  try {
    const options: performanceApi.ExportOptions = {
      format: selectedFormat.value as 'csv' | 'xlsx' | 'pdf',
      includeCharts: includeCharts.value,
      includeInsights: includeInsights.value,
      includeFilters: includeFilters.value,
    };

    if (dateRange.value) {
      const dates = dateRange.value.split(' to ');
      if (dates.length === 2 && dates[0] && dates[1]) {
        options.dateRange = {
          start: dates[0],
          end: dates[1],
        };
      }
    }

    const blob = await performanceApi.exportReport(options);
    emit('export', selectedFormat.value, blob);
    
    // Download the file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_report_${new Date().toISOString().split('T')[0]}.${selectedFormat.value}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    close();
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    exporting.value = false;
  }
}

defineExpose({
  open,
  close,
});
</script>
