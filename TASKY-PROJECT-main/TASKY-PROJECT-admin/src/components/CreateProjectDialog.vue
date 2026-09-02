<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 500px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isEdit ? 'Edit Project' : 'Create New Project' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md q-pa-lg">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Project Name *"
            outlined
            dense
            :rules="[(val) => !!val || 'Name is required']"
          />

          <q-input
            v-model="form.description"
            label="Description"
            type="textarea"
            outlined
            dense
            rows="3"
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.priority"
                :options="priorityOptions"
                label="Priority"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.start_date"
                label="Start Date *"
                type="date"
                outlined
                dense
                :rules="[(val) => !!val || 'Required']"
                stack-label
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.end_date"
                label="Deadline *"
                type="date"
                outlined
                dense
                :rules="[(val) => !!val || 'Required']"
                stack-label
              />
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-caption text-grey-8 q-mb-xs">Theme Color</div>
            <input
              v-model="form.color"
              type="color"
              style="width: 100px; height: 40px; cursor: pointer"
            />
          </div>

          <div class="row justify-end q-mt-lg">
            <q-btn label="Cancel" color="grey" flat v-close-popup class="q-mr-sm" />
            <q-btn
              :label="isEdit ? 'Save Changes' : 'Create Project'"
              color="primary"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useProjectStore } from '../stores/projectStore';
import { useQuasar } from 'quasar';

const props = defineProps<{
  modelValue: boolean;
  projectToEdit?: any;
}>();

const emit = defineEmits(['update:modelValue', 'saved']);
const $q = useQuasar();
const projectStore = useProjectStore();

const isOpen = ref(props.modelValue);
const isEdit = ref(false);
const loading = ref(false);

const statusOptions = [
  { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on-hold' },
  { label: 'Completed', value: 'completed' },
];

const priorityOptions = [
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const form = ref({
  name: '',
  description: '',
  status: 'planning',
  priority: 'medium',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  color: '#1976D2',
});

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val;
    if (val) {
      if (props.projectToEdit) {
        isEdit.value = true;
        form.value = {
          name: props.projectToEdit.name,
          description: props.projectToEdit.description || '',
          status: props.projectToEdit.status,
          priority: props.projectToEdit.priority,
          start_date: props.projectToEdit.start_date
            ? props.projectToEdit.start_date.split('T')[0]
            : '',
          end_date: props.projectToEdit.end_date ? props.projectToEdit.end_date.split('T')[0] : '',
          color: props.projectToEdit.color || '#1976D2',
        };
      } else {
        isEdit.value = false;
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        form.value = {
          name: '',
          description: '',
          status: 'planning',
          priority: 'medium',
          start_date: today.toISOString().split('T')[0],
          end_date: nextMonth.toISOString().split('T')[0] || '',
          color: '#1976D2',
        };
      }
    }
  },
);

watch(isOpen, (val) => {
  emit('update:modelValue', val);
});

const onSubmit = async () => {
  loading.value = true;
  try {
    if (isEdit.value) {
      await projectStore.updateProject(props.projectToEdit.id, form.value);
      $q.notify({ type: 'positive', message: 'Project updated successfully' });
    } else {
      await projectStore.createProject(form.value);
      $q.notify({ type: 'positive', message: 'Project created successfully' });
    }
    emit('saved');
    isOpen.value = false;
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error.message || 'An error occurred' });
  } finally {
    loading.value = false;
  }
};
</script>
