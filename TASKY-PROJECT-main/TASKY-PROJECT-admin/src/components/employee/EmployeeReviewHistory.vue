<template>
  <q-card v-if="reviewHistory.length > 0" class="q-mb-md bg-blue-1">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-blue-9">
        <q-icon name="history" class="q-mr-sm" />
        My Review History ({{ reviewHistory.length }})
      </div>
      <div class="text-caption text-blue-7">Tasks you submitted for review and their status</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-list separator>
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
            <q-item-label caption v-if="review.pm_final_comment" class="text-grey-8 q-mt-xs">
              PM: "{{ review.pm_final_comment }}"
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="column items-end">
              <q-badge
                color="green"
                label="+{{ review.task_owner_points }} pts"
                v-if="review.task_owner_points > 0"
              />
              <div class="text-caption text-grey-6">{{ formatDate(review.submitted_at) }}</div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  reviewHistory: any[];
}

defineProps<Props>();

function formatDate(date: string) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>
