import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import { useQuasar } from 'quasar';
import { PROJECT_STATUS_OPTIONS, PROJECT_PRIORITY_OPTIONS, PROJECT_SORT_OPTIONS } from '../constants';
import { projectService } from '../services/apiClient';

/**
 * Composable for Projects Page data fetching and business logic
 * Extracted from ProjectsPage.vue to make the page thin
 */
export function useProjectsPage() {
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

  // Dialog state
  const showCreateDialog = ref(false);
  const showDetailDialog = ref(false);
  const projectToEdit = ref(null);
  const selectedProjectId = ref('');

  // Pagination
  const rowsPerPage = ref(5);
  const currentPage = ref(1);

  const hasActiveFilters = computed(() => {
    return (
      filters.value.search !== '' ||
      filters.value.status !== 'all' ||
      filters.value.priority !== 'all'
    );
  });

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
    // Router will be handled by the page component
  };

  // Dialog management
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

  return {
    // State
    filters,
    showCreateDialog,
    showDetailDialog,
    projectToEdit,
    selectedProjectId,
    rowsPerPage,
    currentPage,

    // Computed
    hasActiveFilters,
    paginatedProjects,
    totalPages,
    showingStart,
    showingEnd,
    activeProjectCount,
    atRiskProjectCount,

    // Constants
    PROJECT_STATUS_OPTIONS,
    PROJECT_PRIORITY_OPTIONS,
    PROJECT_SORT_OPTIONS,

    // Functions
    applyFilters,
    clearFilters,
    logout,
    openCreateDialog,
    openEditDialog,
    confirmDelete,
    markComplete,
    openProjectDetail,
  };
}
