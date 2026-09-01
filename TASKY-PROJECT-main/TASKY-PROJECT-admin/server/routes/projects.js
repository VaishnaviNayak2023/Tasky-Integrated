import { Router } from 'express';
const router = Router();

export default function projectRoutes(pool) {
  // GET /api/pm/projects
  router.get('/', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;
      const { status, priority, search, sort } = req.query;

      let query = `
        SELECT p.*,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id) AS total_tasks,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id AND t.status = 'completed') AS completed_tasks,
          (SELECT COUNT(DISTINCT ta.user_id) FROM task t JOIN task_assignment ta ON ta.task_id = t.id AND ta.is_active = 1 WHERE t.project_id = p.id) AS team_count,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id AND t.status NOT IN ('completed') AND t.deadline < CURDATE()) AS overdue_task_count,
          DATEDIFF(p.end_date, CURDATE()) AS days_left
        FROM project p
        WHERE p.org_id = ? AND p.created_by = ?
      `;
      const params = [orgId, pmId];

      if (status && status !== 'all') {
        query += ' AND p.status = ?';
        params.push(status);
      }
      if (priority && priority !== 'all') {
        query += ' AND p.priority = ?';
        params.push(priority);
      }
      if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Sort
      if (sort === 'oldest') query += ' ORDER BY p.created_at ASC';
      else if (sort === 'priority')
        query += ' ORDER BY FIELD(p.priority, "critical","high","medium","low"), p.created_at DESC';
      else if (sort === 'progress') query += ' ORDER BY p.progress DESC';
      else if (sort === 'deadline') query += ' ORDER BY p.end_date ASC';
      else query += ' ORDER BY p.created_at DESC';

      const [projects] = await pool.execute(query, params);

      // Get team avatars for each project
      for (const proj of projects) {
        const [team] = await pool.execute(
          `
          SELECT DISTINCT u.id, u.first_name, u.last_name, u.avatar
          FROM task t
          JOIN task_assignment ta ON ta.task_id = t.id AND ta.is_active = 1
          JOIN user u ON u.id = ta.user_id
          WHERE t.project_id = ?
          LIMIT 5
        `,
          [proj.id],
        );
        proj.team = team;
      }

      // Compute dynamic project status
      projects.forEach((proj) => {
        if (proj.status === 'completed') {
          proj.computed_status = 'completed';
        } else if (proj.total_tasks > 0 && proj.completed_tasks === proj.total_tasks) {
          proj.computed_status = 'pending-completion';
        } else if (proj.overdue_task_count > 0) {
          proj.computed_status = 'delayed';
        } else if (proj.total_tasks === 0 || proj.progress == 0) {
          proj.computed_status = 'not-started';
        } else {
          proj.computed_status = 'on-going';
        }
      });

      res.json({ success: true, projects });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/projects/:id
  router.get('/:id', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const projectId = req.params.id;

      const [projects] = await pool.execute(
        `
        SELECT p.*,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id) AS total_tasks,
          (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id AND t.status = 'completed') AS completed_tasks,
          DATEDIFF(p.end_date, CURDATE()) AS days_left
        FROM project p WHERE p.id = ? AND p.org_id = ?
      `,
        [projectId, orgId],
      );

      if (projects.length === 0) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const project = projects[0];

      // Get tasks
      const [tasks] = await pool.execute(
        `
        SELECT t.*, pp.name AS phase_name
        FROM task t
        LEFT JOIN project_phase pp ON pp.id = t.phase_id
        WHERE t.project_id = ?
        ORDER BY FIELD(t.priority, 'critical','high','medium','low'), t.deadline ASC
      `,
        [projectId],
      );

      // Get assignments for each task
      for (const task of tasks) {
        const [assignees] = await pool.execute(
          `
          SELECT u.id, u.first_name, u.last_name, u.avatar, u.employee_code, r.name AS role_name
          FROM task_assignment ta
          JOIN user u ON u.id = ta.user_id
          JOIN role r ON r.id = u.role_id
          WHERE ta.task_id = ? AND ta.is_active = 1
        `,
          [task.id],
        );
        task.assignees = assignees;
      }

      // Get phases
      const [phases] = await pool.execute(
        'SELECT * FROM project_phase WHERE project_id = ? ORDER BY sort_order',
        [projectId],
      );

      // Get team
      const [team] = await pool.execute(
        `
        SELECT DISTINCT u.id, u.first_name, u.last_name, u.avatar, u.employee_code, r.name AS role_name
        FROM task t
        JOIN task_assignment ta ON ta.task_id = t.id AND ta.is_active = 1
        JOIN user u ON u.id = ta.user_id
        JOIN role r ON r.id = u.role_id
        WHERE t.project_id = ?
      `,
        [projectId],
      );

      // Get dependencies
      const [dependencies] = await pool.execute(
        `
        SELECT td.*, t1.title AS task_title, t2.title AS depends_on_title
        FROM task_dependency td
        JOIN task t1 ON t1.id = td.task_id
        JOIN task t2 ON t2.id = td.depends_on_id
        WHERE t1.project_id = ? OR t2.project_id = ?
      `,
        [projectId, projectId],
      );

      // Compute dynamic project status
      if (project.status === 'completed') {
        project.computed_status = 'completed';
      } else if (project.total_tasks > 0 && project.completed_tasks === project.total_tasks) {
        project.computed_status = 'pending-completion';
      } else if (tasks.some((t) => t.status !== 'completed' && new Date(t.deadline) < new Date())) {
        project.computed_status = 'delayed';
      } else if (project.total_tasks === 0 || project.progress == 0) {
        project.computed_status = 'not-started';
      } else {
        project.computed_status = 'on-going';
      }

      res.json({
        success: true,
        project: { ...project, tasks, phases, team, dependencies },
      });
    } catch (error) {
      console.error('Get project detail error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/projects
  router.post('/', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;
      const { name, description, status, priority, color, start_date, end_date } = req.body;

      if (!name || !start_date || !end_date) {
        return res
          .status(400)
          .json({ success: false, error: 'Name, start date, and end date are required' });
      }

      const [result] = await pool.execute(
        `INSERT INTO project (org_id, created_by, name, description, status, priority, color, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orgId,
          pmId,
          name,
          description || null,
          status || 'planning',
          priority || 'medium',
          color || '#1976D2',
          start_date,
          end_date,
        ],
      );

      const [newProject] = await pool.execute('SELECT * FROM project WHERE id = ?', [
        result.insertId,
      ]);

      res.json({ success: true, project: newProject[0] });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // PUT /api/pm/projects/:id
  router.put('/:id', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const projectId = req.params.id;
      const { name, description, status, priority, color, start_date, end_date } = req.body;

      await pool.execute(
        `UPDATE project SET name=?, description=?, status=?, priority=?, color=?, start_date=?, end_date=?
         WHERE id=? AND org_id=?`,
        [name, description, status, priority, color, start_date, end_date, projectId, orgId],
      );

      // If marking as completed, update progress to 100
      if (status === 'completed') {
        await pool.execute('UPDATE project SET progress = 100 WHERE id = ?', [projectId]);
      }

      const [updated] = await pool.execute('SELECT * FROM project WHERE id = ?', [projectId]);
      res.json({ success: true, project: updated[0] });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // DELETE /api/pm/projects/:id
  router.delete('/:id', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const projectId = req.params.id;

      await pool.execute('DELETE FROM project WHERE id = ? AND org_id = ?', [projectId, orgId]);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
}
