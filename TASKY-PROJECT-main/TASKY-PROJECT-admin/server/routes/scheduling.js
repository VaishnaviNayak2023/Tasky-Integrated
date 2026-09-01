import { Router } from 'express';
import {
  recommendResources,
  analyzeImpact,
  getOrgResourceWorkloads,
} from '../services/schedulingEngine.js';

const router = Router();

export default function schedulingRoutes(pool) {
  // POST /api/pm/schedule/auto-assign
  router.post('/auto-assign', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;
      const { task_id } = req.body;

      if (!task_id) {
        return res.status(400).json({ success: false, error: 'Task ID is required' });
      }

      // Check task exists and isn't completed
      const [tasks] = await pool.execute('SELECT * FROM task WHERE id = ?', [task_id]);
      if (tasks.length === 0)
        return res.status(404).json({ success: false, error: 'Task not found' });
      if (tasks[0].status === 'completed')
        return res.status(400).json({ success: false, error: 'Cannot assign completed task' });

      // Run recommendation engine
      const recommendations = await recommendResources(pool, orgId, task_id);

      if (recommendations.length === 0) {
        return res.json({ success: false, message: 'No suitable resources found' });
      }

      // Take the top recommendation
      const bestResource = recommendations[0];

      // Assign them
      await pool.execute(
        `
        INSERT INTO task_assignment (task_id, user_id, assigned_by)
        VALUES (?, ?, ?)
      `,
        [task_id, bestResource.user_id, pmId],
      );

      // Return success with details
      res.json({
        success: true,
        message: `Successfully auto-assigned to ${bestResource.name}`,
        assignedResource: bestResource,
      });
    } catch (error) {
      console.error('Auto-assign error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/schedule/rebalance
  router.post('/rebalance', async (req, res) => {
    try {
      // In a real advanced system this would re-distribute tasks based on capacity
      // For now, it returns suggestions on who should be unassigned and who should take over
      const orgId = req.user.org_id;
      const { project_id } = req.body;

      if (!project_id)
        return res.status(400).json({ success: false, error: 'Project ID is required' });

      // Identify overloaded resources working on this project
      const allResources = await getOrgResourceWorkloads(pool, orgId);
      const overloaded = allResources.filter((r) => r.utilization > 100);

      const suggestions = [];

      for (const r of overloaded) {
        // Find their tasks in this project
        const [tasks] = await pool.execute(
          `
          SELECT t.* FROM task t
          JOIN task_assignment ta ON ta.task_id = t.id AND ta.is_active = 1
          WHERE t.project_id = ? AND ta.user_id = ? AND t.status IN ('not-started','in-progress')
        `,
          [project_id, r.user_id],
        );

        if (tasks.length > 0) {
          // For their largest task, find an alternative resource
          const largestTask = tasks.sort((a, b) => b.expected_effort - a.expected_effort)[0];
          const alternates = await recommendResources(pool, orgId, largestTask.id);

          // Filter out other overloaded resources
          const viableAlternates = alternates.filter((alt) => alt.utilization < 90);

          if (viableAlternates.length > 0) {
            suggestions.push({
              action: 'reassign',
              task: { id: largestTask.id, title: largestTask.title },
              from: {
                id: r.user_id,
                name: `${r.first_name} ${r.last_name}`,
                utilization: r.utilization,
              },
              to: {
                id: viableAlternates[0].user_id,
                name: viableAlternates[0].name,
                new_utilization:
                  viableAlternates[0].utilization +
                  (largestTask.expected_effort / viableAlternates[0].max_hours_per_week) * 100,
              },
              reason: `To reduce ${r.first_name}'s overload (${r.utilization}%).`,
            });
          }
        }
      }

      res.json({ success: true, suggestions });
    } catch (error) {
      console.error('Rebalance error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/schedule/impact-analysis
  router.post('/impact-analysis', async (req, res) => {
    try {
      const { task_id, delay_days } = req.body;

      if (!task_id) return res.status(400).json({ success: false, error: 'Task ID is required' });

      const impact = await analyzeImpact(pool, task_id, parseInt(delay_days) || 0);

      res.json({ success: true, impact });
    } catch (error) {
      console.error('Impact analysis error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/schedule/suggestions
  router.get('/suggestions', async (req, res) => {
    try {
      const pmId = req.user.id;

      // Fetch AI/Rule-based suggestions stored in the DB (or generated on the fly)
      // The seed data has a table for this, let's just fetch from there
      const [suggestions] = await pool.execute(
        `
        SELECT * FROM ai_suggestion
        WHERE project_id IN (SELECT id FROM project WHERE created_by = ?)
        ORDER BY created_at DESC
        LIMIT 10
      `,
        [pmId],
      );

      res.json({ success: true, suggestions });
    } catch (error) {
      console.error('Get suggestions error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
}
