/**
 * Performance Analytics Repository
 * 
 * Database access layer for performance analytics
 */

let pool;

// Initialize pool when the module is loaded
export function initPool(poolInstance) {
  pool = poolInstance;
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

/**
 * Get dashboard summary for a user
 */
async function getDashboardSummary(userId, filters = {}) {
  const query = `
    SELECT 
      COALESCE(AVG(productivity_score), 0) as productivityScore,
      COALESCE(AVG(completion_rate), 0) as completionRate,
      COALESCE(AVG(on_time_rate), 0) as onTimeRate,
      COALESCE(AVG(focus_score), 0) as focusScore
    FROM performance_snapshots
    WHERE employee_id = ?
      AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows[0];
}

/**
 * Get productivity trend data
 */
async function getProductivityTrend(userId, filters = {}) {
  const query = `
    SELECT 
      DATE_FORMAT(snapshot_date, '%Y-%u') as period,
      AVG(productivity_score) as productivityScore,
      AVG(completion_rate) as completionRate,
      AVG(on_time_rate) as onTimeRate
    FROM performance_snapshots
    WHERE employee_id = ?
      AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    GROUP BY DATE_FORMAT(snapshot_date, '%Y-%u')
    ORDER BY period ASC
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows;
}

/**
 * Get time allocation data
 */
async function getTimeAllocation(userId, filters = {}) {
  const query = `
    SELECT 
      p.name as category,
      SUM(t.actual_effort) as hours,
      ROUND(SUM(t.actual_effort) / (SELECT SUM(actual_effort) FROM task WHERE id IN (
        SELECT task_id FROM task_assignment WHERE user_id = ?
      )) * 100, 1) as percentage
    FROM task t
    JOIN project p ON p.id = t.project_id
    JOIN task_assignment ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND t.status = 'completed'
      AND t.completed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY p.id, p.name
    ORDER BY hours DESC
  `;
  
  const [rows] = await pool.query(query, [userId, userId]);
  return rows;
}

/**
 * Get goal progress data
 */
async function getGoalProgress(userId, filters = {}) {
  const query = `
    SELECT 
      id,
      goal_name as goalName,
      goal_type as goalType,
      target_value as targetValue,
      current_value as currentValue,
      status,
      start_date as startDate,
      end_date as endDate
    FROM performance_goals
    WHERE employee_id = ?
      AND (end_date IS NULL OR end_date >= CURDATE())
    ORDER BY end_date ASC
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows;
}

/**
 * Get priority report
 */
async function getPriorityReport(userId, filters = {}) {
  const query = `
    SELECT 
      priority,
      COUNT(*) as totalTasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
      SUM(CASE WHEN status = 'completed' AND completed_at > deadline THEN 1 ELSE 0 END) as delayedTasks,
      ROUND(
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / 
        NULLIF(COUNT(*), 0), 
        2
      ) as completionRate,
      ROUND(AVG(
        CASE 
          WHEN status = 'completed' 
          THEN DATEDIFF(completed_at, start_date) 
          ELSE NULL 
        END
      ), 2) as avgCompletionTime
    FROM task t
    JOIN task_assignment ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND ta.is_active = 1
    GROUP BY priority
    ORDER BY FIELD(priority, 'critical', 'high', 'medium', 'low')
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows;
}

/**
 * Get priority trend
 */
async function getPriorityTrend(userId, filters = {}) {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%u') as period,
      SUM(CASE WHEN priority = 'critical' AND status = 'completed' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN priority = 'high' AND status = 'completed' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN priority = 'medium' AND status = 'completed' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN priority = 'low' AND status = 'completed' THEN 1 ELSE 0 END) as low
    FROM task t
    JOIN task_assignment ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    GROUP BY DATE_FORMAT(created_at, '%Y-%u')
    ORDER BY period ASC
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows;
}

/**
 * Get tasks by priority
 */
async function getTasksByPriority(userId, filters = {}) {
  let query = `
    SELECT 
      t.id,
      t.title as name,
      p.name as project,
      CONCAT(u.first_name, ' ', u.last_name) as assignee,
      t.priority,
      t.status,
      t.created_at as createdAt,
      t.deadline as dueDate,
      CASE 
        WHEN t.status = 'completed' 
        THEN DATEDIFF(t.completed_at, t.start_date) 
        ELSE NULL 
      END as completionTime
    FROM task t
    JOIN project p ON p.id = t.project_id
    JOIN task_assignment ta ON ta.task_id = t.id
    JOIN user u ON u.id = ta.user_id
    WHERE ta.user_id = ?
      AND ta.is_active = 1
  `;
  
  const params = [userId];
  
  // Apply filters
  if (filters.priority) {
    query += ' AND t.priority = ?';
    params.push(filters.priority);
  }
  
  if (filters.status) {
    query += ' AND t.status = ?';
    params.push(filters.status);
  }
  
  if (filters.project) {
    query += ' AND t.project_id = ?';
    params.push(filters.project);
  }
  
  query += ' ORDER BY FIELD(t.priority, "critical", "high", "medium", "low"), t.deadline ASC';
  
  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * Get filter presets
 */
async function getFilterPresets(userId, pageType) {
  const query = `
    SELECT 
      id,
      name,
      page_type as pageType,
      is_default as isDefault,
      is_favorite as isFavorite,
      is_shared as isShared,
      filter_json as filterJson,
      created_at as createdAt,
      updated_at as updatedAt
    FROM saved_filter_presets
    WHERE user_id = ?
      AND page_type = ?
    ORDER BY is_favorite DESC, updated_at DESC
  `;
  
  const [rows] = await pool.query(query, [userId, pageType]);
  return rows;
}

/**
 * Create filter preset
 */
async function createFilterPreset(userId, preset) {
  const query = `
    INSERT INTO saved_filter_presets (
      user_id, page_type, name, is_default, is_favorite, is_shared, filter_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await pool.query(query, [
    userId,
    preset.pageType,
    preset.name,
    preset.isDefault || false,
    preset.isFavorite || false,
    preset.isShared || false,
    JSON.stringify(preset.filterJson),
  ]);
  
  return {
    id: result.insertId,
    ...preset,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update filter preset
 */
async function updateFilterPreset(userId, presetId, updates) {
  const fields = [];
  const params = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }
  
  if (updates.isFavorite !== undefined) {
    fields.push('is_favorite = ?');
    params.push(updates.isFavorite);
  }
  
  if (updates.isShared !== undefined) {
    fields.push('is_shared = ?');
    params.push(updates.isShared);
  }
  
  if (updates.filterJson !== undefined) {
    fields.push('filter_json = ?');
    params.push(JSON.stringify(updates.filterJson));
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  fields.push('updated_at = NOW()');
  params.push(userId, presetId);
  
  const query = `
    UPDATE saved_filter_presets
    SET ${fields.join(', ')}
    WHERE id = ? AND user_id = ?
  `;
  
  await getPool().query(query, params);
  
  return { id: presetId, ...updates, updatedAt: new Date().toISOString() };
}

/**
 * Delete filter preset
 */
async function deleteFilterPreset(userId, presetId) {
  const query = `
    DELETE FROM saved_filter_presets
    WHERE id = ? AND user_id = ?
  `;
  
  await pool.query(query, [presetId, userId]);
}

export default {
  initPool,
  getDashboardSummary,
  getProductivityTrend,
  getTimeAllocation,
  getGoalProgress,
  getPriorityReport,
  getPriorityTrend,
  getTasksByPriority,
  getFilterPresets,
  createFilterPreset,
  updateFilterPreset,
  deleteFilterPreset,
};
