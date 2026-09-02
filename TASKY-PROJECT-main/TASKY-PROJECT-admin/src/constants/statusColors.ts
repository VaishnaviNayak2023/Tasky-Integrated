/**
 * Status color mappings for Quasar components
 * Centralized to ensure consistency across the application
 */
export const STATUS_COLORS = {
  'not-started': 'grey',
  'in-progress': 'blue',
  'in-review': 'purple',
  completed: 'green',
  blocked: 'red',
  'completed-reviewed': 'green',
  'pending-final': 'orange',
} as const;

export type StatusColor = keyof typeof STATUS_COLORS;

/**
 * Get Quasar color for a given status
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as StatusColor] || 'grey';
}

/**
 * Status options for q-select components
 * Should be replaced with API-driven options in production
 */
export const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Not Started', value: 'not-started' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed (Reviewed)', value: 'completed-reviewed' },
  { label: 'Blocked', value: 'blocked' },
];
