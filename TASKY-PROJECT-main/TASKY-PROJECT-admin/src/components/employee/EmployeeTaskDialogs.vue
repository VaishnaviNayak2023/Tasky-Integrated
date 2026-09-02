<template>
  <!-- Create Self-Assigned Task Dialog -->
  <q-dialog v-model="showCreateTaskDialog">
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">Create Self-Assigned Task</div>
      </q-card-section>
      <q-card-section class="q-pt-none q-pa-lg">
        <q-form @submit.prevent="$emit('create-task')" class="q-gutter-md">
          <q-input
            v-model="newTask.title"
            label="Task Title *"
            outlined
            dense
            :rules="[(val) => !!val || 'Title is required']"
          />
          <q-input
            v-model="newTask.description"
            label="Description"
            outlined
            dense
            type="textarea"
            rows="3"
          />
          <q-select
            v-model="newTask.projectId"
            label="Project *"
            :options="projectsList.map((p) => ({ label: p.name, value: p.id }))"
            outlined
            dense
            emit-value
            map-options
            :rules="[(val) => !!val || 'Project is required']"
          />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input 
                v-model="newTask.deadline" 
                label="Deadline *" 
                outlined 
                dense 
                type="date"
                :rules="[(val) => !!val || 'Deadline is required']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="newTask.expectedEffort"
                label="Expected Effort (hours)"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
          </div>
          <q-select
            v-model="newTask.priority"
            label="Priority"
            :options="['critical', 'high', 'medium', 'low']"
            outlined
            dense
          />
        </q-form>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" @click="$emit('update:show-create-task-dialog', false)" />
        <q-btn color="primary" label="Create Task" type="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Task Detail Dialog -->
  <q-dialog v-model="showTaskDialog">
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">{{ selectedTask?.title }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div v-if="selectedTask">
          <div class="q-mb-md">
            <strong>Project:</strong> {{ getProjectByIdLocal(selectedTask.project_id)?.name }}
          </div>
          <div class="q-mb-md"><strong>Description:</strong> {{ selectedTask.description }}</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <strong>Priority:</strong>
              <q-badge
                :color="getPriorityColor(selectedTask.priority)"
                class="q-ml-sm text-capitalize"
              >
                {{ selectedTask.priority }}
              </q-badge>
            </div>
            <div class="col-6">
              <strong>Status:</strong>
              <q-badge
                :color="getStatusColor(selectedTask.status)"
                class="q-ml-sm text-capitalize"
              >
                {{ selectedTask.status.replace('-', ' ') }}
              </q-badge>
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <strong>Deadline:</strong> {{ formatDate(selectedTask.deadline) }}
            </div>
            <div class="col-6">
              <strong>Expected Effort:</strong> {{ selectedTask.expected_effort }}h
            </div>
          </div>
          <div class="q-mb-md">
            <strong>Progress:</strong>
            <q-linear-progress
              :value="selectedTask.progress / 100"
              color="primary"
              class="q-mt-sm"
            />
            <div class="text-caption">{{ selectedTask.progress }}%</div>
          </div>
          <q-separator class="q-my-md" />
          <div class="text-subtitle2 q-mb-md">Progress History</div>
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="update in getProgressUpdatesByTaskLocal(selectedTask.id)"
              :key="update.id"
              :title="`${update.previous_progress || 0}% → ${update.new_progress || 0}%`"
              :subtitle="update.created_at || update.log_date"
            >
              <div>{{ update.notes || update.work_completed }}</div>
              <div class="text-caption text-grey-6">
                by {{ getEmployeeByIdLocal((update.user_id) as string || '')?.name }}
              </div>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Close" @click="$emit('update:show-task-dialog', false)" />
        <q-btn
          v-if="selectedTask.progress === 100 && selectedTask.status === 'in-progress'"
          color="primary"
          label="Submit for Review"
          @click="$emit('update:show-task-dialog', false); $emit('update:show-submit-review-dialog', true)"
        />
        <q-btn
          v-else
          color="primary"
          label="Update Progress"
          @click="$emit('update:show-task-dialog', false); $emit('update:show-update-progress-dialog', true)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Update Progress Dialog -->
  <q-dialog v-model="showUpdateProgressDialog">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Update Task Progress</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div v-if="selectedTask">
          <div class="q-mb-md"><strong>Task:</strong> {{ selectedTask.title }}</div>
          <div class="q-mb-md">
            <strong>Current Progress:</strong> {{ selectedTask.progress }}%
          </div>
          <q-slider
            v-model="progressUpdate"
            :min="0"
            :max="100"
            :step="10"
            label
            label-always
            markers
            color="primary"
            class="q-mb-md"
          />
          <q-select
            v-model="statusUpdate"
            label="Status"
            :options="['not-started', 'in-progress', 'completed']"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="hoursSpent"
            label="Hours Spent"
            type="number"
            outlined
            class="q-mb-md"
            hint="Total hours worked on this task"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="$emit('update:show-update-progress-dialog', false)" />
        <q-btn color="primary" label="Save" @click="$emit('update-progress')" :loading="updating" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Submit Review Dialog -->
  <q-dialog v-model="showSubmitReviewDialog">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Submit Task for Review</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div v-if="selectedTask">
          <div class="q-mb-md"><strong>Task:</strong> {{ selectedTask.title }}</div>
          <q-input
            v-model="completionComment"
            label="Completion Comment"
            outlined
            type="textarea"
            rows="3"
            class="q-mb-md"
            hint="Describe what was accomplished"
          />
          <q-select
            v-model="selectedReviewer"
            label="Select Reviewer"
            :options="reviewerOptions"
            outlined
            emit-value
            map-options
            class="q-mb-md"
            :rules="[(val) => !!val || 'Reviewer is required']"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="$emit('update:show-submit-review-dialog', false)" />
        <q-btn color="primary" label="Submit" @click="$emit('submit-review')" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Review Dialog (for reviewers) -->
  <q-dialog v-model="showReviewDialog">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Review Task</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div v-if="selectedReviewTask">
          <div class="q-mb-md"><strong>Task:</strong> {{ selectedReviewTask.title }}</div>
          <div class="q-mb-md">
            <strong>Project:</strong> {{ selectedReviewTask.project_name }}
          </div>
          <div class="q-mb-md">
            <strong>Submitted by:</strong> {{ selectedReviewTask.task_owner_first_name }}
            {{ selectedReviewTask.task_owner_last_name }}
          </div>
          <div class="q-mb-md">
            <strong>Expected Effort:</strong> {{ selectedReviewTask.expected_effort }}h
          </div>
          <div class="q-mb-md">
            <strong>Completion Comment:</strong> {{ selectedReviewTask.completion_comment }}
          </div>
          <div class="q-mb-md">
            <strong>Description:</strong> {{ selectedReviewTask.description }}
          </div>
          <q-input
            v-model="reviewComment"
            label="Review Comment"
            outlined
            type="textarea"
            rows="3"
            class="q-mb-md"
            hint="Provide feedback on the work. This will award 10 points to the task owner."
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="$emit('update:show-review-dialog', false)" />
        <q-btn color="orange" label="Request Changes" @click="$emit('request-changes')" />
        <q-btn
          color="green"
          label="Mark Review Done"
          @click="$emit('approve-review')"
          :loading="reviewing"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { getPriorityColor, getStatusColor } from '../../constants';

// Props
defineProps<{
  showCreateTaskDialog: boolean;
  showTaskDialog: boolean;
  showUpdateProgressDialog: boolean;
  showSubmitReviewDialog: boolean;
  showReviewDialog: boolean;
  selectedTask: any;
  selectedReviewTask: any;
  newTask: any;
  progressUpdate: number;
  statusUpdate: string;
  hoursSpent: number;
  completionComment: string;
  reviewComment: string;
  selectedReviewer: number | null;
  reviewerOptions: Array<{ label: string; value: number }>;
  projectsList: any[];
  updating: boolean;
  reviewing: boolean;
}>();

// Emits
defineEmits<{
  'update:show-create-task-dialog': [value: boolean];
  'update:show-task-dialog': [value: boolean];
  'update:show-update-progress-dialog': [value: boolean];
  'update:show-submit-review-dialog': [value: boolean];
  'update:show-review-dialog': [value: boolean];
  'create-task': [];
  'update-progress': [];
  'submit-review': [];
  'approve-review': [];
  'request-changes': [];
}>();

// Props
const props = defineProps<{
  showCreateTaskDialog: boolean;
  showTaskDialog: boolean;
  showUpdateProgressDialog: boolean;
  showSubmitReviewDialog: boolean;
  showReviewDialog: boolean;
  selectedTask: any;
  selectedReviewTask: any;
  newTask: any;
  progressUpdate: number;
  statusUpdate: string;
  hoursSpent: number;
  completionComment: string;
  reviewComment: string;
  selectedReviewer: number | null;
  reviewerOptions: Array<{ label: string; value: number }>;
  projectsList: any[];
  updating: boolean;
  reviewing: boolean;
  getTaskById: (id: string | number) => any;
  getProjectById: (id: string | number) => any;
  getEmployeeById: (id: string | number) => any;
  getProgressUpdatesByTask: (taskId: string | number) => any[];
}>();

// Emits
defineEmits<{
  'update:show-create-task-dialog': [value: boolean];
  'update:show-task-dialog': [value: boolean];
  'update:show-update-progress-dialog': [value: boolean];
  'update:show-submit-review-dialog': [value: boolean];
  'update:show-review-dialog': [value: boolean];
  'create-task': [];
  'update-progress': [];
  'submit-review': [];
  'approve-review': [];
  'request-changes': [];
}>();

// Helper functions using props
function getProjectByIdLocal(id: string | number) {
  return props.getProjectById(id);
}

function getEmployeeByIdLocal(id: string | number) {
  return props.getEmployeeById(id);
}

function getProgressUpdatesByTaskLocal(taskId: string | number) {
  return props.getProgressUpdatesByTask(taskId);
}

function formatDate(date: string) {
  if (!date) return 'No deadline';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>
