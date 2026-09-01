<template>
  <q-page
    class="q-pa-md text-black"
    style="
      height: 100vh;
      max-height: 100vh;
      min-height: 0 !important;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
    "
  >
    <!-- Header / Identity -->
    <div
      class="row items-center q-mb-xl q-pa-md bg-white rounded-borders shadow-1"
      style="flex: 0 0 auto"
    >
      <q-avatar size="100px" class="q-mr-lg shadow-2" color="indigo-1" text-color="indigo">
        <img v-if="authStore.currentUser?.avatar" :src="authStore.currentUser.avatar" />
        <span class="text-h3" v-else-if="authStore.currentUser"
          >{{ authStore.currentUser.firstName.charAt(0)
          }}{{ authStore.currentUser.surname.charAt(0) }}</span
        >
      </q-avatar>
      <div class="column" v-if="authStore.currentUser">
        <div class="text-h4 text-weight-bold">
          {{ authStore.currentUser.firstName }} {{ authStore.currentUser.surname }}
        </div>
        <div class="text-h6 text-grey-8 text-capitalize">
          {{ authStore.currentUser.role === 'pm' ? 'Project Manager' : 'Employee' }}
        </div>
        <div class="text-caption text-grey-6 row items-center q-mt-xs">
          <q-icon name="email" class="q-mr-xs" /> {{ authStore.currentUser.email }}
          <q-icon name="phone" class="q-ml-md q-mr-xs" v-if="authStore.currentUser.phone" />
          {{ authStore.currentUser.phone }}
        </div>
      </div>
      <q-space />
      <q-btn
        unelevated
        color="indigo"
        icon="edit"
        label="Edit Profile"
        no-caps
        @click="openEditDialog"
      />
    </div>

    <!-- Personal Metrics -->
    <div class="row q-col-gutter-md q-mb-lg" style="flex: 0 0 auto">
      <div class="col-4">
        <StatCard
          title="Projects Managed"
          :value="projectStore.projects.length.toString()"
          color="indigo"
          icon="folder_special"
          caption="Active in your portfolio"
        />
      </div>
      <div class="col-4">
        <StatCard
          title="Average Completion Rate"
          :value="`${avgProgress}%`"
          color="green"
          icon="verified"
          caption="Historical performance"
        >
          <template v-slot:caption>
            <span class="text-green"><q-icon name="arrow_upward" size="10px" /> 2%</span> from last
            quarter
          </template>
        </StatCard>
      </div>
      <div class="col-4">
        <StatCard
          title="Total Team Size"
          :value="totalTeamSize.toString()"
          color="blue"
          icon="groups"
          caption="Resources across projects"
        />
      </div>
    </div>

    <!-- Owned Projects -->
    <div class="column" style="flex: 1 1 0; min-height: 0">
      <div class="text-h6 text-weight-bold q-mb-md row items-center">
        <q-icon name="stars" color="indigo" class="q-mr-sm" size="28px" />
        Your Active Projects
      </div>

      <div v-if="projectStore.loading" class="flex flex-center full-height">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div v-else style="flex: 1 1 0; overflow-y: auto; padding-right: 8px">
        <ProjectListCard
          v-for="project in projectStore.projects"
          :key="project.id"
          :project="project"
        />
        <div v-if="projectStore.projects.length === 0" class="text-center text-grey-6 q-pa-xl">
          <q-icon name="folder_off" size="48px" class="q-mb-sm" />
          <div>No active projects.</div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="editDialogVisible">
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Edit Profile</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveProfile" class="q-gutter-md">
            <q-input
              outlined
              v-model="editForm.firstName"
              label="First Name"
              lazy-rules
              :rules="[(val) => !!val || 'First Name is required']"
            />
            <q-input
              outlined
              v-model="editForm.surname"
              label="Last Name"
              lazy-rules
              :rules="[(val) => !!val || 'Last Name is required']"
            />
            <q-input
              outlined
              v-model="editForm.email"
              type="email"
              label="Email"
              lazy-rules
              :rules="[(val) => !!val || 'Email is required']"
            />
            <q-input outlined v-model="editForm.phone" type="tel" label="Phone Number" />
            <q-input
              outlined
              v-model="editForm.avatar"
              type="url"
              label="Avatar URL (Direct Link)"
            />

            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-xs text-grey-8">Change Password (Optional)</div>
            <q-input
              outlined
              v-model="editForm.oldPassword"
              label="Current Password"
              type="password"
            />
            <q-input outlined v-model="editForm.newPassword" label="New Password" type="password" />
            <q-input
              outlined
              v-model="editForm.confirmPassword"
              label="Confirm New Password"
              type="password"
              :rules="[
                (val) =>
                  !editForm.newPassword || val === editForm.newPassword || 'Passwords must match',
              ]"
              lazy-rules
            />

            <div class="row justify-end q-mt-lg">
              <q-btn flat label="Cancel" color="grey" v-close-popup />
              <q-btn
                unelevated
                label="Save Changes"
                color="indigo"
                type="submit"
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import StatCard from '../components/StatCard.vue';
import ProjectListCard from '../components/ProjectListCard.vue';

const $q = useQuasar();
const authStore = useAuthStore();
const projectStore = useProjectStore();

onMounted(() => {
  if (projectStore.projects.length === 0) {
    projectStore.fetchProjects();
  }
});

const avgProgress = computed(() => {
  if (projectStore.projects.length === 0) return 0;
  const total = projectStore.projects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0);
  return Math.round(total / projectStore.projects.length);
});

const totalTeamSize = computed(() => {
  const uniqueMembers = new Set();
  projectStore.projects.forEach((p: any) => {
    if (p.team) {
      p.team.forEach((m: any) => uniqueMembers.add(m.id));
    }
  });
  return uniqueMembers.size;
});

const editDialogVisible = ref(false);
const saving = ref(false);
const editForm = ref({
  firstName: '',
  surname: '',
  email: '',
  phone: '',
  avatar: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const openEditDialog = () => {
  if (authStore.currentUser) {
    editForm.value = {
      firstName: authStore.currentUser.firstName,
      surname: authStore.currentUser.surname,
      email: authStore.currentUser.email,
      phone: authStore.currentUser.phone || '',
      avatar:
        authStore.currentUser.avatar && !authStore.currentUser.avatar.includes('pravatar.cc')
          ? authStore.currentUser.avatar
          : '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    editDialogVisible.value = true;
  }
};

const saveProfile = async () => {
  if (!authStore.currentUser) return;

  saving.value = true;

  if (editForm.value.newPassword && editForm.value.newPassword !== editForm.value.confirmPassword) {
    saving.value = false;
    $q.notify({ type: 'warning', message: 'New passwords do not match' });
    return;
  }

  const payload: any = { ...editForm.value };
  delete payload.confirmPassword;

  const result = await authStore.updateProfile(authStore.currentUser.id, payload);
  saving.value = false;

  if (result.success) {
    editDialogVisible.value = false;
    $q.notify({
      color: 'positive',
      position: 'top',
      message: 'Profile updated successfully',
      icon: 'check_circle',
    });
  } else {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: result.error || 'Failed to update profile',
      icon: 'report_problem',
    });
  }
};
</script>

<style scoped>
/* Scrollbar styling */
div::-webkit-scrollbar {
  width: 6px;
}
div::-webkit-scrollbar-track {
  background: transparent;
}
div::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
div::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
