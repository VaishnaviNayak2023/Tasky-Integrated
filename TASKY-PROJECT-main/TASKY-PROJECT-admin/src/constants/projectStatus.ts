/**
 * Project status color mappings for Quasar components
 */
export const PROJECT_STATUS_COLORS = {
  planning: 'grey',
  active: 'indigo',
  'on-hold': 'orange',
  completed: 'green',
} as const;

export type ProjectStatusColor = keyof typeof PROJECT_STATUS_COLORS;

/**
 * Get Quasar color for a given project status
 */
export function getProjectStatusColor(status: string): string {
  return PROJECT_STATUS_COLORS[status as ProjectStatusColor] || 'grey';
}

/**
 * Project status options for q-select components
 * Should be replaced with API-driven options in production
 */
export const PROJECT_STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on-hold' },
  { label: 'Completed', value: 'completed' },
];

/**
 * Project priority options
 */
export const PROJECT_PRIORITY_OPTIONS = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

/**
 * Project sort options
 */
export const PROJECT_SORT_OPTIONS = [
  { label: 'Sort: Newest', value: 'newest' },
  { label: 'Sort: Oldest', value: 'oldest' },
  { label: 'Sort: Priority', value: 'priority' },
  { label: 'Sort: Progress', value: 'progress' },
  { label: 'Sort: Deadline', value: 'deadline' },
];
