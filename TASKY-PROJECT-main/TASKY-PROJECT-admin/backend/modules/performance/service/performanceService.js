/**
 * Performance Analytics Service
 * 
 * Business logic for performance analytics
 */

import performanceRepository from '../repository/performanceRepository.js';
import performanceAnalytics from '../analytics/performanceAnalytics.js';

/**
 * Get dashboard summary for a user
 */
async function getDashboardSummary(userId, filters = {}) {
  const summary = await performanceRepository.getDashboardSummary(userId, filters);
  
  // If no data exists, calculate from task data
  if (!summary || summary.productivityScore === null) {
    return await performanceAnalytics.calculateDashboardSummary(userId, filters);
  }
  
  return summary;
}

/**
 * Get productivity trend data
 */
async function getProductivityTrend(userId, filters = {}) {
  const trend = await performanceRepository.getProductivityTrend(userId, filters);
  
  if (!trend || trend.length === 0) {
    return await performanceAnalytics.calculateProductivityTrend(userId, filters);
  }
  
  return trend;
}

/**
 * Get time allocation data
 */
async function getTimeAllocation(userId, filters = {}) {
  const allocation = await performanceRepository.getTimeAllocation(userId, filters);
  
  if (!allocation || allocation.length === 0) {
    return await performanceAnalytics.calculateTimeAllocation(userId, filters);
  }
  
  return allocation;
}

/**
 * Get goal progress data
 */
async function getGoalProgress(userId, filters = {}) {
  const goals = await performanceRepository.getGoalProgress(userId, filters);
  
  // Calculate completion percentages
  return goals.map(goal => ({
    ...goal,
    percentage: goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0,
  }));
}

/**
 * Get performance insights
 */
async function getPerformanceInsights(userId, filters = {}) {
  const insights = await performanceAnalytics.generatePerformanceInsights(userId, filters);
  return insights;
}

/**
 * Get priority report
 */
async function getPriorityReport(userId, filters = {}) {
  const report = await performanceRepository.getPriorityReport(userId, filters);
  
  if (!report || report.length === 0) {
    return await performanceAnalytics.calculatePriorityReport(userId, filters);
  }
  
  return report;
}

/**
 * Get priority trend
 */
async function getPriorityTrend(userId, filters = {}) {
  const trend = await performanceRepository.getPriorityTrend(userId, filters);
  
  if (!trend || trend.length === 0) {
    return await performanceAnalytics.calculatePriorityTrend(userId, filters);
  }
  
  return trend;
}

/**
 * Get tasks by priority
 */
async function getTasksByPriority(userId, filters = {}) {
  const tasks = await performanceRepository.getTasksByPriority(userId, filters);
  return tasks;
}

/**
 * Get filter presets
 */
async function getFilterPresets(userId, pageType) {
  return await performanceRepository.getFilterPresets(userId, pageType);
}

/**
 * Create filter preset
 */
async function createFilterPreset(userId, preset) {
  return await performanceRepository.createFilterPreset(userId, preset);
}

/**
 * Update filter preset
 */
async function updateFilterPreset(userId, presetId, updates) {
  return await performanceRepository.updateFilterPreset(userId, presetId, updates);
}

/**
 * Delete filter preset
 */
async function deleteFilterPreset(userId, presetId) {
  return await performanceRepository.deleteFilterPreset(userId, presetId);
}

export default {
  getDashboardSummary,
  getProductivityTrend,
  getTimeAllocation,
  getGoalProgress,
  getPerformanceInsights,
  getPriorityReport,
  getPriorityTrend,
  getTasksByPriority,
  getFilterPresets,
  createFilterPreset,
  updateFilterPreset,
  deleteFilterPreset,
};
