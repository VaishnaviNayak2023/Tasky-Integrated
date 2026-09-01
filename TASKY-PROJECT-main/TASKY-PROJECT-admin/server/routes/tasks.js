import { Router } from 'express';
import {
  recommendResources,
  analyzeImpact,
  runGlobalAutoScheduler,
} from '../services/schedulingEngine.js';
const router = Router();

export default function taskRoutes(pool) {
  // GET /api/pm/tasks
  router.get('/', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;
      const { project, status, priority, assignee, search, sort } = req.query;

      let query = `
        SELECT t.*, p.name AS project_name, p.color AS project_color,
          pp.name AS phase_name,
          DATEDIFF(t.deadline, CURDATE()) AS days_until_deadline,
          CASE
            WHEN t.status = 'completed' THEN 'completed'
            WHEN CURDATE() > t.deadline THEN 'overdue'
            WHEN DATEDIFF(t.deadline, CURDATE()) <= 3 AND t.progress < 80 THEN 'critical-risk'
            WHEN DATEDIFF(t.deadline, CURDATE()) <= 7 AND t.progress < 60 THEN 'at-risk'
            ELSE 'on-track'
          END AS calculated_risk
        FROM task t
        JOIN project p ON p.id = t.project_id
        LEFT JOIN project_phase pp ON pp.id = t.phase_id
        WHERE p.org_id = ? AND p.created_by = ?
      `;
      const params = [orgId, pmId];

      if (project && project !== 'all') {
        query += ' AND t.project_id = ?';
        params.push(project);
      }
      if (status && status !== 'all') {
        query += ' AND t.status = ?';
        params.push(status);
      }
      if (priority && priority !== 'all') {
        query += ' AND t.priority = ?';
        params.push(priority);
      }
      if (search) {
        query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY FIELD(t.priority,"critical","high","medium","low"), t.deadline ASC';

      const [tasks] = await pool.execute(query, params);

      // Get assignees for each task
      for (const task of tasks) {
        const [assignees] = await pool.execute(
          `
          SELECT u.id, u.first_name, u.last_name, u.avatar, u.employee_code
          FROM task_assignment ta
          JOIN user u ON u.id = ta.user_id
          WHERE ta.task_id = ? AND ta.is_active = 1
        `,
          [task.id],
        );
        task.assignees = assignees;
      }

      // Filter by assignee after fetching (since it's a join)
      let filteredTasks = tasks;
      if (assignee && assignee !== 'all') {
        filteredTasks = tasks.filter((t) => t.assignees.some((a) => a.id === parseInt(assignee)));
      }

      // Stats
      const stats = {
        notStarted: tasks.filter((t) => t.status === 'not-started').length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        overdue: tasks.filter((t) => t.calculated_risk === 'overdue').length,
        blocked: tasks.filter((t) => t.status === 'blocked').length,
      };

      res.json({ success: true, tasks: filteredTasks, stats });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/tasks/:id
  router.get('/:id', async (req, res) => {
    try {
      const taskId = req.params.id;

      const [tasks] = await pool.execute(
        `
        SELECT t.*, p.name AS project_name, p.color AS project_color,
          pp.name AS phase_name
        FROM task t
        JOIN project p ON p.id = t.project_id
        LEFT JOIN project_phase pp ON pp.id = t.phase_id
        WHERE t.id = ?
      `,
        [taskId],
      );

      if (tasks.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const task = tasks[0];

      // Get assignees
      const [assignees] = await pool.execute(
        `
        SELECT u.id, u.first_name, u.last_name, u.avatar, u.employee_code, r.name AS role_name,
          ta.assigned_at
        FROM task_assignment ta
        JOIN user u ON u.id = ta.user_id
        JOIN role r ON r.id = u.role_id
        WHERE ta.task_id = ? AND ta.is_active = 1
      `,
        [taskId],
      );

      // Get progress history
      const [progressHistory] = await pool.execute(
        `
        SELECT pu.*, u.first_name, u.last_name, u.avatar
        FROM progress_update pu
        JOIN user u ON u.id = pu.user_id
        WHERE pu.task_id = ?
        ORDER BY pu.created_at DESC
      `,
        [taskId],
      );

      // Get comments
      const [comments] = await pool.execute(
        `
        SELECT tc.*, u.first_name, u.last_name, u.avatar, r.access_level
        FROM task_comment tc
        JOIN user u ON u.id = tc.user_id
        JOIN role r ON r.id = u.role_id
        WHERE tc.task_id = ?
        ORDER BY tc.is_sticky DESC, tc.created_at DESC
      `,
        [taskId],
      );

      // Get dependencies
      const [dependsOn] = await pool.execute(
        `
        SELECT td.*, t.title, t.status, t.progress
        FROM task_dependency td
        JOIN task t ON t.id = td.depends_on_id
        WHERE td.task_id = ?
      `,
        [taskId],
      );

      const [dependedBy] = await pool.execute(
        `
        SELECT td.*, t.title, t.status, t.progress
        FROM task_dependency td
        JOIN task t ON t.id = td.task_id
        WHERE td.depends_on_id = ?
      `,
        [taskId],
      );

      // Get daily logs
      const [dailyLogs] = await pool.execute(
        `
        SELECT dwl.*, u.first_name, u.last_name, u.avatar
        FROM daily_work_log dwl
        JOIN user u ON u.id = dwl.user_id
        WHERE dwl.task_id = ?
        ORDER BY dwl.log_date DESC
        LIMIT 20
      `,
        [taskId],
      );

      res.json({
        success: true,
        task: {
          ...task,
          assignees,
          progressHistory,
          comments,
          dependsOn,
          dependedBy,
          dailyLogs,
        },
      });
    } catch (error) {
      console.error('Get task detail error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/tasks
  router.post('/', async (req, res) => {
    try {
      const pmId = req.user.id;
      const orgId = req.user.org_id;
      const {
        project_id,
        phase_id,
        title,
        description,
        priority,
        deadline,
        start_date,
        expected_effort,
        assignee_ids,
        auto_assign,
        resources_needed,
      } = req.body;

      if (!project_id || !title || !deadline) {
        return res
          .status(400)
          .json({ success: false, error: 'Project, title, and deadline are required' });
      }

      // Calculate per-person effort
      const assigneeCount = assignee_ids ? assignee_ids.length : 0;

      const [result] = await pool.execute(
        `INSERT INTO task (project_id, phase_id, created_by, title, description, priority, deadline, start_date, expected_effort, resources_needed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project_id,
          phase_id || null,
          pmId,
          title,
          description || null,
          priority || 'medium',
          deadline,
          start_date || null,
          expected_effort || 0,
          resources_needed || 1,
        ],
      );

      const taskId = result.insertId;

      // Auto-assign if requested
      if (auto_assign) {
        const recommendations = await recommendResources(pool, orgId, taskId);
        if (recommendations.length > 0) {
          const bestResource = recommendations[0];
          await pool.execute(
            'INSERT INTO task_assignment (task_id, user_id, assigned_by) VALUES (?, ?, ?)',
            [taskId, bestResource.user_id, pmId],
          );
        }
      }
      // Manual assignment
      else if (assignee_ids && assignee_ids.length > 0) {
        for (const userId of assignee_ids) {
          await pool.execute(
            'INSERT INTO task_assignment (task_id, user_id, assigned_by) VALUES (?, ?, ?)',
            [taskId, userId, pmId],
          );
        }
      }

      // Update project progress
      await pool.execute('CALL sp_update_project_progress(?)', [project_id]);

      const [newTask] = await pool.execute('SELECT * FROM task WHERE id = ?', [taskId]);
      res.json({ success: true, task: newTask[0] });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // PUT /api/pm/tasks/:id
  router.put('/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const {
        title,
        description,
        priority,
        deadline,
        start_date,
        expected_effort,
        status,
        phase_id,
        assignee_ids,
        resources_needed,
      } = req.body;

      // Get current task for project_id
      const [current] = await pool.execute('SELECT * FROM task WHERE id = ?', [taskId]);
      if (current.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (priority !== undefined) updates.priority = priority;
      if (deadline !== undefined) updates.deadline = deadline;
      if (start_date !== undefined) updates.start_date = start_date;
      if (expected_effort !== undefined) updates.expected_effort = expected_effort;
      if (status !== undefined) {
        updates.status = status;
        if (status === 'completed') updates.completed_at = new Date();
      }
      if (phase_id !== undefined) updates.phase_id = phase_id;
      if (resources_needed !== undefined) updates.resources_needed = resources_needed;

      const setClauses = Object.keys(updates)
        .map((k) => `\`${k}\` = ?`)
        .join(', ');
      const values = Object.values(updates);

      if (setClauses.length > 0) {
        values.push(taskId);
        await pool.execute(`UPDATE task SET ${setClauses} WHERE id = ?`, values);
      }

      if (assignee_ids !== undefined) {
        // Deactivate current assignments
        await pool.execute(
          'UPDATE task_assignment SET is_active = 0, unassigned_at = NOW() WHERE task_id = ? AND is_active = 1',
          [taskId],
        );
        // Insert new ones
        for (const userId of assignee_ids) {
          await pool.execute(
            'INSERT INTO task_assignment (task_id, user_id, assigned_by) VALUES (?, ?, ?)',
            [taskId, userId, req.user.id],
          );
        }
      }

      // Update project progress
      // Update project progress
      await pool.execute('CALL sp_update_project_progress(?)', [current[0].project_id]);

      const [updated] = await pool.execute('SELECT * FROM task WHERE id = ?', [taskId]);

      // If status changed to completed or priority changed, trigger global auto-scheduler to reallocate freed capacity
      if (
        (status === 'completed' && current[0].status !== 'completed') ||
        (priority !== undefined && priority !== current[0].priority)
      ) {
        await runGlobalAutoScheduler(pool, current[0].org_id || req.user.org_id);
      }

      // Fetch fresh assignees to return to frontend
      const [assignees] = await pool.execute(
        `
        SELECT u.id, u.first_name, u.last_name, u.avatar, u.employee_code
        FROM task_assignment ta
        JOIN user u ON u.id = ta.user_id
        WHERE ta.task_id = ? AND ta.is_active = 1
      `,
        [taskId],
      );

      updated[0].assignees = assignees;

      res.json({ success: true, task: updated[0] });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // DELETE /api/pm/tasks/:id
  router.delete('/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const [task] = await pool.execute('SELECT project_id FROM task WHERE id = ?', [taskId]);
      await pool.execute('DELETE FROM task WHERE id = ?', [taskId]);

      if (task.length > 0) {
        await pool.execute('CALL sp_update_project_progress(?)', [task[0].project_id]);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/tasks/:id/assign
  router.post('/:id/assign', async (req, res) => {
    try {
      const taskId = req.params.id;
      const pmId = req.user.id;
      const { user_ids } = req.body;

      for (const userId of user_ids) {
        // Check if already assigned
        const [existing] = await pool.execute(
          'SELECT id FROM task_assignment WHERE task_id = ? AND user_id = ? AND is_active = 1',
          [taskId, userId],
        );
        if (existing.length === 0) {
          await pool.execute(
            'INSERT INTO task_assignment (task_id, user_id, assigned_by) VALUES (?, ?, ?)',
            [taskId, userId, pmId],
          );
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Assign task error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/tasks/:id/unassign
  router.post('/:id/unassign', async (req, res) => {
    try {
      const taskId = req.params.id;
      const { user_id } = req.body;

      await pool.execute(
        'UPDATE task_assignment SET is_active = 0, unassigned_at = NOW() WHERE task_id = ? AND user_id = ? AND is_active = 1',
        [taskId, user_id],
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Unassign task error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // PUT /api/pm/tasks/:id/progress
  router.put('/:id/progress', async (req, res) => {
    try {
      const taskId = req.params.id;
      const pmId = req.user.id;
      const { progress, notes } = req.body;

      const [current] = await pool.execute('SELECT progress, project_id FROM task WHERE id = ?', [
        taskId,
      ]);
      if (current.length === 0)
        return res.status(404).json({ success: false, error: 'Task not found' });

      const previousProgress = current[0].progress;

      await pool.execute('UPDATE task SET progress = ? WHERE id = ?', [progress, taskId]);

      // Record progress update
      await pool.execute(
        'INSERT INTO progress_update (task_id, user_id, previous_progress, new_progress, notes) VALUES (?, ?, ?, ?, ?)',
        [taskId, pmId, previousProgress, progress, notes || 'PM adjusted progress'],
      );

      await pool.execute('CALL sp_update_project_progress(?)', [current[0].project_id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Adjust progress error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/tasks/:id/comment
  router.post('/:id/comment', async (req, res) => {
    try {
      const taskId = req.params.id;
      const pmId = req.user.id;
      const { content, is_sticky } = req.body;

      await pool.execute(
        'INSERT INTO task_comment (task_id, user_id, content, is_sticky) VALUES (?, ?, ?, ?)',
        [taskId, pmId, content, is_sticky ? 1 : 0],
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/tasks/:id/recommendations
  router.get('/:id/recommendations', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const taskId = req.params.id;
      const recommendations = await recommendResources(pool, orgId, taskId);
      res.json({ success: true, recommendations });
    } catch (error) {
      console.error('Recommendations error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/tasks/:id/impact
  router.post('/:id/impact', async (req, res) => {
    try {
      const taskId = req.params.id;
      const { delay_days } = req.body;
      const impact = await analyzeImpact(pool, taskId, delay_days || 0);
      res.json({ success: true, impact });
    } catch (error) {
      console.error('Impact analysis error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
}
