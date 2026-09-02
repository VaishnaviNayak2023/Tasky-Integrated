import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';

interface DailyTask {
  id: number;
  title: string;
  description: string;
  date: string;
  progress: number;
  status: string;
  project_name?: string;
}

/**
 * Composable for Daily Tracker data fetching and business logic
 */
export function useDailyTracker() {
  const { user } = useAuthStore();
  const showAddDialog = ref(false);
  const editingTask = ref<DailyTask | null>(null);
  const loading = ref(false);
  const projects = ref<any[]>([]);

  const newTask = ref({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    progress: 0,
    status: 'Not Started',
    project_name: '',
  });

  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
  const dailyTasks = ref<DailyTask[]>([]);

  // Fetch projects for selection
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      const result = await response.json();
      console.log('Projects API response:', result);
      if (result.success && result.projects) {
        projects.value = result.projects;
        console.log('Projects loaded:', projects.value);
      } else {
        console.error('Projects fetch failed:', result);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Fetch daily tracker entries from database
  const fetchDailyTasks = async () => {
    if (!user?.id) return;

    loading.value = true;
    try {
      const response = await fetch(`http://localhost:3001/api/employee/daily-tracker/${user.id}`);
      const result = await response.json();

      if (result.success && result.entries) {
        dailyTasks.value = result.entries.map((entry: any) => ({
          id: entry.id,
          title: entry.title,
          description: entry.description || '',
          date: entry.date,
          progress: parseFloat(entry.progress) || 0,
          status: entry.status || 'Not Started',
          project_name: entry.project_name || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
    } finally {
      loading.value = false;
    }
  };

  const summary = computed(() => {
    const total = dailyTasks.value.length;
    const completed = dailyTasks.value.filter((t) => t.status === 'Completed').length;
    const inProgress = dailyTasks.value.filter((t) => t.status === 'In Progress').length;
    const avgProgress =
      total > 0 ? Math.round(dailyTasks.value.reduce((sum, t) => sum + t.progress, 0) / total) : 0;

    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      averageProgress: avgProgress,
      remainingTasks: total - completed,
    };
  });

  const projectSummary = computed(() => {
    const projects: Record<string, { taskCount: number; totalProgress: number }> = {};

    dailyTasks.value.forEach((task) => {
      const projectName = task.project_name || 'No Project';
      if (!projects[projectName]) {
        projects[projectName] = { taskCount: 0, totalProgress: 0 };
      }
      projects[projectName].taskCount++;
      projects[projectName].totalProgress += task.progress;
    });

    return Object.entries(projects).map(([name, data]) => ({
      name,
      taskCount: data.taskCount,
      avgProgress: Math.round(data.totalProgress / data.taskCount),
    }));
  });

  const insights = computed(() => {
    const insightsList: string[] = [];
    const { totalTasks, completedTasks, inProgressTasks, averageProgress, remainingTasks } =
      summary.value;

    if (inProgressTasks > 0) {
      insightsList.push(`${inProgressTasks} tasks are currently in progress.`);
    }

    if (averageProgress < 50 && totalTasks > 0) {
      insightsList.push('Average progress is below 50%. Consider focusing on completing tasks.');
    }

    if (completedTasks === 0 && totalTasks > 0) {
      insightsList.push('No tasks completed yet. Start by finishing at least one task.');
    }

    if (totalTasks > 5) {
      insightsList.push(
        `You have ${totalTasks} tasks. Consider prioritizing the most important ones.`,
      );
    }

    const notStarted = dailyTasks.value.filter((t) => t.status === 'Not Started').length;
    if (notStarted > 0) {
      insightsList.push(`${notStarted} tasks haven't been started yet.`);
    }

    if (remainingTasks > 0) {
      insightsList.push(`${remainingTasks} tasks remain to be completed.`);
    }

    const onHold = dailyTasks.value.filter((t) => t.status === 'On Hold').length;
    if (onHold > 0) {
      insightsList.push(`${onHold} tasks are on hold. Review and update their status.`);
    }

    // Project-specific insights
    if (projectSummary.value.length > 0) {
      const slowProjects = projectSummary.value.filter((p) => p.avgProgress < 50);
      if (slowProjects.length > 0) {
        insightsList.push(`${slowProjects.length} project(s) have average progress below 50%.`);
      }
    }

    return insightsList;
  });

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      Completed: 'green',
      'In Progress': 'blue',
      'Not Started': 'grey',
      'On Hold': 'orange',
    };
    return colors[status] || 'grey';
  }

  function editTask(task: DailyTask) {
    editingTask.value = task;
    newTask.value = {
      title: task.title || '',
      description: task.description || '',
      date: task.date,
      progress: task.progress,
      status: task.status || 'Not Started',
      project_name: task.project_name || '',
    };
    showAddDialog.value = true;
  }

  async function saveTask() {
    if (!newTask.value.title || !newTask.value.date || !user?.id) return;

    loading.value = true;
    try {
      if (editingTask.value) {
        // Update existing task
        const response = await fetch(
          `http://localhost:3001/api/employee/daily-tracker/${editingTask.value.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newTask.value.title,
              description: newTask.value.description,
              date: newTask.value.date,
              progress: newTask.value.progress,
              status: newTask.value.status,
              project_name: newTask.value.project_name,
            }),
          },
        );

        const result = await response.json();
        if (result.success) {
          await fetchDailyTasks();
        }
      } else {
        // Add new task
        const response = await fetch('http://localhost:3001/api/employee/daily-tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: user.id,
            title: newTask.value.title,
            description: newTask.value.description,
            date: newTask.value.date,
            progress: newTask.value.progress,
            status: newTask.value.status,
            project_name: newTask.value.project_name,
          }),
        });

        const result = await response.json();
        if (result.success) {
          await fetchDailyTasks();
        }
      }

      showAddDialog.value = false;
      editingTask.value = null;
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      loading.value = false;
    }
  }

  async function deleteTask(id: number) {
    loading.value = true;
    try {
      const response = await fetch(`http://localhost:3001/api/employee/daily-tracker/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        await fetchDailyTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    newTask.value = {
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      progress: 0,
      status: 'Not Started',
      project_name: '',
    };
  }

  onMounted(() => {
    fetchDailyTasks();
    fetchProjects();
  });

  return {
    showAddDialog,
    editingTask,
    loading,
    projects,
    newTask,
    statusOptions,
    dailyTasks,
    summary,
    projectSummary,
    insights,
    getStatusColor,
    editTask,
    saveTask,
    deleteTask,
    resetForm,
  };
}
