import { Router } from 'express';
import { createNotification } from '../utils/notifications.js';
import { safeCallProjectProgress } from '../ensureSchema.js';

const router = Router();

function toInt(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function percent(part, total) {
  if (!total) return 0;
  const value = Math.round((Number(part) / Number(total)) * 100);
  return Number.isFinite(value) ? value : 0;
}

export default function employeeRoutes(pool) {
  router.get('/tasks', async (req, res) => {
    try {
      const userId = toInt(req.query.user_id) || req.user.id;
      const [tasks] = await pool.execute(
        `
        SELECT t.*, p.name AS project_name, p.color AS project_color,
          DATEDIFF(t.deadline, CURDATE()) AS days_until_deadline
        FROM task t
        JOIN project p ON p.id = t.project_id
        JOIN task_assignment ta ON ta.task_id = t.id AND ta.is_active = 1
        WHERE ta.user_id = ? AND COALESCE(t.is_visible, 1) = 1
        ORDER BY FIELD(t.priority,'critical','high','medium','low'), t.deadline ASC
      `,
        [userId],
      );
      res.json({ success: true, tasks, data: tasks });
    } catch (error) {
      console.error('Employee list tasks error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/tasks', async (req, res) => {
    try {
      const userId = req.user.id;
      const orgId = req.user.org_id;
      const {
        project_id,
        project,
        title,
        name,
        description,
        priority,
        deadline,
        expected_effort,
        expectedEffort,
        subtasks = [],
      } = req.body;

      const taskTitle = title || name;
      if (!taskTitle) {
        return res.status(400).json({ success: false, error: 'Title is required' });
      }

      let projectId = toInt(project_id);
      if (!projectId && project) {
        const [found] = await pool.execute(
          'SELECT id FROM project WHERE org_id = ? AND name = ? LIMIT 1',
          [orgId, typeof project === 'string' ? project : project.label || project.value],
        );
        if (found.length) projectId = found[0].id;
      }
      if (!projectId) {
        const [fallback] = await pool.execute(
          'SELECT id FROM project WHERE org_id = ? ORDER BY created_at DESC LIMIT 1',
          [orgId],
        );
        if (fallback.length) projectId = fallback[0].id;
      }
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'A project is required to create a task' });
      }

      const due = deadline || new Date().toISOString().slice(0, 10);
      const effort = expected_effort || expectedEffort || 0;
      const normalizedPriority = String(priority || 'medium').toLowerCase();

      const [result] = await pool.execute(
        `INSERT INTO task (project_id, created_by, title, description, priority, deadline, expected_effort, is_self_assigned, is_visible, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'not-started')`,
        [projectId, userId, taskTitle, description || null, normalizedPriority, due, effort],
      );
      const taskId = result.insertId;

      await pool.execute(
        'INSERT INTO task_assignment (task_id, user_id, assigned_by) VALUES (?, ?, ?)',
        [taskId, userId, userId],
      );

      for (const sub of subtasks) {
        const subTitle = typeof sub === 'string' ? sub : sub.title;
        if (!subTitle) continue;
        await pool.execute('INSERT INTO task_subtask (task_id, title) VALUES (?, ?)', [taskId, subTitle]);
      }

      await safeCallProjectProgress(pool, projectId);
      const [rows] = await pool.execute('SELECT * FROM task WHERE id = ?', [taskId]);
      res.json({ success: true, task: rows[0] });
    } catch (error) {
      console.error('Employee create task error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.put('/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const { progress, status, title, description, priority, deadline } = req.body;
      const updates = {};
      if (progress !== undefined) updates.progress = progress;
      if (status !== undefined) updates.status = String(status).toLowerCase().replace(/\s+/g, '-');
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (priority !== undefined) updates.priority = String(priority).toLowerCase();
      if (deadline !== undefined) updates.deadline = deadline;
      if (updates.status === 'completed') updates.completed_at = new Date();

      const keys = Object.keys(updates);
      if (keys.length) {
        const set = keys.map((k) => `\`${k}\` = ?`).join(', ');
        await pool.execute(`UPDATE task SET ${set} WHERE id = ?`, [...Object.values(updates), taskId]);
      }

      const [rows] = await pool.execute('SELECT * FROM task WHERE id = ?', [taskId]);
      res.json({ success: true, task: rows[0] });
    } catch (error) {
      console.error('Employee update task error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/tasks/:id/subtasks', async (req, res) => {
    try {
      const [subtasks] = await pool.execute('SELECT * FROM task_subtask WHERE task_id = ?', [req.params.id]);
      res.json({ success: true, subtasks });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/tasks/:id/subtasks', async (req, res) => {
    try {
      const { title, status = 'not-started' } = req.body;
      const [result] = await pool.execute(
        'INSERT INTO task_subtask (task_id, title, status) VALUES (?, ?, ?)',
        [req.params.id, title, status],
      );
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.put('/subtasks/:id', async (req, res) => {
    try {
      const { title, completed, status } = req.body;
      await pool.execute(
        'UPDATE task_subtask SET title = COALESCE(?, title), completed = COALESCE(?, completed), status = COALESCE(?, status) WHERE id = ?',
        [title ?? null, completed === undefined ? null : completed ? 1 : 0, status ?? null, req.params.id],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/subtasks/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM task_subtask WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/tasks/:id/submit-review', async (req, res) => {
    try {
      const { reviewer_id, completion_comment } = req.body;
      await pool.execute(
        'INSERT INTO task_review (task_id, reviewer_id, task_owner_id, completion_comment, status) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, reviewer_id, req.user.id, completion_comment || null, 'pending'],
      );
      await pool.execute("UPDATE task SET status = 'in-progress', reviewer_id = ?, completion_comment = ? WHERE id = ?", [
        reviewer_id,
        completion_comment || null,
        req.params.id,
      ]);
      await createNotification(pool, {
        userId: reviewer_id,
        type: 'comment_added',
        title: 'Review requested',
        message: 'A colleague asked you to review a completed task.',
        referenceId: req.params.id,
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/reviews', async (req, res) => {
    try {
      const { task_id, reviewer_id, task_owner_id, completion_comment } = req.body;
      await pool.execute(
        'INSERT INTO task_review (task_id, reviewer_id, task_owner_id, completion_comment, status) VALUES (?, ?, ?, ?, ?)',
        [task_id, reviewer_id, task_owner_id || req.user.id, completion_comment || null, 'pending'],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/reviews/pending', async (req, res) => {
    try {
      const userId = toInt(req.query.user_id) || req.user.id;
      const [rows] = await pool.execute(
        `
        SELECT r.*, t.title, t.priority, t.deadline, p.name AS project_name
        FROM task_review r
        JOIN task t ON t.id = r.task_id
        JOIN project p ON p.id = t.project_id
        WHERE r.reviewer_id = ? AND r.status = 'pending'
        ORDER BY r.created_at DESC
      `,
        [userId],
      );
      res.json({ success: true, reviews: rows, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/reviews/history', async (req, res) => {
    try {
      const userId = toInt(req.query.user_id) || req.user.id;
      const [rows] = await pool.execute(
        `
        SELECT r.*, t.title, t.priority, p.name AS project_name
        FROM task_review r
        JOIN task t ON t.id = r.task_id
        JOIN project p ON p.id = t.project_id
        WHERE (r.reviewer_id = ? OR r.task_owner_id = ?) AND r.status <> 'pending'
        ORDER BY r.updated_at DESC
      `,
        [userId, userId],
      );
      res.json({ success: true, reviews: rows, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/reviews/:id/complete', async (req, res) => {
    try {
      await pool.execute("UPDATE task_review SET status = 'review-done', review_comment = ? WHERE id = ?", [
        req.body.review_comment || req.body.comment || null,
        req.params.id,
      ]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/tasks/:id/approve-review', async (req, res) => {
    try {
      await pool.execute("UPDATE task_review SET status = 'review-done', review_comment = ? WHERE task_id = ? AND reviewer_id = ?", [
        req.body.review_comment || null,
        req.params.id,
        req.user.id,
      ]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/tasks/:id/request-changes', async (req, res) => {
    try {
      await pool.execute("UPDATE task_review SET status = 'changes-requested', review_comment = ? WHERE task_id = ? AND reviewer_id = ?", [
        req.body.review_comment || req.body.comment || null,
        req.params.id,
        req.user.id,
      ]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/work-logs/:userId', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM daily_work_log WHERE user_id = ? ORDER BY log_date DESC',
        [req.params.userId],
      );
      res.json({ success: true, logs: rows, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/work-logs/:userId/calendar', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT log_date, SUM(hours_spent) AS hours FROM daily_work_log WHERE user_id = ? GROUP BY log_date',
        [req.params.userId],
      );
      res.json({ success: true, days: rows, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/work-log', async (req, res) => {
    try {
      const { task_id, hours_spent, work_completed, log_date, notes } = req.body;
      await pool.execute(
        `INSERT INTO daily_work_log (task_id, user_id, hours_spent, work_completed, log_date, comments)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE hours_spent = VALUES(hours_spent), work_completed = VALUES(work_completed), comments = VALUES(comments)`,
        [task_id, req.user.id, hours_spent || 0, work_completed || notes || '', log_date || new Date(), notes || null],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/work-logs', async (req, res) => {
    try {
      const { task_id, hours_spent, work_completed, log_date, notes } = req.body;
      await pool.execute(
        `INSERT INTO daily_work_log (task_id, user_id, hours_spent, work_completed, log_date, comments)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE hours_spent = VALUES(hours_spent), work_completed = VALUES(work_completed), comments = VALUES(comments)`,
        [task_id, req.user.id, hours_spent || 0, work_completed || notes || '', log_date || new Date(), notes || null],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/daily-tracker/:userId', async (req, res) => {
    try {
      const [entries] = await pool.execute(
        'SELECT * FROM employee_daily_tracker WHERE employee_id = ? ORDER BY date DESC',
        [req.params.userId],
      );
      res.json({ success: true, entries });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/daily-tracker', async (req, res) => {
    try {
      const { employee_id, title, description, date, progress, status, project_name } = req.body;
      const [result] = await pool.execute(
        `INSERT INTO employee_daily_tracker (employee_id, title, description, date, progress, status, project_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id || req.user.id, title, description || null, date, progress || 0, status || 'Not Started', project_name || null],
      );
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.put('/daily-tracker/:id', async (req, res) => {
    try {
      const { title, description, date, progress, status, project_name } = req.body;
      await pool.execute(
        `UPDATE employee_daily_tracker
         SET title = ?, description = ?, date = ?, progress = ?, status = ?, project_name = ?
         WHERE id = ?`,
        [title, description || null, date, progress || 0, status, project_name || null, req.params.id],
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/daily-tracker/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM employee_daily_tracker WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/performance-summary/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const [rows] = await pool.execute(
        `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed
        FROM task t
        JOIN task_assignment ta ON ta.task_id = t.id AND ta.is_active = 1
        WHERE ta.user_id = ?
      `,
        [userId],
      );
      const total = Number(rows[0].total) || 0;
      const completed = Number(rows[0].completed) || 0;
      res.json({
        success: true,
        summary: {
          total,
          completed,
          completion_rate: percent(completed, total),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export function employeeTaskAliasRoutes(pool) {
  const alias = Router();
  alias.get('/employee/:userId', async (req, res) => {
    try {
      const [tasks] = await pool.execute(
        `
        SELECT t.*, p.name AS project_name, p.color AS project_color
        FROM task t
        JOIN project p ON p.id = t.project_id
        JOIN task_assignment ta ON ta.task_id = t.id AND ta.is_active = 1
        WHERE ta.user_id = ? AND COALESCE(t.is_visible, 1) = 1
        ORDER BY t.deadline ASC
      `,
        [req.params.userId],
      );
      res.json({ success: true, tasks });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  return alias;
}
