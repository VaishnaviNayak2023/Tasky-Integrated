<template>
  <div class="row items-start justify-between q-mb-md" style="flex: 0 0 auto">
    <div class="row items-center">
      <q-avatar
        :color="avatarColor"
        :text-color="avatarTextColor"
        :icon="icon"
        size="48px"
        class="q-mr-md"
        style="border-radius: 12px"
      />
      <div class="column">
        <div class="text-h5 text-weight-bold">{{ title }}</div>
        <div class="text-grey-7 text-caption">{{ subtitle }}</div>
      </div>
    </div>
    <div class="column items-end">
      <div class="row items-center q-gutter-md q-mb-md">
        <q-input
          v-if="showSearch"
          v-model="searchValue"
          outlined
          dense
          rounded
          bg-color="white"
          :placeholder="searchPlaceholder"
          :style="{ width: searchWidth }"
          @update:model-value="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-avatar size="36px" class="cursor-pointer">
          <img :src="userAvatar || 'https://cdn.quasar.dev/img/avatar.png'" />
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup :to="profileRoute">
                <q-item-section avatar><q-icon name="person" /></q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" color="red" /></q-item-section>
                <q-item-section class="text-red">Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </div>
      <q-btn
        v-if="showActionButton"
        unelevated
        :color="actionButtonColor"
        :icon="actionButtonIcon"
        :label="actionButtonLabel"
        no-caps
        class="rounded-borders"
        @click="handleActionButton"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';

// Props
interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  avatarColor?: string;
  avatarTextColor?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchWidth?: string;
  showActionButton?: boolean;
  actionButtonColor?: string;
  actionButtonIcon?: string;
  actionButtonLabel?: string;
  profileRoute?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: 'dashboard',
  avatarColor: 'indigo-1',
  avatarTextColor: 'indigo',
  showSearch: false,
  searchPlaceholder: 'Search...',
  searchWidth: '320px',
  showActionButton: false,
  actionButtonColor: 'indigo',
  actionButtonIcon: 'add',
  actionButtonLabel: 'Add',
  profileRoute: '/dashboard/profile',
});

// Emits
const emit = defineEmits<{
  search: [value: string];
  actionButtonClick: [];
}>();

const router = useRouter();
const authStore = useAuthStore();

const searchValue = ref('');

const userAvatar = computed(() => authStore.currentUser?.avatar);

const handleSearch = () => {
  emit('search', searchValue.value);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/auth/login');
};

const handleActionButton = () => {
  emit('actionButtonClick');
};
</script>
