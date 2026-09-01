import { Router } from 'express';
const router = Router();

export default function analyticsRoutes(pool) {
  // GET /api/pm/analytics/overview
  router.get('/overview', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;

      const [projectStats] = await pool.execute(
        `
        SELECT
          COUNT(*) AS total_projects,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_projects,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_projects,
          ROUND(AVG(progress), 1) AS avg_progress
        FROM project WHERE org_id = ? AND created_by = ?
      `,
        [orgId, pmId],
      );

      const [taskStats] = await pool.execute(
        `
        SELECT
          COUNT(*) AS total_tasks,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
          SUM(CASE WHEN t.status NOT IN ('completed') AND t.deadline < CURDATE() THEN 1 ELSE 0 END) AS overdue_tasks,
          ROUND(AVG(t.progress), 1) AS avg_task_progress
        FROM task t JOIN project p ON p.id = t.project_id
        WHERE p.org_id = ? AND p.created_by = ?
      `,
        [orgId, pmId],
      );

      const [teamStats] = await pool.execute(
        `
        SELECT COUNT(*) AS total_members FROM user u
        JOIN role r ON r.id = u.role_id
        WHERE u.org_id = ? AND u.is_active = 1 AND r.access_level = 'employee'
      `,
        [orgId],
      );

      res.json({
        success: true,
        overview: {
          ...projectStats[0],
          ...taskStats[0],
          ...teamStats[0],
          completion_rate:
            taskStats[0].total_tasks > 0
              ? Math.round((taskStats[0].completed_tasks / taskStats[0].total_tasks) * 100)
              : 0,
        },
      });
    } catch (error) {
      console.error('Analytics overview error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/analytics/project-progress
  router.get('/project-progress', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;

      const [projects] = await pool.execute(
        `
        SELECT p.id, p.name, p.color, p.progress, p.status, p.priority,
          UPPER(LEFT(p.name, 1)) AS letter,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id) AS total_tasks,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id AND t.status = 'completed') AS completed_tasks
        FROM project p WHERE p.org_id = ? AND p.created_by = ?
        ORDER BY p.progress DESC
      `,
        [orgId, pmId],
      );

      res.json({ success: true, projects });
    } catch (error) {
      console.error('Project progress error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/analytics/task-distribution
  router.get('/task-distribution', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;

      const [statusDist] = await pool.execute(
        `
        SELECT t.status, COUNT(*) AS count
        FROM task t JOIN project p ON p.id = t.project_id
        WHERE p.org_id = ? AND p.created_by = ?
        GROUP BY t.status
      `,
        [orgId, pmId],
      );

      const [priorityDist] = await pool.execute(
        `
        SELECT t.priority, COUNT(*) AS count
        FROM task t JOIN project p ON p.id = t.project_id
        WHERE p.org_id = ? AND p.created_by = ?
        GROUP BY t.priority
      `,
        [orgId, pmId],
      );

      const [total] = await pool.execute(
        `
        SELECT COUNT(*) AS count FROM task t
        JOIN project p ON p.id = t.project_id
        WHERE p.org_id = ? AND p.created_by = ?
      `,
        [orgId, pmId],
      );

      res.json({
        success: true,
        statusDistribution: statusDist,
        priorityDistribution: priorityDist,
        total: total[0].count,
      });
    } catch (error) {
      console.error('Task distribution error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/analytics/resource-workload
  router.get('/resource-workload', async (req, res) => {
    try {
      const orgId = req.user.org_id;

      // Per-project workload distribution
      const [byProject] = await pool.execute(
        `
        SELECT p.id, p.name, p.color,
          COALESCE(SUM(
            CASE WHEN ta2.cnt > 0
              THEN (t.expected_effort * (100 - t.progress) / 100) / ta2.cnt
              ELSE 0 END
          ), 0) AS total_hours
        FROM project p
        JOIN task t ON t.project_id = p.id AND t.status IN ('not-started','in-progress','blocked')
        LEFT JOIN (SELECT task_id, COUNT(*) AS cnt FROM task_assignment WHERE is_active=1 GROUP BY task_id) ta2 ON ta2.task_id = t.id
        WHERE p.org_id = ?
        GROUP BY p.id, p.name, p.color
        ORDER BY total_hours DESC
      `,
        [orgId],
      );

      res.json({ success: true, byProject });
    } catch (error) {
      console.error('Resource workload analytics error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/analytics/deadline-risks
  router.get('/deadline-risks', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;

      const [risks] = await pool.execute(
        `
        SELECT t.id, t.title, t.priority, t.deadline, t.progress, t.status,
          p.name AS project_name, p.color AS project_color,
          DATEDIFF(t.deadline, CURDATE()) AS days_until,
          CASE
            WHEN CURDATE() > t.deadline THEN 'overdue'
            WHEN DATEDIFF(t.deadline, CURDATE()) <= 3 AND t.progress < 80 THEN 'critical'
            WHEN DATEDIFF(t.deadline, CURDATE()) <= 7 AND t.progress < 60 THEN 'high'
            WHEN DATEDIFF(t.deadline, CURDATE()) <= 14 AND t.progress < 40 THEN 'medium'
            ELSE 'low'
          END AS risk_level
        FROM task t
        JOIN project p ON p.id = t.project_id
        WHERE p.org_id = ? AND p.created_by = ?
          AND t.status NOT IN ('completed')
          AND t.deadline <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY t.deadline ASC
      `,
        [orgId, pmId],
      );

      res.json({ success: true, risks });
    } catch (error) {
      console.error('Deadline risks error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/analytics/project-performance
  router.get('/project-performance', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;

      const [projects] = await pool.execute(
        `
        SELECT p.id, p.name, p.status, p.progress, p.priority,
          p.start_date, p.end_date,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id) AS total_tasks,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id AND t.status = 'completed') AS completed_tasks,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id AND t.status NOT IN ('completed') AND t.deadline < CURDATE()) AS overdue_tasks,
          (SELECT COUNT(DISTINCT ta.user_id) FROM task t2 JOIN task_assignment ta ON ta.task_id = t2.id AND ta.is_active = 1 WHERE t2.project_id = p.id) AS team_size,
          COALESCE((SELECT SUM(t3.actual_effort) FROM task t3 WHERE t3.project_id = p.id), 0) AS total_hours_logged,
          COALESCE((SELECT SUM(t3.expected_effort) FROM task t3 WHERE t3.project_id = p.id), 0) AS total_estimated_hours,
          DATEDIFF(p.end_date, CURDATE()) AS days_remaining
        FROM project p
        WHERE p.org_id = ? AND p.created_by = ?
        ORDER BY p.created_at DESC
      `,
        [orgId, pmId],
      );

      res.json({ success: true, projects });
    } catch (error) {
      console.error('Project performance error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/analytics/daily-log-compliance
  router.get('/daily-log-compliance', async (req, res) => {
    try {
      const orgId = req.user.org_id;

      const [compliance] = await pool.execute(
        `
        SELECT u.id, u.first_name, u.last_name, u.avatar, u.employee_code,
          SUM(CASE WHEN dlc.status = 'logged' THEN 1 ELSE 0 END) AS logged_count,
          SUM(CASE WHEN dlc.status = 'missed' THEN 1 ELSE 0 END) AS missed_count,
          SUM(CASE WHEN dlc.status = 'late' THEN 1 ELSE 0 END) AS late_count,
          COUNT(CASE WHEN dlc.status IN ('logged','missed','late') THEN 1 END) AS total_working_days
        FROM user u
        JOIN role r ON r.id = u.role_id
        LEFT JOIN daily_log_compliance dlc ON dlc.user_id = u.id
          AND dlc.log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE u.org_id = ? AND u.is_active = 1 AND r.access_level = 'employee'
        GROUP BY u.id, u.first_name, u.last_name, u.avatar, u.employee_code
        ORDER BY missed_count DESC
      `,
        [orgId],
      );

      res.json({ success: true, compliance });
    } catch (error) {
      console.error('Log compliance error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
}
