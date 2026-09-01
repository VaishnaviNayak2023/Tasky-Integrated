<template>
  <div class="row items-center justify-between q-mb-md">
    <div class="text-h4 text-weight-bold">{{ title }}</div>
    <div v-if="user" class="row items-center q-gutter-md">
      <q-avatar size="48px">
        <img :src="user.avatar" />
      </q-avatar>
      <div>
        <div class="text-subtitle1 text-weight-bold">{{ user.name }}</div>
        <div class="text-caption text-grey-7">{{ user.role }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  avatar: string;
  name: string;
  role: string;
}

interface Props {
  title: string;
  user?: User;
}

defineProps<Props>();
</script>
