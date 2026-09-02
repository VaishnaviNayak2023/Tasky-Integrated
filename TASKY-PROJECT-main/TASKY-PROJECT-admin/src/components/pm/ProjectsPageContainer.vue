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
                <q-item clickable v-close-popup @click="handleLogout">
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
        :model-value="filters.search"
        @update:model-value="handleSearchChange"
        outlined
        dense
        rounded
        bg-color="white"
        placeholder="Search projects..."
        style="width: 250px"
        clearable
        @clear="handleSearchChange('')"
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
          :options="PROJECT_STATUS_OPTIONS"
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
          :options="PROJECT_PRIORITY_OPTIONS"
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
          :options="PROJECT_SORT_OPTIONS"
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';
import { useProjectsPage } from '../../composables/useProjectsPage';
import {
  PROJECT_STATUS_OPTIONS,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_SORT_OPTIONS,
} from '../../constants';
import ProjectListCard from '../ProjectListCard.vue';
import CreateProjectDialog from '../CreateProjectDialog.vue';
import ProjectDetailDialog from '../ProjectDetailDialog.vue';

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

// Use the composable for data fetching and business logic
const {
  filters,
  showCreateDialog,
  showDetailDialog,
  projectToEdit,
  selectedProjectId,
  rowsPerPage,
  currentPage,
  hasActiveFilters,
  paginatedProjects,
  totalPages,
  showingStart,
  showingEnd,
  activeProjectCount,
  atRiskProjectCount,
  PROJECT_STATUS_OPTIONS: projectStatusOptions,
  PROJECT_PRIORITY_OPTIONS: projectPriorityOptions,
  PROJECT_SORT_OPTIONS: projectSortOptions,
  applyFilters,
  handleSearchChange,
  clearFilters,
  logout,
  openCreateDialog,
  openEditDialog,
  confirmDelete,
  markComplete,
  openProjectDetail,
} = useProjectsPage();

const handleLogout = () => {
  logout();
  router.push('/auth/login');
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
