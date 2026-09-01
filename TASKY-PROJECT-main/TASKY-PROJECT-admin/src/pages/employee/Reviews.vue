<template>
  <q-page class="q-pa-md text-black">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="column">
        <div class="text-h5 text-weight-bold">Reviews</div>
        <div class="text-grey-7 text-caption">Manage your review assignments and history</div>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey-7 q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="assigned" label="Assigned Reviews" icon="rate_review" />
      <q-tab name="history" label="Review History" icon="history" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="transparent">
      <!-- Assigned Reviews Tab -->
      <q-tab-panel name="assigned" class="q-pa-none">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-weight-bold">
              Assigned Reviews ({{ pendingReviews.length }})
            </div>
            <div class="text-caption text-grey-7">Tasks assigned to you for review</div>
          </q-card-section>
          <q-card-section>
            <q-list separator v-if="pendingReviews.length > 0">
              <q-item
                v-for="review in pendingReviews"
                :key="review.id"
                class="q-py-md"
                clickable
                @click="openReviewDialog(review)"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img
                      :src="
                        review.task_owner_avatar ||
                        `https://i.pravatar.cc/150?img=${review.task_owner_id}`
                      "
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ review.title }}</q-item-label>
                  <q-item-label caption
                    >Owner: {{ review.task_owner_first_name }}
                    {{ review.task_owner_last_name }}</q-item-label
                  >
                  <q-item-label caption>{{ getProjectName(review.project_id) }}</q-item-label>
                  <q-item-label caption
                    >Expected Effort: {{ review.expected_effort }}h</q-item-label
                  >
                  <q-item-label caption v-if="review.employee_comment" class="text-grey-8 q-mt-xs">
                    Owner Comment: "{{ review.employee_comment }}"
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn color="green" label="Review" size="sm" />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="rate_review" size="48px" class="q-mb-sm" />
              <div class="text-h6">No pending reviews</div>
              <div>No tasks assigned for review</div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Review History Tab -->
      <q-tab-panel name="history" class="q-pa-none">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-weight-bold">Review History ({{ reviewHistory.length }})</div>
            <div class="text-caption text-grey-7">Your review activity and points earned</div>
          </q-card-section>
          <q-card-section>
            <q-list separator v-if="reviewHistory.length > 0">
              <q-item v-for="review in reviewHistory" :key="review.id" class="q-py-md">
                <q-item-section avatar>
                  <q-icon
                    :name="
                      review.status === 'finalized'
                        ? 'check_circle'
                        : review.status === 'review-done'
                          ? 'rate_review'
                          : 'pending'
                    "
                    :color="
                      review.status === 'finalized'
                        ? 'green'
                        : review.status === 'review-done'
                          ? 'purple'
                          : 'orange'
                    "
                    size="32px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ review.title }}</q-item-label>
                  <q-item-label caption>{{ getProjectName(review.project_id) }}</q-item-label>
                  <q-item-label caption>
                    <q-badge
                      :color="
                        review.status === 'finalized'
                          ? 'green'
                          : review.status === 'review-done'
                            ? 'purple'
                            : 'orange'
                      "
                      >{{ review.status }}</q-badge
                    >
                  </q-item-label>
                  <q-item-label caption v-if="review.review_comment" class="text-grey-8 q-mt-xs">
                    Your Review: "{{ review.review_comment }}"
                  </q-item-label>
                  <q-item-label caption v-if="review.pm_final_comment" class="text-grey-8 q-mt-xs">
                    PM: "{{ review.pm_final_comment }}"
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="column items-end">
                    <q-badge
                      color="green"
                      label="+{{ review.reviewer_points || 0 }} pts"
                      v-if="review.reviewer_points > 0"
                    />
                    <div class="text-caption text-grey-6">
                      {{ formatDate(review.reviewed_at || review.submitted_at) }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="history" size="48px" class="q-mb-sm" />
              <div class="text-h6">No review history</div>
              <div>Start reviewing tasks to earn points</div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Review Task Dialog -->
    <q-dialog v-model="showReviewDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Review Task</div>
        </q-card-section>
        <q-card-section>
          <div v-if="selectedReview">
            <div class="q-mb-md">
              <div class="text-subtitle2">{{ selectedReview.title }}</div>
              <div class="text-caption text-grey-7">
                Owner: {{ selectedReview.task_owner_first_name }}
                {{ selectedReview.task_owner_last_name }}
              </div>
              <div class="text-caption text-grey-7">
                {{ getProjectName(selectedReview.project_id) }}
              </div>
              <div class="text-caption text-grey-7 q-mt-sm">
                Expected Effort: {{ selectedReview.expected_effort }}h
              </div>
              <div class="text-caption text-grey-7" v-if="selectedReview.employee_comment">
                Owner Comment: "{{ selectedReview.employee_comment }}"
              </div>
            </div>
            <q-input
              v-model="reviewComment"
              label="Review Comment"
              type="textarea"
              outlined
              rows="3"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="orange"
            label="Request Changes"
            @click="requestChanges"
            :loading="reviewing"
          />
          <q-btn
            color="green"
            label="Mark Done (+5 pts)"
            @click="approveReview"
            :loading="reviewing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';

defineOptions({
  name: 'EmployeeReviews',
});

const authStore = useAuthStore();

const activeTab = ref('assigned');
const loading = ref(false);
const pendingReviews = ref<any[]>([]);
const reviewHistory = ref<any[]>([]);
const projects = ref<any[]>([]);

const showReviewDialog = ref(false);
const selectedReview = ref<any>(null);
const reviewComment = ref('');
const reviewing = ref(false);

onMounted(async () => {
  await fetchFromDatabase();
});

async function fetchFromDatabase() {
  if (!authStore.user?.id) return;

  loading.value = true;
  try {
    const pendingResponse = await fetch(
      `http://localhost:3001/api/employee/reviews/pending?user_id=${authStore.user.id}`,
    );
    const pendingData = await pendingResponse.json();
    if (pendingData.success) {
      pendingReviews.value = pendingData.reviews;
    }

    const historyResponse = await fetch(
      `http://localhost:3001/api/employee/reviews/history?user_id=${authStore.user.id}`,
    );
    const historyData = await historyResponse.json();
    if (historyData.success) {
      reviewHistory.value = historyData.reviews;
    }

    const projectsResponse = await fetch('http://localhost:3001/api/pm/projects');
    const projectsData = await projectsResponse.json();
    if (projectsData.success) {
      projects.value = projectsData.projects;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

function getProjectName(projectId: number) {
  const project = projects.value.find((p: any) => p.id === projectId);
  return project?.name || 'Unknown Project';
}

function formatDate(date: string) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function openReviewDialog(review: any) {
  selectedReview.value = review;
  reviewComment.value = '';
  showReviewDialog.value = true;
}

async function approveReview() {
  if (!selectedReview.value) return;

  reviewing.value = true;
  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedReview.value.task_id}/approve-review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ review_comment: reviewComment.value }),
      },
    );

    const data = await response.json();
    if (data.success) {
      showReviewDialog.value = false;
      await fetchFromDatabase();
    }
  } catch (error) {
    console.error('Error approving review:', error);
  } finally {
    reviewing.value = false;
  }
}

async function requestChanges() {
  if (!selectedReview.value) return;

  reviewing.value = true;
  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/tasks/${selectedReview.value.task_id}/request-changes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ review_comment: reviewComment.value }),
      },
    );

    const data = await response.json();
    if (data.success) {
      showReviewDialog.value = false;
      await fetchFromDatabase();
    }
  } catch (error) {
    console.error('Error requesting changes:', error);
  } finally {
    reviewing.value = false;
  }
}
</script>
