import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

export default function organisationRoutes(pool) {
  // GET /api/pm/org
  router.get('/', async (req, res) => {
    try {
      const orgId = req.user.org_id;

      const [orgs] = await pool.execute(
        `
        SELECT o.*,
          (SELECT COUNT(*) FROM user WHERE org_id = o.id AND is_active = 1) AS total_members
        FROM organization o
        WHERE o.id = ?
      `,
        [orgId],
      );

      if (orgs.length === 0) {
        return res.status(404).json({ success: false, error: 'Organization not found' });
      }

      // Get active invite code
      const [inviteCodes] = await pool.execute(
        `
        SELECT * FROM invite_code
        WHERE org_id = ? AND is_active = 1 AND expires_at > NOW()
      `,
        [orgId],
      );

      res.json({
        success: true,
        org: orgs[0],
        activeInviteCode: inviteCodes.length > 0 ? inviteCodes[0] : null,
      });
    } catch (error) {
      console.error('Get org error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // PUT /api/pm/org
  router.put('/', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const { name, domain } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Organization name is required' });
      }

      await pool.execute('UPDATE organization SET name = ?, domain = ? WHERE id = ?', [
        name,
        domain || null,
        orgId,
      ]);

      const [updated] = await pool.execute('SELECT * FROM organization WHERE id = ?', [orgId]);
      res.json({ success: true, org: updated[0] });
    } catch (error) {
      console.error('Update org error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/org/members
  router.get('/members', async (req, res) => {
    try {
      const orgId = req.user.org_id;

      const [members] = await pool.execute(
        `
        SELECT u.id, u.first_name, u.last_name, u.email, u.employee_code, u.avatar,
          u.phone, u.max_hours_per_week, u.professional_role, u.is_active,
          r.name AS role_name, r.access_level,
          u.created_at
        FROM user u
        JOIN role r ON r.id = u.role_id
        WHERE u.org_id = ?
        ORDER BY r.access_level DESC, u.first_name ASC
      `,
        [orgId],
      );

      res.json({ success: true, members });
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/pm/org/invite-codes
  router.get('/invite-codes', async (req, res) => {
    try {
      const orgId = req.user.org_id;

      const [codes] = await pool.execute(
        `
        SELECT ic.*, u.first_name AS creator_first_name, u.last_name AS creator_last_name
        FROM invite_code ic
        JOIN user u ON u.id = ic.created_by
        WHERE ic.org_id = ?
        ORDER BY ic.created_at DESC
      `,
        [orgId],
      );

      res.json({ success: true, codes });
    } catch (error) {
      console.error('Get invite codes error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/pm/org/invite-code
  router.post('/invite-code', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const pmId = req.user.id;
      const { max_uses, expiry_days } = req.body;

      // Deactivate current active codes
      await pool.execute(
        `
        UPDATE invite_code SET is_active = 0 WHERE org_id = ? AND is_active = 1
      `,
        [orgId],
      );

      // Generate a nice readable code like 'ORG-ABC12'
      const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
      const code = `TASKY-${randomString}`;

      const days = parseInt(expiry_days) || 30;
      const uses = parseInt(max_uses) || 50;

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      await pool.execute(
        `
        INSERT INTO invite_code (org_id, code, created_by, max_uses, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `,
        [orgId, code, pmId, uses, expiryDate],
      );

      const [newCode] = await pool.execute(
        `
        SELECT * FROM invite_code WHERE code = ?
      `,
        [code],
      );

      res.json({ success: true, code: newCode[0] });
    } catch (error) {
      console.error('Create invite code error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // DELETE /api/pm/org/invite-code/:id
  router.delete('/invite-code/:id', async (req, res) => {
    try {
      const orgId = req.user.org_id;
      const codeId = req.params.id;

      await pool.execute(
        `
        UPDATE invite_code SET is_active = 0 WHERE id = ? AND org_id = ?
      `,
        [codeId, orgId],
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Deactivate invite code error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
}
