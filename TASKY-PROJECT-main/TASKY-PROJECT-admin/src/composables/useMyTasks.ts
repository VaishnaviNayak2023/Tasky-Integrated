import { ref, computed } from 'vue';
import { useTaskStore } from '../stores/taskStore';

/**
 * Composable for My Tasks page data fetching and business logic
 */
export function useMyTasks() {
  const taskStore = useTaskStore();

  const showCreateTaskDialog = ref(false);
  const showTaskDialog = ref(false);
  const showUpdateDialog = ref(false);
  const selectedTask = ref<any>(null);
  const progressUpdate = ref(0);
  const progressNotes = ref('');

  const filters = ref({
    project: null as number | null,
    status: null as string | null,
    priority: null as string | null,
  });

  const newTask = ref({
    title: '',
    description: '',
    projectId: null as number | null,
    deadline: '',
    expectedEffort: 8,
    priority: 'medium',
  });

  const statusOptions = ['not-started', 'in-progress', 'completed', 'blocked'];
  const priorityOptions = ['critical', 'high', 'medium', 'low'];

  const currentEmployee = computed(() => taskStore.currentEmployeeData);
  const projectsList = computed(() => taskStore.projectsList);

  const projectOptions = computed(() =>
    projectsList.value.map((p) => ({ label: p.name, value: p.id })),
  );

  const myTasks = computed(() => {
    if (!currentEmployee.value) return [];
    return taskStore.getTasksByEmployee(String(currentEmployee.value.id));
  });

  const filteredTasks = computed(() => {
    let tasks = myTasks.value;

    if (filters.value.project) {
      tasks = tasks.filter((t) => t.project_id === filters.value.project);
    }
    if (filters.value.status) {
      tasks = tasks.filter((t) => t.status === filters.value.status);
    }
    if (filters.value.priority) {
      tasks = tasks.filter((t) => t.priority === filters.value.priority);
    }

    return tasks;
  });

  function getProjectById(id: number | string) {
    return taskStore.getProjectById(id);
  }

  function getEmployeeById(id: string | number) {
    const emp = taskStore.getEmployeeById(id);
    if (emp) {
      return {
        ...emp,
        name: `${emp.first_name} ${emp.last_name}`,
      };
    }
    return null;
  }

  function getProgressUpdatesByTask(taskId: string | number) {
    return taskStore.getProgressUpdatesByTask(String(taskId));
  }

  function getPriorityColor(priority: string) {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'green',
    };
    return colors[priority] || 'grey';
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'not-started': 'grey',
      'in-progress': 'blue',
      completed: 'green',
      blocked: 'red',
    };
    return colors[status] || 'grey';
  }

  function getProgressColor(progress: number) {
    if (progress >= 75) return 'green';
    if (progress >= 50) return 'blue';
    if (progress >= 25) return 'orange';
    return 'red';
  }

  function isOverdue(deadline: string) {
    return new Date(deadline) < new Date();
  }

  function clearFilters() {
    filters.value = {
      project: null,
      status: null,
      priority: null,
    };
  }

  function showTaskDetail(task: any) {
    selectedTask.value = task;
    showTaskDialog.value = true;
  }

  function openUpdateDialog(task: any) {
    selectedTask.value = task;
    progressUpdate.value = task.progress;
    progressNotes.value = '';
    showUpdateDialog.value = true;
    showTaskDialog.value = false;
  }

  async function createSelfAssignedTask() {
    if (!newTask.value.title || !newTask.value.projectId || !currentEmployee.value) return;

    try {
      await taskStore.addTask({
        project_id: newTask.value.projectId,
        title: newTask.value.title,
        description: newTask.value.description,
        status: 'not-started',
        priority: newTask.value.priority as 'medium' | 'critical' | 'high' | 'low',
        deadline: newTask.value.deadline,
        expected_effort: newTask.value.expectedEffort,
        is_self_assigned: 1,
      });

      showCreateTaskDialog.value = false;
      newTask.value = {
        title: '',
        description: '',
        projectId: null,
        deadline: '',
        expectedEffort: 8,
        priority: 'medium',
      };
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  async function updateProgress() {
    if (selectedTask.value && progressUpdate.value > selectedTask.value.progress) {
      const updates: { progress: number; status?: 'completed' } = { progress: progressUpdate.value };
      if (progressUpdate.value === 100) {
        updates.status = 'completed';
      }
      await taskStore.updateTask(Number(selectedTask.value.id), updates);
      showUpdateDialog.value = false;
      showTaskDialog.value = false;
    }
  }

  return {
    showCreateTaskDialog,
    showTaskDialog,
    showUpdateDialog,
    selectedTask,
    progressUpdate,
    progressNotes,
    filters,
    newTask,
    statusOptions,
    priorityOptions,
    projectsList,
    projectOptions,
    myTasks,
    filteredTasks,
    getProjectById,
    getEmployeeById,
    getProgressUpdatesByTask,
    getPriorityColor,
    getStatusColor,
    getProgressColor,
    isOverdue,
    clearFilters,
    showTaskDetail,
    openUpdateDialog,
    createSelfAssignedTask,
    updateProgress,
  };
}
