/**
 * Performance Analytics Controller
 * 
 * Handles all API endpoints for the performance analytics module
 */

import performanceService from '../service/performanceService.js';
import exportService from '../exports/exportService.js';

/**
 * GET /api/performance/dashboard
 * Returns dashboard summary KPIs
 */
async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const summary = await performanceService.getDashboardSummary(userId, filters);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/trends
 * Returns productivity trend data
 */
async function getProductivityTrend(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const trend = await performanceService.getProductivityTrend(userId, filters);
    res.json(trend);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/time-allocation
 * Returns time allocation data
 */
async function getTimeAllocation(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const allocation = await performanceService.getTimeAllocation(userId, filters);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/goals
 * Returns goal progress data
 */
async function getGoalProgress(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const goals = await performanceService.getGoalProgress(userId, filters);
    res.json(goals);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/insights
 * Returns AI-generated performance insights
 */
async function getPerformanceInsights(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const insights = await performanceService.getPerformanceInsights(userId, filters);
    res.json(insights);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/priority-report
 * Returns detailed priority report data
 */
async function getPriorityReport(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const report = await performanceService.getPriorityReport(userId, filters);
    res.json(report);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/priority-trend
 * Returns priority trend data
 */
async function getPriorityTrend(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const trend = await performanceService.getPriorityTrend(userId, filters);
    res.json(trend);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/tasks-by-priority
 * Returns tasks filtered by priority
 */
async function getTasksByPriority(req, res, next) {
  try {
    const userId = req.auth.sub;
    const filters = req.query;
    
    const tasks = await performanceService.getTasksByPriority(userId, filters);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/performance/export
 * Exports performance report in various formats
 */
async function exportReport(req, res, next) {
  try {
    const userId = req.auth.sub;
    const options = req.body;
    const filters = req.query;
    
    const buffer = await exportService.exportReport(userId, options, filters);
    
    res.setHeader('Content-Type', getContentType(options.format));
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=performance_report_${new Date().toISOString().split('T')[0]}.${options.format}`
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/performance/filter-presets
 * Returns saved filter presets for a user
 */
async function getFilterPresets(req, res, next) {
  try {
    const userId = req.auth.sub;
    const pageType = req.query.pageType;
    
    const presets = await performanceService.getFilterPresets(userId, pageType);
    res.json(presets);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/performance/filter-presets
 * Creates a new filter preset
 */
async function createFilterPreset(req, res, next) {
  try {
    const userId = req.auth.sub;
    const preset = req.body;
    
    const created = await performanceService.createFilterPreset(userId, preset);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/performance/filter-presets/:id
 * Updates an existing filter preset
 */
async function updateFilterPreset(req, res, next) {
  try {
    const userId = req.auth.sub;
    const presetId = req.params.id;
    const updates = req.body;
    
    const updated = await performanceService.updateFilterPreset(userId, presetId, updates);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/performance/filter-presets/:id
 * Deletes a filter preset
 */
async function deleteFilterPreset(req, res, next) {
  try {
    const userId = req.auth.sub;
    const presetId = req.params.id;
    
    await performanceService.deleteFilterPreset(userId, presetId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function getContentType(format) {
  const contentTypes = {
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
  };
  return contentTypes[format] || 'application/octet-stream';
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
  exportReport,
  getFilterPresets,
  createFilterPreset,
  updateFilterPreset,
  deleteFilterPreset,
};
