/**
 * Priority color mappings for Quasar components
 * Centralized to ensure consistency across the application
 */
export const PRIORITY_COLORS = {
  critical: 'red',
  high: 'orange',
  medium: 'blue',
  low: 'green',
} as const;

export type PriorityColor = keyof typeof PRIORITY_COLORS;

/**
 * Get Quasar color for a given priority
 */
export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority as PriorityColor] || 'grey';
}

/**
 * Priority options for q-select components
 * Should be replaced with API-driven options in production
 */
export const PRIORITY_OPTIONS = [
  { label: 'All Priorities', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
