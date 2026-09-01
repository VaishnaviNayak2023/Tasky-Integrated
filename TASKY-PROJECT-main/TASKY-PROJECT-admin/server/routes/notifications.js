import { Router } from 'express';
const router = Router();

export default function notificationRoutes(pool) {
  // GET /api/pm/notifications
  router.get('/', async (req, res) => {
    try {
      const userId = req.user.id;

      const [notifications] = await pool.execute(
        `
        SELECT * FROM notification
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
        [userId],
      );

      res.json({ success: true, notifications });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // PUT /api/pm/notifications/:id/read
  router.put('/:id/read', async (req, res) => {
    try {
      const userId = req.user.id;
      const notifId = req.params.id;

      await pool.execute(
        `
        UPDATE notification SET is_read = 1 WHERE id = ? AND user_id = ?
      `,
        [notifId, userId],
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // PUT /api/pm/notifications/read-all
  router.put('/read-all', async (req, res) => {
    try {
      const userId = req.user.id;

      await pool.execute(
        `
        UPDATE notification SET is_read = 1 WHERE user_id = ? AND is_read = 0
      `,
        [userId],
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Mark all read error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // DELETE /api/pm/notifications/:id
  router.delete('/:id', async (req, res) => {
    try {
      const userId = req.user.id;
      const notifId = req.params.id;

      await pool.execute(
        `
        DELETE FROM notification WHERE id = ? AND user_id = ?
      `,
        [notifId, userId],
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
}
