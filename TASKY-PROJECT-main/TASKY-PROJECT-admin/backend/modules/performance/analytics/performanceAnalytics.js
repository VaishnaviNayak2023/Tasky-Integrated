/**
 * Performance Analytics Service
 * 
 * AI-powered analytics and insights generation
 */

let pool;

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
 * Calculate dashboard summary from task data
 */
async function calculateDashboardSummary(userId, filters = {}) {
  const query = `
    SELECT 
      -- Productivity Score: Based on completion rate and on-time rate
      ROUND(
        (
          (SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) * 0.6 +
          (SUM(CASE WHEN t.status = 'completed' AND t.completed_at <= t.deadline THEN 1 ELSE 0 END) * 100.0 / NULLIF(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)) * 0.4
        ),
        2
      ) as productivityScore,
      
      -- Completion Rate
      ROUND(
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0),
        2
      ) as completionRate,
      
      -- On-Time Rate
      ROUND(
        SUM(CASE WHEN t.status = 'completed' AND t.completed_at <= t.deadline THEN 1 ELSE 0 END) * 100.0 / NULLIF(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0),
        2
      ) as onTimeRate,
      
      -- Focus Score: Based on task complexity and completion quality
      ROUND(
        AVG(
          CASE 
            WHEN t.priority = 'critical' AND t.status = 'completed' THEN 95
            WHEN t.priority = 'high' AND t.status = 'completed' THEN 85
            WHEN t.priority = 'medium' AND t.status = 'completed' THEN 75
            WHEN t.priority = 'low' AND t.status = 'completed' THEN 65
            ELSE 50
          END
        ),
        2
      ) as focusScore
    FROM task t
    JOIN task_assignment ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND ta.is_active = 1
      AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows[0] || {
    productivityScore: 0,
    completionRate: 0,
    onTimeRate: 0,
    focusScore: 0,
  };
}

/**
 * Calculate productivity trend from task data
 */
async function calculateProductivityTrend(userId, filters = {}) {
  const query = `
    SELECT 
      DATE_FORMAT(t.created_at, '%Y-%u') as period,
      COUNT(*) as assigned,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN t.status = 'completed' AND t.completed_at > t.deadline THEN 1 ELSE 0 END) as delayed
    FROM task t
    JOIN task_assignment ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND ta.is_active = 1
      AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    GROUP BY DATE_FORMAT(t.created_at, '%Y-%u')
    ORDER BY period ASC
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows;
}

/**
 * Calculate time allocation from task data
 */
async function calculateTimeAllocation(userId, filters = {}) {
  const query = `
    SELECT 
      p.name as category,
      SUM(t.actual_effort) as hours,
      ROUND(SUM(t.actual_effort) / NULLIF((SELECT SUM(actual_effort) FROM task WHERE id IN (
        SELECT task_id FROM task_assignment WHERE user_id = ? AND is_active = 1
      )), 0) * 100, 1) as percentage
    FROM task t
    JOIN project p ON p.id = t.project_id
    JOIN task_assignment ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND ta.is_active = 1
      AND t.status = 'completed'
      AND t.completed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY p.id, p.name
    ORDER BY hours DESC
  `;
  
  const [rows] = await pool.query(query, [userId, userId]);
  return rows;
}

/**
 * Generate AI-powered performance insights
 */
async function generatePerformanceInsights(userId, filters = {}) {
  const insights = [];
  
  // Get performance metrics
  const metricsQuery = `
    SELECT 
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
      SUM(CASE WHEN t.status = 'completed' AND t.completed_at > t.deadline THEN 1 ELSE 0 END) as delayedTasks,
      SUM(CASE WHEN t.priority = 'critical' AND t.status = 'completed' THEN 1 ELSE 0 END) as criticalCompleted,
      SUM(CASE WHEN t.priority = 'critical' THEN 1 ELSE 0 END) as criticalTotal
    FROM task t
    JOIN task_assignment ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND ta.is_active = 1
      AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `;
  
  const [metrics] = await pool.query(metricsQuery, [userId]);
  const data = metrics[0];
  
  // Generate insights based on metrics
  if (data.criticalTotal > 0) {
    const criticalRate = (data.criticalCompleted / data.criticalTotal) * 100;
    if (criticalRate >= 90) {
      insights.push({
        type: 'strongest_area',
        title: 'Strongest Area: Critical Tasks',
        description: `You have a ${criticalRate.toFixed(0)}% completion rate on critical tasks, showing excellent focus on high-priority work.`,
        priority: 'high',
        actionable: false,
      });
    } else if (criticalRate < 70) {
      insights.push({
        type: 'weakest_area',
        title: 'Needs Attention: Critical Tasks',
        description: `Critical task completion rate is ${criticalRate.toFixed(0)}%. Consider prioritizing these tasks to improve overall performance.`,
        priority: 'critical',
        actionable: true,
      });
    }
  }
  
  if (data.delayedTasks > 0) {
    const delayRate = (data.delayedTasks / data.completedTasks) * 100;
    if (delayRate > 20) {
      insights.push({
        type: 'trend_change',
        title: 'Delay Pattern Detected',
        description: `${delayRate.toFixed(0)}% of completed tasks were delayed. Review time estimates and planning.`,
        priority: 'high',
        actionable: true,
      });
    }
  }
  
  // Add recommendation insight
  insights.push({
    type: 'recommendation',
    title: 'Improvement Tip: Plan Ahead',
    description: 'Break down complex tasks into smaller subtasks to improve tracking and completion rates.',
    priority: 'medium',
    actionable: true,
  });
  
  return insights;
}

/**
 * Calculate priority report from task data
 */
async function calculatePriorityReport(userId, filters = {}) {
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
 * Calculate priority trend from task data
 */
async function calculatePriorityTrend(userId, filters = {}) {
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
      AND ta.is_active = 1
      AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    GROUP BY DATE_FORMAT(created_at, '%Y-%u')
    ORDER BY period ASC
  `;
  
  const [rows] = await getPool().query(query, [userId]);
  return rows;
}

export default {
  initPool,
  calculateDashboardSummary,
  calculateProductivityTrend,
  calculateTimeAllocation,
  generatePerformanceInsights,
  calculatePriorityReport,
  calculatePriorityTrend,
};
