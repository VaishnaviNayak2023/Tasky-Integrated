<template>
  <q-card v-if="pendingReviews.length > 0" class="q-mb-md bg-purple-1">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-purple-9">
        <q-icon name="rate_review" class="q-mr-sm" />
        Pending Reviews ({{ pendingReviews.length }})
      </div>
      <div class="text-caption text-purple-7">Tasks assigned to you for peer review</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-list separator>
        <q-item v-for="review in pendingReviews" :key="review.id" class="q-py-md" clickable @click="$emit('open-review', review)">
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
            <q-item-label caption v-if="review.completion_comment" class="text-grey-8 q-mt-xs">
              "{{ review.completion_comment }}"
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn color="purple" label="Review" size="sm" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  pendingReviews: any[];
}

defineProps<Props>();

defineEmits<{
  'open-review': [review: any];
}>();
</script>
