import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { usePmTaskStore } from '../stores/pmTaskStore';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import { useQuasar } from 'quasar';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants';
import { taskService, userService } from '../services/apiClient';

/**
 * Composable for Tasks Page data fetching and business logic
 * Extracted from TasksPage.vue to make the page thin
 */
export function useTasksPage() {
  const route = useRoute();
  const authStore = useAuthStore();
  const taskStore = usePmTaskStore();
  const projectStore = useProjectStore();
  const taskStoreCommon = useTaskStore();
  const $q = useQuasar();

  // Filters state
  const filters = ref({
    search: (route.query.search as string) || '',
    project: 'all',
    status: 'all',
    priority: 'all',
  });

  // Dialog state
  const showCreateDialog = ref(false);
  const showDetailDialog = ref(false);
  const showAssignReviewerDialog = ref(false);
  const showFinalizeReviewDialog = ref(false);
  const taskToEdit = ref(null);
  const selectedTaskId = ref('');
  const selectedTaskForReview = ref<any>(null);
  const selectedTaskForFinalize = ref<any>(null);
  const selectedReviewerId = ref<number | null>(null);
  const pmFinalComment = ref('');
  const assigning = ref(false);
  const finalizing = ref(false);

  // Project options
  const projectOptions = computed(() => {
    const opts = [{ label: 'All Projects', value: 'all' }];
    projectStore.projects.forEach((p: any) => {
      opts.push({ label: p.name, value: p.id });
    });
    return opts;
  });

  // Employee options for reviewer assignment
  const employeeOptions = computed(() => {
    return taskStoreCommon.employees
      .filter((e: any) => e.id !== authStore.user?.id)
      .map((e: any) => ({ label: `${e.first_name} ${e.last_name}`, value: e.id }));
  });

  const hasActiveFilters = computed(() => {
    return (
      filters.value.search !== '' ||
      filters.value.project !== 'all' ||
      filters.value.status !== 'all' ||
      filters.value.priority !== 'all'
    );
  });

  onMounted(async () => {
    if (projectStore.projects.length === 0) {
      await projectStore.fetchProjects();
    }
    await applyFilters();

    // If instructed to open a specific task by URL
    if (route.query.open) {
      selectedTaskId.value = route.query.open as string;
      showDetailDialog.value = true;
    }
  });

  const applyFilters = async () => {
    await taskStore.fetchTasks(filters.value);
  };

  const clearFilters = () => {
    filters.value = { search: '', project: 'all', status: 'all', priority: 'all' };
    applyFilters();
  };

  const logout = () => {
    authStore.logout();
    // Router will be handled by the page component
  };

  // Dialog management
  const openCreateDialog = () => {
    taskToEdit.value = null;
    showCreateDialog.value = true;
  };

  const openEditDialog = (task: any) => {
    taskToEdit.value = task;
    showCreateDialog.value = true;
  };

  const openTaskDetail = (task: any) => {
    selectedTaskId.value = task.id;
    showDetailDialog.value = true;
  };

  const onTaskSaved = () => {
    applyFilters();
  };

  const onTaskDeleted = () => {
    applyFilters();
  };

  const confirmDelete = (task: any) => {
    $q.dialog({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${task.title}"?`,
      cancel: true,
      persistent: true,
      color: 'red',
    }).onOk(async () => {
      try {
        await taskStore.deleteTask(task.id);
        $q.notify({ type: 'positive', message: 'Task deleted' });
        applyFilters();
      } catch (err: any) {
        $q.notify({ type: 'negative', message: err.message || 'Error deleting task' });
      }
    });
  };

  // Review workflow
  const openAssignReviewerDialog = async (task: any) => {
    selectedTaskForReview.value = task;
    selectedReviewerId.value = null;
    await taskStoreCommon.fetchEmployees();
    showAssignReviewerDialog.value = true;
  };

  const assignReviewer = async () => {
    if (!selectedReviewerId.value || !selectedTaskForReview.value) return;

    assigning.value = true;
    try {
      const response = await taskService.submitForReview(selectedTaskForReview.value.id, {
        completion_comment: 'Task completed by employee',
        reviewer_id: selectedReviewerId.value,
      });

      if (response.success) {
        $q.notify({ type: 'positive', message: 'Reviewer assigned successfully' });
        showAssignReviewerDialog.value = false;
        applyFilters();
      } else {
        $q.notify({ type: 'negative', message: response.error || 'Error assigning reviewer' });
      }
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Error assigning reviewer' });
    } finally {
      assigning.value = false;
    }
  };

  const openFinalizeReviewDialog = (task: any) => {
    selectedTaskForFinalize.value = task;
    pmFinalComment.value = '';
    showFinalizeReviewDialog.value = true;
  };

  const finalizeReview = async () => {
    if (!selectedTaskForFinalize.value) return;

    finalizing.value = true;
    try {
      const response = await taskService.finalizeReview(selectedTaskForFinalize.value.id, {
        pm_final_comment: pmFinalComment.value,
      });

      if (response.success) {
        $q.notify({ type: 'positive', message: 'Review finalized successfully' });
        showFinalizeReviewDialog.value = false;
        applyFilters();
      } else {
        $q.notify({ type: 'negative', message: response.error || 'Error finalizing review' });
      }
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Error finalizing review' });
    } finally {
      finalizing.value = false;
    }
  };

  return {
    // State
    filters,
    showCreateDialog,
    showDetailDialog,
    showAssignReviewerDialog,
    showFinalizeReviewDialog,
    taskToEdit,
    selectedTaskId,
    selectedTaskForReview,
    selectedTaskForFinalize,
    selectedReviewerId,
    pmFinalComment,
    assigning,
    finalizing,

    // Computed
    projectOptions,
    employeeOptions,
    hasActiveFilters,

    // Constants
    STATUS_OPTIONS,
    PRIORITY_OPTIONS,

    // Functions
    applyFilters,
    clearFilters,
    logout,
    openCreateDialog,
    openEditDialog,
    openTaskDetail,
    onTaskSaved,
    onTaskDeleted,
    confirmDelete,
    openAssignReviewerDialog,
    assignReviewer,
    openFinalizeReviewDialog,
    finalizeReview,
  };
}
