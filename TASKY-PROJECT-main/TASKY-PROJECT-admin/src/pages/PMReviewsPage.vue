<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-weight-bold q-mb-md">Reviews</div>

    <q-card>
      <q-card-section>
        <div class="text-h6">Task Reviews</div>
        <div class="text-caption text-grey-7">Tasks completed and reviewed by employees</div>
      </q-card-section>
      <q-card-section>
        <q-list separator v-if="reviewedTasks.length > 0">
          <q-item v-for="review in reviewedTasks" :key="review.id" class="q-py-md">
            <q-item-section avatar>
              <q-icon name="check_circle" color="green" size="32px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ review.title }}</q-item-label>
              <q-item-label caption
                >Reviewed by: {{ review.reviewer_first_name }}
                {{ review.reviewer_last_name }}</q-item-label
              >
              <q-item-label caption
                >Task Owner: {{ review.task_owner_first_name }}
                {{ review.task_owner_last_name }}</q-item-label
              >
              <q-item-label caption>Progress: 100% complete</q-item-label>
              <q-item-label caption v-if="review.review_comment" class="text-grey-8 q-mt-xs">
                Reviewer: "{{ review.review_comment }}"
              </q-item-label>
              <q-item-label caption v-if="review.pm_final_comment" class="text-blue-8 q-mt-xs">
                PM: "{{ review.pm_final_comment }}"
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="column items-end">
                <q-badge color="green" label="Completed" />
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ formatDate(review.finalized_at) }}
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-center q-pa-xl text-grey-6">
          <q-icon name="check_circle" size="48px" class="q-mb-sm text-green-4" />
          <div class="text-h6">No reviewed tasks yet</div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const reviewedTasks = ref<any[]>([]);

onMounted(async () => {
  await fetchReviewedTasks();
});

async function fetchReviewedTasks() {
  try {
    const response = await fetch('http://localhost:3001/api/pm/reviews/all');
    const data = await response.json();
    if (data.success) {
      // Show only reviews that are completed (review-done or finalized)
      reviewedTasks.value = data.reviews.filter(
        (r: any) => r.status === 'review-done' || r.status === 'finalized',
      );
    }
  } catch (error) {
    console.error('Error fetching reviewed tasks:', error);
  }
}

function formatDate(date: string) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>
