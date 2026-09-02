import { computed, ref, onMounted } from 'vue';
import { useCalendarStore } from '../stores/calendarStore';

/**
 * Composable for Calendar Page data fetching and business logic
 */
export function useCalendarPage() {
  const calendarStore = useCalendarStore();
  const showCreateDialog = ref(false);
  const currentDate = ref(new Date());

  const monthStart = computed(
    () => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1),
  );
  const monthEnd = computed(
    () => new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0),
  );
  const monthLabel = computed(() =>
    currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  );

  const toApiDate = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

  const refreshCalendar = () =>
    calendarStore.fetchCalendarData(toApiDate(monthStart.value), toApiDate(monthEnd.value));

  const changeMonth = (offset: number) => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + offset,
      1,
    );
    refreshCalendar();
  };

  const monthDays = computed(() =>
    Array.from({ length: monthEnd.value.getDate() }, (_, index) => {
      const current = new Date(
        monthStart.value.getFullYear(),
        monthStart.value.getMonth(),
        index + 1,
      );
      return {
        key: current.toISOString().slice(0, 10),
        label: current.getDate(),
        isToday: current.toDateString() === new Date().toDateString(),
      };
    }),
  );

  const resourceRows = computed(() => {
    const rows = new Map<string, any>();
    const tasks = calendarStore.events.filter((event) => event.type === 'task');

    // First, collect all unique assignees from tasks
    const allAssignees = new Set<string>();
    tasks.forEach((event) => {
      if (event.assignees?.length) {
        event.assignees.forEach((assignee: any) => allAssignees.add(String(assignee.id)));
      }
    });

    // Initialize rows for all assignees
    allAssignees.forEach((assigneeId) => {
      const task = tasks.find((t) => t.assignees?.some((a: any) => String(a.id) === assigneeId));
      if (task) {
        const assignee = task.assignees.find((a: any) => String(a.id) === assigneeId);
        rows.set(assigneeId, {
          id: assigneeId,
          name: assignee.name,
          avatar: assignee.avatar,
          initials: assignee.name
            .split(' ')
            .map((part: string) => part[0])
            .join('')
            .slice(0, 2),
          tasks: [],
        });
      }
    });

    // Add tasks to their respective rows
    tasks.forEach((event) => {
      const assignees = event.assignees?.length
        ? event.assignees
        : [{ id: 'unassigned', name: 'Unassigned', avatar: null }];
      assignees.forEach((assignee: any) => {
        const id = String(assignee.id);
        if (!rows.has(id)) {
          rows.set(id, {
            id,
            name: assignee.name,
            avatar: assignee.avatar,
            initials: assignee.name
              .split(' ')
              .map((part: string) => part[0])
              .join('')
              .slice(0, 2),
            tasks: [],
          });
        }
        const start = new Date(event.start);
        const end = new Date(event.end || event.start);
        const startDay = Math.max(1, start < monthStart.value ? 1 : start.getDate());
        const endDay = Math.min(
          monthEnd.value.getDate(),
          end > monthEnd.value ? monthEnd.value.getDate() : end.getDate(),
        );
        const left = ((startDay - 1) / monthDays.value.length) * 100;
        const width = Math.max(
          (Math.max(1, endDay - startDay + 1) / monthDays.value.length) * 100,
          3,
        );
        rows.get(id).tasks.push({
          id: event.id,
          title: event.title,
          status: event.status,
          priority: event.priority,
          progress: event.progress || 0,
          expected_effort: event.expected_effort || 0,
          project_name: event.project_name,
          project_color: event.project_color,
          style: { left: `${left}%`, width: `${width}%` },
        });
      });
    });

    return [...rows.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => ({
        ...row,
        completion: row.tasks.length
          ? Math.round(
              row.tasks.reduce((total: number, task: any) => total + task.progress, 0) /
                row.tasks.length,
            )
          : 0,
      }));
  });

  const completionClass = (completion: number) =>
    completion >= 100 ? 'text-positive' : completion >= 60 ? 'text-indigo' : 'text-orange';

  onMounted(() => {
    refreshCalendar();
  });

  return {
    calendarStore,
    showCreateDialog,
    currentDate,
    monthStart,
    monthEnd,
    monthLabel,
    monthDays,
    resourceRows,
    changeMonth,
    refreshCalendar,
    completionClass,
  };
}
