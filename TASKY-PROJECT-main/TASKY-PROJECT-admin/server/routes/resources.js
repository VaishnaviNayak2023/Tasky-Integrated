import { Router } from 'express';
import {
  getOrgResourceWorkloads,
  detectOverloadedResources,
  rebalanceWorkloads,
} from '../services/schedulingEngine.js';
const router = Router();

export default function resourceRoutes(pool) {
  // GET /api/pm/resources
  router.get('/', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const { search } = req.query;

      const resources = await getOrgResourceWorkloads(pool, orgId);

      // Get project details for each resource
      for (const r of resources) {
        const [projects] = await pool.execute(
          `
          SELECT DISTINCT p.id, p.name, p.color, UPPER(LEFT(p.name, 1)) AS letter
          FROM task t
          JOIN task_assignment ta ON ta.task_id = t.id AND ta.user_id = ? AND ta.is_active = 1
          JOIN project p ON p.id = t.project_id
          WHERE t.status IN ('not-started','in-progress','blocked')
        `,
          [r.user_id],
        );
        r.projects = projects;
      }

      let filtered = resources;
      if (search) {
        const q = search.toLowerCase();
        filtered = resources.filter(
          (r) =>
            `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
            r.employee_code.toLowerCase().includes(q) ||
            r.role_name.toLowerCase().includes(q),
        );
      }

      res.json({ success: true, resources: filtered });
    } catch (error) {
      console.error('Get resources error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/resources/:id
  router.get('/:id', async (req, res) => {
    try {
      const userId = req.params.id;

      const [users] = await pool.execute(
        `
        SELECT u.*, r.name AS role_name, r.access_level
        FROM user u JOIN role r ON r.id = u.role_id
        WHERE u.id = ?
      `,
        [userId],
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      const user = users[0];

      // Active tasks
      const [tasks] = await pool.execute(
        `
        SELECT t.*, p.name AS project_name, p.color AS project_color
        FROM task_assignment ta
        JOIN task t ON t.id = ta.task_id
        JOIN project p ON p.id = t.project_id
        WHERE ta.user_id = ? AND ta.is_active = 1 AND t.status IN ('not-started','in-progress','blocked')
        ORDER BY FIELD(t.priority,'critical','high','medium','low'), t.deadline ASC
      `,
        [userId],
      );

      // Workload breakdown by project
      const [workloadByProject] = await pool.execute(
        `
        SELECT p.id, p.name, p.color,
          COALESCE(SUM(
            CASE WHEN ta2.cnt > 0
              THEN (t.expected_effort * (100 - t.progress) / 100) / ta2.cnt
              ELSE 0 END
          ), 0) AS hours
        FROM task t
        JOIN task_assignment ta ON ta.task_id = t.id AND ta.user_id = ? AND ta.is_active = 1
        JOIN project p ON p.id = t.project_id
        LEFT JOIN (SELECT task_id, COUNT(*) AS cnt FROM task_assignment WHERE is_active=1 GROUP BY task_id) ta2 ON ta2.task_id = t.id
        WHERE t.status IN ('not-started','in-progress','blocked')
        GROUP BY p.id, p.name, p.color
      `,
        [userId],
      );

      // Daily log compliance
      const [compliance] = await pool.execute(
        `
        SELECT log_date, status, submitted_at
        FROM daily_log_compliance
        WHERE user_id = ?
        ORDER BY log_date DESC
        LIMIT 30
      `,
        [userId],
      );

      // Leave requests
      const [leaves] = await pool.execute(
        `
        SELECT * FROM leave_request WHERE user_id = ? ORDER BY start_date DESC
      `,
        [userId],
      );

      res.json({
        success: true,
        resource: {
          ...user,
          tasks,
          workloadByProject,
          compliance,
          leaves,
          password_hash: undefined, // don't expose
        },
      });
    } catch (error) {
      console.error('Get resource detail error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/resources/conflicts
  router.get('/conflicts', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const overloaded = await detectOverloadedResources(pool, orgId);

      // Get conflict details for each overloaded resource
      for (const r of overloaded) {
        const [projects] = await pool.execute(
          `
          SELECT DISTINCT p.name, p.color
          FROM task t
          JOIN task_assignment ta ON ta.task_id = t.id AND ta.user_id = ? AND ta.is_active = 1
          JOIN project p ON p.id = t.project_id
          WHERE t.status IN ('not-started','in-progress','blocked')
        `,
          [r.user_id],
        );
        r.conflicting_projects = projects;
      }

      res.json({ success: true, conflicts: overloaded });
    } catch (error) {
      console.error('Get conflicts error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/resources/availability
  router.get('/availability', async (req, res) => {
    try {
      const orgId = req.user.org_id;

      const [available] = await pool.execute(
        `
        SELECT u.id, u.first_name, u.last_name, u.avatar, r.name AS role_name,
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
        GROUP BY u.id, u.first_name, u.last_name, u.avatar, r.name, u.max_hours_per_week
        HAVING remaining <= u.max_hours_per_week * 0.8
        ORDER BY remaining ASC
      `,
        [orgId],
      );

      const [unavailable] = await pool.execute(
        `
        SELECT u.id, u.first_name, u.last_name, u.avatar, r.name AS role_name,
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
        GROUP BY u.id, u.first_name, u.last_name, u.avatar, r.name, u.max_hours_per_week
        HAVING remaining > u.max_hours_per_week * 0.8
        ORDER BY remaining DESC
      `,
        [orgId],
      );

      res.json({
        success: true,
        available,
        unavailable,
        counts: { available: available.length, unavailable: unavailable.length },
      });
    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/resources/rebalance
  router.post('/rebalance', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const result = await rebalanceWorkloads(pool, orgId);
      res.json(result);
    } catch (error) {
      console.error('Rebalance error:', error);
      res.status(500).json({ success: false, error: 'Server error during rebalance' });
    }
  });

  return router;
}
