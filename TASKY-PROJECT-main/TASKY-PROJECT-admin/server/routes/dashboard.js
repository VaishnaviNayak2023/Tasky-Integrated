import { Router } from 'express';
const router = Router();

export default function dashboardRoutes(pool) {
  // GET /api/pm/dashboard/stats
  router.get('/stats', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;

      // At-risk projects: projects with delayed tasks
      const [atRiskProjects] = await pool.execute(
        `
        SELECT COUNT(DISTINCT p.id) AS count
        FROM project p
        JOIN task t ON t.project_id = p.id
        WHERE p.org_id = ? AND p.created_by = ? AND p.status IN ('active','planning')
          AND t.status NOT IN ('completed')
          AND t.deadline < CURDATE()
      `,
        [orgId, pmId],
      );

      // Overloaded resources
      const [overloaded] = await pool.execute(
        `
        SELECT COUNT(*) AS count FROM (
          SELECT u.id,
            COALESCE(SUM(
              CASE WHEN ta2.cnt > 0
                THEN (t.expected_effort * (100 - t.progress) / 100) / ta2.cnt
                ELSE 0 END
            ), 0) AS remaining
          FROM user u
          JOIN role r ON r.id = u.role_id
          LEFT JOIN task_assignment ta ON ta.user_id = u.id AND ta.is_active = 1
          LEFT JOIN task t ON t.id = ta.task_id AND t.status IN ('not-started','in-progress','blocked')
          LEFT JOIN (SELECT task_id, COUNT(*) AS cnt FROM task_assignment WHERE is_active=1 GROUP BY task_id) ta2 ON ta2.task_id = t.id
          WHERE u.org_id = ? AND u.is_active = 1 AND r.access_level = 'employee'
          GROUP BY u.id, u.max_hours_per_week
          HAVING remaining > u.max_hours_per_week
        ) sub
      `,
        [orgId],
      );

      // Overdue tasks
      const [overdue] = await pool.execute(
        `
        SELECT COUNT(*) AS count FROM task t
        JOIN project p ON p.id = t.project_id
        WHERE p.org_id = ? AND p.created_by = ?
          AND t.status NOT IN ('completed')
          AND t.deadline < CURDATE()
      `,
        [orgId, pmId],
      );

      // Pending reviews: employees who haven't submitted daily log today
      const [totalEmployees] = await pool.execute(
        `
        SELECT COUNT(*) AS count FROM user u
        JOIN role r ON r.id = u.role_id
        WHERE u.org_id = ? AND u.is_active = 1 AND r.access_level = 'employee'
      `,
        [orgId],
      );

      const [loggedToday] = await pool.execute(
        `
        SELECT COUNT(DISTINCT dlc.user_id) AS count
        FROM daily_log_compliance dlc
        JOIN user u ON u.id = dlc.user_id
        WHERE u.org_id = ? AND dlc.log_date = CURDATE() AND dlc.status = 'logged'
      `,
        [orgId],
      );

      const pendingReviews = totalEmployees[0].count - loggedToday[0].count;

      res.json({
        success: true,
        stats: {
          atRiskProjects: atRiskProjects[0].count,
          overloadedResources: overloaded[0].count,
          overdueTasks: overdue[0].count,
          pendingReviews: Math.max(0, pendingReviews),
        },
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/dashboard/attention
  router.get('/attention', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;

      // Delayed projects
      const [delayedProjects] = await pool.execute(
        `
        SELECT DISTINCT p.id, p.name, p.color, p.priority, p.progress, p.end_date,
          DATEDIFF(CURDATE(), p.end_date) AS days_delayed,
          (SELECT COUNT(*) FROM task t2 WHERE t2.project_id = p.id AND t2.status NOT IN ('completed') AND t2.deadline < CURDATE()) AS overdue_tasks
        FROM project p
        JOIN task t ON t.project_id = p.id
        WHERE p.org_id = ? AND p.created_by = ? AND p.status IN ('active','planning')
          AND t.status NOT IN ('completed') AND t.deadline < CURDATE()
        ORDER BY overdue_tasks DESC
      `,
        [orgId, pmId],
      );

      // Overloaded resources
      const [overloadedResources] = await pool.execute(
        `
        SELECT u.id, u.first_name, u.last_name, u.avatar, u.employee_code,
          r.name AS role_name, u.max_hours_per_week,
          COALESCE(SUM(
            CASE WHEN ta2.cnt > 0
              THEN (t.expected_effort * (100 - t.progress) / 100) / ta2.cnt
              ELSE 0 END
          ), 0) AS remaining_hours,
          COUNT(DISTINCT t.project_id) AS project_count
        FROM user u
        JOIN role r ON r.id = u.role_id
        LEFT JOIN task_assignment ta ON ta.user_id = u.id AND ta.is_active = 1
        LEFT JOIN task t ON t.id = ta.task_id AND t.status IN ('not-started','in-progress','blocked')
        LEFT JOIN (SELECT task_id, COUNT(*) AS cnt FROM task_assignment WHERE is_active=1 GROUP BY task_id) ta2 ON ta2.task_id = t.id
        WHERE u.org_id = ? AND u.is_active = 1 AND r.access_level = 'employee'
        GROUP BY u.id, u.first_name, u.last_name, u.avatar, u.employee_code, r.name, u.max_hours_per_week
        HAVING remaining_hours > u.max_hours_per_week
        ORDER BY remaining_hours DESC
      `,
        [orgId],
      );

      // Overdue tasks
      const [overdueTasks] = await pool.execute(
        `
        SELECT t.id, t.title, t.priority, t.deadline, t.progress, t.status,
          p.name AS project_name, p.color AS project_color,
          DATEDIFF(CURDATE(), t.deadline) AS days_overdue,
          (SELECT COUNT(*) FROM task_dependency td WHERE td.depends_on_id = t.id) AS blocking_count
        FROM task t
        JOIN project p ON p.id = t.project_id
        WHERE p.org_id = ? AND p.created_by = ?
          AND t.status NOT IN ('completed') AND t.deadline < CURDATE()
        ORDER BY t.priority = 'critical' DESC, t.priority = 'high' DESC, days_overdue DESC
        LIMIT 10
      `,
        [orgId, pmId],
      );

      res.json({
        success: true,
        attention: {
          delayedProjects: delayedProjects.map((p) => ({
            ...p,
            type: 'project',
          })),
          overloadedResources: overloadedResources.map((r) => ({
            ...r,
            utilization:
              r.max_hours_per_week > 0
                ? Math.round((r.remaining_hours / r.max_hours_per_week) * 100)
                : 0,
            type: 'resource',
          })),
          overdueTasks: overdueTasks.map((t) => ({
            ...t,
            type: 'task',
          })),
        },
      });
    } catch (error) {
      console.error('Dashboard attention error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/dashboard/daily-progress
  router.get('/daily-progress', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const date = req.query.date || new Date().toISOString().split('T')[0];

      const [logs] = await pool.execute(
        `
        SELECT dwl.*, u.first_name, u.last_name, u.avatar, u.employee_code,
          t.title AS task_title, t.progress AS task_progress,
          p.name AS project_name, p.color AS project_color
        FROM daily_work_log dwl
        JOIN user u ON u.id = dwl.user_id
        JOIN task t ON t.id = dwl.task_id
        JOIN project p ON p.id = t.project_id
        WHERE u.org_id = ? AND dwl.log_date = ?
        ORDER BY dwl.created_at DESC
      `,
        [orgId, date],
      );

      res.json({ success: true, logs });
    } catch (error) {
      console.error('Daily progress error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
}
