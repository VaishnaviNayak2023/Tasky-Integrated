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
    <!-- Header -->
    <div class="row items-start justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="row items-center">
        <q-avatar
          color="indigo-1"
          text-color="indigo"
          icon="o_folder"
          size="48px"
          class="q-mr-md"
          style="border-radius: 12px"
        />
        <div class="column">
          <div class="text-h5 text-weight-bold">Projects</div>
          <div class="text-grey-7 text-caption">
            Manage and track all your projects in one place
          </div>
        </div>
      </div>
      <div class="column items-end">
        <div class="row items-center q-gutter-md q-mb-md">
          <q-avatar size="36px" class="cursor-pointer">
            <img :src="authStore.currentUser?.avatar || 'https://cdn.quasar.dev/img/avatar.png'" />
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup to="/dashboard/profile">
                  <q-item-section avatar><q-icon name="person" /></q-item-section>
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar><q-icon name="logout" color="red" /></q-item-section>
                  <q-item-section class="text-red">Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </div>
        <q-btn
          unelevated
          color="indigo"
          icon="add"
          label="New Project"
          no-caps
          class="rounded-borders"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="row q-gutter-x-lg q-mb-md" style="flex: 0 0 auto">
      <div class="row items-center">
        <q-icon name="o_folder" color="indigo" size="20px" class="q-mr-xs" />
        <div class="text-weight-bold q-mr-sm">{{ activeProjectCount }}</div>
        <div class="text-caption text-grey-7">Active Projects</div>
      </div>
      <div class="row items-center">
        <q-icon name="o_warning" color="orange" size="20px" class="q-mr-xs" />
        <div class="text-weight-bold text-orange q-mr-sm">{{ atRiskProjectCount }}</div>
        <div class="text-caption text-grey-7">At Risk</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="row items-center justify-between q-mb-md" style="flex: 0 0 auto">
      <q-input
        v-model="filters.search"
        outlined
        dense
        rounded
        bg-color="white"
        placeholder="Search projects..."
        style="width: 250px"
        @update:model-value="applyFilters"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="row items-center q-gutter-x-sm">
        <q-select
          v-model="filters.status"
          outlined
          dense
          :options="statusOptions"
          style="width: 160px"
          bg-color="white"
          rounded
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
        <q-select
          v-model="filters.priority"
          outlined
          dense
          :options="priorityOptions"
          style="width: 160px"
          bg-color="white"
          rounded
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
        <q-select
          v-model="filters.sort"
          outlined
          dense
          :options="sortOptions"
          style="width: 170px"
          bg-color="white"
          rounded
          emit-value
          map-options
          @update:model-value="applyFilters"
        />
        <q-btn
          v-if="hasActiveFilters"
          flat
          round
          dense
          icon="clear"
          color="grey"
          @click="clearFilters"
        >
          <q-tooltip>Clear Filters</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Project List -->
    <div
      class="q-mb-md position-relative"
      style="flex: 1 1 0; overflow-y: auto; min-height: 0; padding-right: 4px"
    >
      <div v-if="projectStore.loading" class="absolute-center">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <template v-else-if="paginatedProjects.length > 0">
        <ProjectListCard
          v-for="project in paginatedProjects"
          :key="project.id"
          :project="project"
          @click="openProjectDetail(project)"
          @edit="openEditDialog(project)"
          @delete="confirmDelete(project)"
          @mark-complete="markComplete(project)"
        />
      </template>

      <div v-else class="absolute-center text-center text-grey-6">
        <q-icon name="o_folder_off" size="64px" class="q-mb-sm" />
        <div class="text-h6">No projects found</div>
        <div>Try adjusting your filters or create a new project.</div>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div
      class="row items-center justify-between text-grey-7"
      style="flex: 0 0 auto; font-size: 13px"
      v-if="projectStore.projects.length > 0"
    >
      <div>
        Showing {{ showingStart }} to {{ showingEnd }} of
        {{ projectStore.projects.length }} projects
      </div>
      <div class="row items-center q-gutter-x-sm">
        <span>Rows per page:</span>
        <q-select
          v-model="rowsPerPage"
          outlined
          dense
          :options="[5, 10, 20]"
          class="q-mr-md bg-white"
          style="width: 70px"
          rounded
          @update:model-value="currentPage = 1"
        />
        <q-btn
          flat
          round
          dense
          icon="chevron_left"
          :disable="currentPage === 1"
          @click="currentPage--"
        />
        <q-btn
          v-for="p in totalPages"
          :key="p"
          :unelevated="p === currentPage"
          :flat="p !== currentPage"
          round
          dense
          :color="p === currentPage ? 'indigo-1' : ''"
          :text-color="p === currentPage ? 'indigo' : 'grey-7'"
          :label="p"
          size="12px"
          @click="currentPage = p"
        />
        <q-btn
          flat
          round
          dense
          icon="chevron_right"
          :disable="currentPage === totalPages"
          @click="currentPage++"
        />
      </div>
    </div>

    <!-- Dialogs -->
    <CreateProjectDialog
      v-model="showCreateDialog"
      :project-to-edit="projectToEdit"
      @saved="projectStore.fetchProjects(filters)"
    />
    <ProjectDetailDialog v-model="showDetailDialog" :project-id="selectedProjectId" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import { useQuasar } from 'quasar';
import ProjectListCard from '../components/ProjectListCard.vue';
import CreateProjectDialog from '../components/CreateProjectDialog.vue';
import ProjectDetailDialog from '../components/ProjectDetailDialog.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const projectStore = useProjectStore();
const $q = useQuasar();

// Filters state
const filters = ref({
  search: (route.query.search as string) || '',
  status: 'all',
  priority: 'all',
  sort: 'newest',
});

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on-hold' },
  { label: 'Completed', value: 'completed' },
];

const priorityOptions = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const sortOptions = [
  { label: 'Sort: Newest', value: 'newest' },
  { label: 'Sort: Oldest', value: 'oldest' },
  { label: 'Sort: Priority', value: 'priority' },
  { label: 'Sort: Progress', value: 'progress' },
  { label: 'Sort: Deadline', value: 'deadline' },
];

const hasActiveFilters = computed(() => {
  return (
    filters.value.search !== '' ||
    filters.value.status !== 'all' ||
    filters.value.priority !== 'all'
  );
});

// Pagination
const rowsPerPage = ref(5);
const currentPage = ref(1);

onMounted(() => {
  projectStore.fetchProjects(filters.value);

  if (route.query.open) {
    selectedProjectId.value = route.query.open as string;
    showDetailDialog.value = true;
  }
});

const applyFilters = () => {
  currentPage.value = 1;
  projectStore.fetchProjects(filters.value);
};

const clearFilters = () => {
  filters.value = { search: '', status: 'all', priority: 'all', sort: 'newest' };
  applyFilters();
};

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return projectStore.projects.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(projectStore.projects.length / rowsPerPage.value)),
);
const showingStart = computed(() =>
  projectStore.projects.length === 0 ? 0 : (currentPage.value - 1) * rowsPerPage.value + 1,
);
const showingEnd = computed(() =>
  Math.min(currentPage.value * rowsPerPage.value, projectStore.projects.length),
);

// Stats
const activeProjectCount = computed(() => projectStore.activeProjects.length);
const atRiskProjectCount = computed(() => projectStore.atRiskProjects.length);

const logout = () => {
  authStore.logout();
  router.push('/auth/login');
};

// Dialogs
const showCreateDialog = ref(false);
const showDetailDialog = ref(false);
const projectToEdit = ref(null);
const selectedProjectId = ref('');

const openCreateDialog = () => {
  projectToEdit.value = null;
  showCreateDialog.value = true;
};

const openEditDialog = (project: any) => {
  projectToEdit.value = project;
  showCreateDialog.value = true;
};

const confirmDelete = (project: any) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete "${project.name}"? This will also delete all tasks associated with it.`,
    cancel: true,
    persistent: true,
    color: 'red',
  }).onOk(async () => {
    try {
      await projectStore.deleteProject(project.id);
      $q.notify({ type: 'positive', message: 'Project deleted' });
      // adjust pagination if needed
      if (paginatedProjects.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Error deleting project' });
    }
  });
};

const markComplete = async (project: any) => {
  try {
    await projectStore.updateProject(project.id, { status: 'completed' });
    $q.notify({ type: 'positive', message: 'Project marked as completed' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error updating project' });
  }
};

const openProjectDetail = (project: any) => {
  selectedProjectId.value = project.id;
  showDetailDialog.value = true;
};
</script>

<style scoped>
:deep(.q-field--dense .q-field__bottom) {
  display: none;
}
:deep(.q-field--outlined .q-field__control) {
  padding: 0 12px;
}
</style>
