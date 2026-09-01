<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Share Summary</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-subtitle1 q-mb-md">Share via Email</div>
        
        <q-input
          v-model="email"
          label="Recipient Email"
          outlined
          dense
          type="email"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="subject"
          label="Subject"
          outlined
          dense
          class="q-mb-md"
        />

        <q-input
          v-model="message"
          label="Message (Optional)"
          outlined
          dense
          type="textarea"
          rows="3"
          class="q-mb-md"
        />

        <div class="text-subtitle1 q-mt-lg q-mb-md">Share Options</div>
        
        <q-list>
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="includeCharts" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Include Charts</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="includeInsights" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Include Insights</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="includeFilters" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Include Applied Filters</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat label="Cancel" color="grey" v-close-popup />
        <q-btn
          flat
          label="Share"
          color="primary"
          :loading="sharing"
          @click="handleShare"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);
const sharing = ref(false);
const email = ref('');
const subject = ref('Performance Summary');
const message = ref('');
const includeCharts = ref(true);
const includeInsights = ref(true);
const includeFilters = ref(true);

const emit = defineEmits<{
  share: [data: { email: string; subject: string; message: string; options: any }];
}>();

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

async function handleShare() {
  if (!email.value) {
    return;
  }

  sharing.value = true;
  
  try {
    const shareData = {
      email: email.value,
      subject: subject.value,
      message: message.value,
      options: {
        includeCharts: includeCharts.value,
        includeInsights: includeInsights.value,
        includeFilters: includeFilters.value,
      },
    };
    
    emit('share', shareData);
    
    // Reset form
    email.value = '';
    message.value = '';
    
    close();
  } catch (error) {
    console.error('Share failed:', error);
  } finally {
    sharing.value = false;
  }
}

defineExpose({
  open,
  close,
});
</script>
