import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import performanceController from './modules/performance/controller/performanceController.js';
import performanceRepository from './modules/performance/repository/performanceRepository.js';
import performanceAnalytics from './modules/performance/analytics/performanceAnalytics.js';
import performancePermissions from './modules/performance/permissions/performancePermissions.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'change-this-tasky-secret';
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tasky',
  connectionLimit: 10,
});

app.use(cors());
app.use(express.json());

// Initialize performance module with database pool
performanceRepository.initPool(pool);
performanceAnalytics.initPool(pool);

function signUser(user) {
  return jwt.sign({ sub: user.id, orgId: user.org_id, accessLevel: user.access_level }, jwtSecret, { expiresIn: '8h' });
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try { req.auth = jwt.verify(token, jwtSecret); next(); } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}

function managerOnly(req, res, next) {
  if (!['admin', 'manager'].includes(req.auth.accessLevel)) return res.status(403).json({ message: 'Manager access required' });
  next();
}

function projectHealth({ progress, startDate, endDate, lastLogAt, today = new Date() }) {
  if (progress >= 100) return 'Completed';
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T23:59:59Z`).getTime();
  const elapsed = Math.min(1, Math.max(0, (today.getTime() - start) / Math.max(1, end - start)));
  const paceGap = elapsed * 100 - progress;
  const daysSinceLog = lastLogAt ? (today.getTime() - new Date(lastLogAt).getTime()) / 86400000 : Infinity;
  if (today.getTime() > end || paceGap >= 35 || daysSinceLog > 4) return 'Severely Delayed';
  if (paceGap >= 20 || daysSinceLog > 2) return 'At Risk';
  if (paceGap >= 8) return 'Slightly Delayed';
  return 'On Track';
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT u.id, u.org_id, u.email, u.password_hash, r.access_level FROM user u JOIN role r ON r.id = u.role_id WHERE u.email = ? AND u.is_active = 1`, [req.body.email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: signUser(user), user: { id: user.id, email: user.email, accessLevel: user.access_level } });
  } catch (error) { next(error); }
});

app.get('/api/manager/dashboard', authenticate, managerOnly, async (req, res, next) => {
  try {
    const [projects] = await pool.query(`SELECT p.id, p.name, p.color, p.progress, p.start_date AS startDate, p.end_date AS endDate, COUNT(t.id) AS totalTasks, SUM(t.status = 'completed') AS completedTasks, MAX(l.created_at) AS lastLogAt FROM project p LEFT JOIN task t ON t.project_id = p.id LEFT JOIN daily_work_log l ON l.task_id = t.id WHERE p.org_id = ? AND p.status IN ('planning', 'active', 'on-hold') GROUP BY p.id ORDER BY p.end_date ASC`, [req.auth.orgId]);
    const result = projects.map((project) => ({ ...project, progress: Number(project.progress), totalTasks: Number(project.totalTasks), completedTasks: Number(project.completedTasks || 0), health: projectHealth(project) }));
    res.json({ projects: result });
  } catch (error) { next(error); }
});

app.get('/api/projects', authenticate, async (req, res, next) => {
  try { const [rows] = await pool.query('SELECT * FROM project WHERE org_id = ? ORDER BY end_date ASC', [req.auth.orgId]); res.json(rows); } catch (error) { next(error); }
});
app.get('/api/tasks', authenticate, async (req, res, next) => {
  try { const [rows] = await pool.query(`SELECT t.*, p.name AS project_name FROM task t JOIN project p ON p.id = t.project_id WHERE p.org_id = ? ORDER BY t.deadline ASC`, [req.auth.orgId]); res.json(rows); } catch (error) { next(error); }
});
app.get('/api/resources', authenticate, async (req, res, next) => {
  try { const [rows] = await pool.query(`SELECT u.id, u.employee_code, u.first_name, u.last_name, u.email, u.max_hours_per_week, COUNT(DISTINCT CASE WHEN a.is_active = 1 THEN a.task_id END) AS active_tasks, COALESCE(SUM(CASE WHEN l.log_date >= CURRENT_DATE - INTERVAL 7 DAY THEN l.hours_spent ELSE 0 END), 0) AS hours_logged FROM user u JOIN role r ON r.id = u.role_id LEFT JOIN task_assignment a ON a.user_id = u.id LEFT JOIN daily_work_log l ON l.user_id = u.id WHERE u.org_id = ? AND r.access_level = 'employee' GROUP BY u.id ORDER BY hours_logged DESC`, [req.auth.orgId]); res.json(rows); } catch (error) { next(error); }
});

app.post('/api/invites', authenticate, managerOnly, async (req, res, next) => {
  try {
    const code = `TASKY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await pool.query(`INSERT INTO workspace_invite (org_id, project_id, email, invite_code, invited_by, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`, [req.auth.orgId, req.body.projectId || null, req.body.email || null, code, req.auth.sub]);
    res.status(201).json({ code, expiresInDays: 7 });
  } catch (error) { next(error); }
});

app.post('/api/invites/redeem', authenticate, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(`SELECT * FROM workspace_invite WHERE invite_code = ? AND accepted_at IS NULL AND expires_at > NOW() FOR UPDATE`, [req.body.code]);
    const invite = rows[0];
    if (!invite) return res.status(400).json({ message: 'Invite code is invalid or expired' });
    await connection.query('UPDATE user SET org_id = ? WHERE id = ?', [invite.org_id, req.auth.sub]);
    if (invite.project_id) await connection.query('INSERT IGNORE INTO project_member (project_id, user_id, added_by) VALUES (?, ?, ?)', [invite.project_id, req.auth.sub, req.auth.sub]);
    await connection.query('UPDATE workspace_invite SET accepted_at = NOW(), accepted_by = ? WHERE id = ?', [req.auth.sub, invite.id]);
    await connection.commit();
    res.json({ message: 'Invite accepted', organizationId: invite.orgId, projectId: invite.project_id });
  } catch (error) { await connection.rollback(); next(error); } finally { connection.release(); }
});

// Performance Analytics API Routes
app.get('/api/performance/dashboard', authenticate, performancePermissions.employeeOnly, performanceController.getDashboardSummary);
app.get('/api/performance/trends', authenticate, performancePermissions.employeeOnly, performanceController.getProductivityTrend);
app.get('/api/performance/time-allocation', authenticate, performancePermissions.employeeOnly, performanceController.getTimeAllocation);
app.get('/api/performance/goals', authenticate, performancePermissions.employeeOnly, performanceController.getGoalProgress);
app.get('/api/performance/insights', authenticate, performancePermissions.employeeOnly, performanceController.getPerformanceInsights);
app.get('/api/performance/priority-report', authenticate, performancePermissions.employeeOnly, performanceController.getPriorityReport);
app.get('/api/performance/priority-trend', authenticate, performancePermissions.employeeOnly, performanceController.getPriorityTrend);
app.get('/api/performance/tasks-by-priority', authenticate, performancePermissions.employeeOnly, performanceController.getTasksByPriority);
app.post('/api/performance/export', authenticate, performancePermissions.canExportData, performanceController.exportReport);
app.get('/api/performance/filter-presets', authenticate, performancePermissions.canManageFilterPresets, performanceController.getFilterPresets);
app.post('/api/performance/filter-presets', authenticate, performancePermissions.canManageFilterPresets, performanceController.createFilterPreset);
app.put('/api/performance/filter-presets/:id', authenticate, performancePermissions.canManageFilterPresets, performanceController.updateFilterPreset);
app.delete('/api/performance/filter-presets/:id', authenticate, performancePermissions.canManageFilterPresets, performanceController.deleteFilterPreset);

app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ message: 'Unexpected server error' }); });
app.listen(port, () => console.log(`Tasky API listening on http://localhost:${port}`));
