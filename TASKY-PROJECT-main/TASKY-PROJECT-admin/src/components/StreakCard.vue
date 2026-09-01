<template>
  <div class="streak-card row items-center q-px-md q-py-sm">
    <q-icon name="local_fire_department" color="orange" size="22px" />
    <div class="q-ml-sm">
      <div class="text-weight-bold text-caption">{{ streak }} day streak</div>
      <div class="text-caption text-grey-6">Consistent updates</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  streak: number;
}

defineProps<Props>();
</script>

<style scoped>
.streak-card {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
  border-radius: 20px;
  color: white;
}
</style>
