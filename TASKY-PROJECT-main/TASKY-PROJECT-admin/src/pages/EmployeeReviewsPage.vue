<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-weight-bold q-mb-md">Reviews</div>

    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey-7 q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="assigned" label="Assigned Reviews" />
      <q-tab name="history" label="My Review History" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="transparent">
      <!-- Assigned Reviews -->
      <q-tab-panel name="assigned">
        <q-card>
          <q-card-section>
            <div class="text-h6">Assigned Reviews</div>
            <div class="text-caption text-grey-7">Tasks assigned to you for peer review</div>
          </q-card-section>
          <q-card-section>
            <q-list separator v-if="assignedReviews.length > 0">
              <q-item v-for="review in assignedReviews" :key="review.id" class="q-py-md">
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
                    >Submitted by: {{ review.task_owner_first_name }}
                    {{ review.task_owner_last_name }}</q-item-label
                  >
                  <q-item-label caption>Project: {{ review.project_name }}</q-item-label>
                  <q-item-label caption v-if="review.completion_comment"
                    >"{{ review.completion_comment }}"</q-item-label
                  >
                  <q-item-label caption>Progress: 100%</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    color="purple"
                    label="Review"
                    size="sm"
                    @click="openReviewDialog(review)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="check_circle" size="48px" class="q-mb-sm text-green-4" />
              <div class="text-h6">No assigned reviews</div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- My Review History -->
      <q-tab-panel name="history">
        <q-card>
          <q-card-section>
            <div class="text-h6">My Review History</div>
            <div class="text-caption text-grey-7">
              Tasks you submitted for review and their status
            </div>
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
                  <q-item-label caption>Project: {{ review.project_name }}</q-item-label>
                  <q-item-label caption
                    >Status:
                    <q-badge
                      :color="
                        review.status === 'finalized'
                          ? 'green'
                          : review.status === 'review-done'
                            ? 'purple'
                            : 'orange'
                      "
                      >{{ review.status }}</q-badge
                    ></q-item-label
                  >
                  <q-item-label caption v-if="review.pm_final_comment"
                    >PM: "{{ review.pm_final_comment }}"</q-item-label
                  >
                  <q-item-label caption
                    >Submitted: {{ formatDate(review.submitted_at) }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <div class="column items-end">
                    <q-badge
                      color="green"
                      label="+{{ review.task_owner_points }} pts"
                      v-if="review.task_owner_points > 0"
                    />
                    <div class="text-caption text-grey-6">
                      {{ formatDate(review.submitted_at) }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="history" size="48px" class="q-mb-sm text-grey-4" />
              <div class="text-h6">No review history</div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Leaderboard Section -->
    <q-card class="q-mt-md" flat bordered>
      <q-card-section>
        <div class="text-h6 text-weight-bold">
          <q-icon name="emoji_events" class="q-mr-sm" color="amber" />
          Employee Leaderboard
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-list separator v-if="leaderboard.length > 0">
          <q-item
            v-for="(employee, index) in leaderboard"
            :key="employee.id"
            :class="{ 'bg-amber-1': index === 0, 'bg-blue-1': employee.id === authStore.user?.id }"
            class="q-py-md"
          >
            <q-item-section avatar>
              <q-avatar
                :color="index === 0 ? 'amber' : index < 3 ? 'orange' : 'grey-4'"
                text-color="white"
              >
                {{ index + 1 }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ employee.first_name }} {{ employee.last_name }}
                <q-badge
                  v-if="employee.id === authStore.user?.id"
                  color="blue"
                  label="You"
                  class="q-ml-sm"
                />
              </q-item-label>
              <q-item-label caption>{{ employee.professional_role || 'Employee' }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-h5 text-weight-bold text-amber-9">
                <q-icon name="monetization_on" color="amber" size="24px" />
                {{ employee.points || 0 }}
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-center q-pa-xl text-grey-6">
          <q-icon name="leaderboard" size="48px" class="q-mb-sm text-grey-4" />
          <div class="text-h6">No leaderboard data available</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Review Dialog -->
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
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="green" label="Confirm Review" @click="approveReview" :loading="reviewing" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const activeTab = ref('assigned');
const showReviewDialog = ref(false);
const selectedReviewTask = ref<any>(null);
const reviewComment = ref('');
const reviewing = ref(false);

const assignedReviews = ref<any[]>([]);
const reviewHistory = ref<any[]>([]);
const leaderboard = ref<any[]>([]);

onMounted(async () => {
  await fetchAssignedReviews();
  await fetchReviewHistory();
  await fetchLeaderboard();
});

async function fetchAssignedReviews() {
  if (!authStore.user?.id) return;

  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/reviews/pending?user_id=${authStore.user.id}`,
    );
    const data = await response.json();
    if (data.success) {
      assignedReviews.value = data.reviews;
    }
  } catch (error) {
    console.error('Error fetching assigned reviews:', error);
  }
}

async function fetchReviewHistory() {
  if (!authStore.user?.id) return;

  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/reviews/history?user_id=${authStore.user.id}`,
    );
    const data = await response.json();
    if (data.success) {
      reviewHistory.value = data.reviews;
    }
  } catch (error) {
    console.error('Error fetching review history:', error);
  }
}

async function fetchLeaderboard() {
  try {
    const response = await fetch('http://localhost:3001/api/users');
    const data = await response.json();
    if (data.success) {
      // Sort by points descending
      leaderboard.value = data.users.sort((a: any, b: any) => (b.points || 0) - (a.points || 0));
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}

function formatDate(date: string) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function openReviewDialog(review: any) {
  selectedReviewTask.value = review;
  reviewComment.value = '';
  showReviewDialog.value = true;
}

async function approveReview() {
  if (!selectedReviewTask.value) return;

  reviewing.value = true;
  try {
    const response = await fetch(
      `http://localhost:3001/api/employee/reviews/${selectedReviewTask.value.id}/complete`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_comment: reviewComment.value }),
      },
    );

    const data = await response.json();
    if (data.success) {
      showReviewDialog.value = false;
      await fetchAssignedReviews();
      await fetchReviewHistory();

      // Show success notification with points earned
      if (data.reviewerPoints) {
        alert(`Congratulations! You earned ${data.reviewerPoints} points for reviewing this task!`);
      }
    }
  } catch (error) {
    console.error('Error approving review:', error);
  } finally {
    reviewing.value = false;
  }
}
</script>
