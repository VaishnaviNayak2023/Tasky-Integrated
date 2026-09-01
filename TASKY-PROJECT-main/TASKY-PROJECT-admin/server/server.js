import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { dbConfig } from './db.config.js';
import { generateToken, authenticateToken, requireRole } from './middleware/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import resourceRoutes from './routes/resources.js';
import analyticsRoutes from './routes/analytics.js';
import organisationRoutes from './routes/organisation.js';
import notificationRoutes from './routes/notifications.js';
import calendarRoutes from './routes/calendar.js';
import schedulingRoutes from './routes/scheduling.js';
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool
  .getConnection()
  .then(async (connection) => {
    console.log('Connected to MySQL database');
    try {
      await connection.query('ALTER TABLE user ADD COLUMN avatar VARCHAR(512) NULL;');
      console.log('Added avatar column to user table');
    } catch (e) {
      // Ignore error if column already exists
    }

    try {
      await connection.query(
        'ALTER TABLE task ADD COLUMN resources_needed INT NOT NULL DEFAULT 1;',
      );
      console.log('Added resources_needed column to task table');
    } catch (e) {
      // Ignore error if column already exists
    }
    connection.release();
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// Helper function to get user by employee code or email
async function getUserByIdentifier(identifier) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT u.*, r.name as role_name, r.access_level FROM user u JOIN role r ON u.role_id = r.id WHERE u.employee_code = ? OR u.email = ?',
      [identifier, identifier],
    );
    const user = rows[0];
    // Map database fields to response format
    if (user) {
      user.professional_role = user.professional_role;
      user.professional_role_other = user.professional_role_other;
      user.application_role = user.application_role;
    }
    return user;
  } finally {
    connection.release();
  }
}

// Helper function to get user by ID
async function getUserById(userId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT u.*, r.name as role_name, r.access_level FROM user u JOIN role r ON u.role_id = r.id WHERE u.id = ?',
      [userId],
    );
    const user = rows[0];
    // Map database fields to response format
    if (user) {
      user.professional_role = user.professional_role;
      user.professional_role_other = user.professional_role_other;
      user.application_role = user.application_role;
    }
    return user;
  } finally {
    connection.release();
  }
}

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Identifier and password are required' });
    }

    const user = await getUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Verify password (using bcrypt for hashed passwords, or plain text comparison for now)
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    // For testing with plain text passwords (remove in production)
    const plainTextMatch = password === user.password_hash;

    if (!passwordMatch && !plainTextMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    res.json({
      success: true,
      token,
      user: {
        id: userWithoutPassword.id.toString(),
        firstName: userWithoutPassword.first_name,
        surname: userWithoutPassword.last_name,
        email: userWithoutPassword.email,
        phone: userWithoutPassword.phone || '',
        role: userWithoutPassword.application_role === 'project_manager' ? 'pm' : 'employee',
        employeeCode: userWithoutPassword.employee_code,
        avatar:
          userWithoutPassword.avatar || `https://i.pravatar.cc/150?img=${userWithoutPassword.id}`,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Register Project Manager endpoint
app.post('/api/auth/register/pm', async (req, res) => {
  try {
    const { firstName, surname, email, phone, managerId, password, organisationName, inviteCode } =
      req.body;

    if (!firstName || !surname || !email || !managerId || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const connection = await pool.getConnection();
    try {
      // Check if email already exists
      const [existingEmail] = await connection.execute('SELECT id FROM user WHERE email = ?', [
        email,
      ]);

      if (existingEmail.length > 0) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      // Check if manager ID already exists
      const [existingId] = await connection.execute('SELECT id FROM user WHERE employee_code = ?', [
        managerId,
      ]);

      if (existingId.length > 0) {
        return res.status(400).json({ success: false, error: 'Manager ID already exists' });
      }

      let orgId;
      let roleId;

      if (inviteCode) {
        // Validate invite code against database
        const [codeRows] = await connection.execute(
          'SELECT id, org_id, current_uses, max_uses FROM invite_code WHERE code = ? AND is_active = 1 AND expires_at > NOW()',
          [inviteCode],
        );

        if (codeRows.length === 0) {
          return res.status(400).json({ success: false, error: 'Invalid or expired invite code' });
        }

        const inviteData = codeRows[0];
        if (inviteData.max_uses > 0 && inviteData.current_uses >= inviteData.max_uses) {
          return res.status(400).json({ success: false, error: 'Invite code usage limit reached' });
        }

        // Increment invite code usage
        await connection.execute(
          'UPDATE invite_code SET current_uses = current_uses + 1 WHERE id = ?',
          [inviteData.id],
        );

        orgId = inviteData.org_id;

        // Get manager role ID for this org
        const [roleRows] = await connection.execute(
          'SELECT id FROM role WHERE org_id = ? AND access_level = ? LIMIT 1',
          [orgId, 'manager'],
        );

        if (roleRows.length === 0) {
          return res
            .status(400)
            .json({ success: false, error: 'Manager role not found for this organization' });
        }
        roleId = roleRows[0].id;
      } else {
        // Create new organization
        const orgNameToUse =
          organisationName && organisationName.trim()
            ? organisationName.trim()
            : `${firstName}'s Organization`;

        let finalOrgName = orgNameToUse;
        let isUnique = false;
        let suffix = 0;

        while (!isUnique) {
          try {
            const [orgResult] = await connection.execute(
              'INSERT INTO organization (name) VALUES (?)',
              [finalOrgName],
            );
            orgId = orgResult.insertId;
            isUnique = true;
          } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              suffix++;
              finalOrgName = `${orgNameToUse} ${suffix}`;
            } else {
              throw err;
            }
          }
        }

        // Create default roles for the new organization
        await connection.execute(
          'INSERT INTO role (org_id, name, description, access_level) VALUES (?, ?, ?, ?)',
          [orgId, 'Admin', 'System Administrator', 'admin'],
        );
        const [roleResult] = await connection.execute(
          'INSERT INTO role (org_id, name, description, access_level) VALUES (?, ?, ?, ?)',
          [orgId, 'Project Manager', 'Manages projects and resources', 'manager'],
        );
        roleId = roleResult.insertId;
        await connection.execute(
          'INSERT INTO role (org_id, name, description, access_level) VALUES (?, ?, ?, ?)',
          [orgId, 'Employee', 'Standard employee access', 'employee'],
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await connection.execute(
        'INSERT INTO user (org_id, role_id, employee_code, first_name, last_name, email, phone, password_hash, application_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          orgId,
          roleId,
          managerId,
          firstName,
          surname,
          email,
          phone,
          hashedPassword,
          'project_manager',
        ],
      );

      const newUser = await getUserById(result.insertId);

      const { password_hash, ...userWithoutPassword } = newUser;
      const token = generateToken(userWithoutPassword);

      res.json({
        success: true,
        token,
        user: {
          id: userWithoutPassword.id.toString(),
          firstName: userWithoutPassword.first_name,
          surname: userWithoutPassword.last_name,
          email: userWithoutPassword.email,
          phone: userWithoutPassword.phone || '',
          role: userWithoutPassword.application_role === 'project_manager' ? 'pm' : 'employee',
          employeeCode: userWithoutPassword.employee_code,
          avatar:
            userWithoutPassword.avatar || `https://i.pravatar.cc/150?img=${userWithoutPassword.id}`,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register PM error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Register Employee endpoint
app.post('/api/auth/register/employee', async (req, res) => {
  try {
    const {
      firstName,
      surname,
      email,
      phone,
      employeeId,
      professionalRole,
      professionalRoleOther,
      inviteCode,
      password,
    } = req.body;

    console.log('Registration request received:', {
      firstName,
      surname,
      email,
      professionalRole,
      professionalRoleOther,
    });

    if (
      !firstName ||
      !surname ||
      !email ||
      !employeeId ||
      !professionalRole ||
      !inviteCode ||
      !password
    ) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Validate professional role
    const validProfessionalRoles = [
      'developer',
      'designer',
      'qa_engineer',
      'business_analyst',
      'other',
    ];
    console.log(
      'Validating professional role:',
      professionalRole,
      'against:',
      validProfessionalRoles,
    );
    if (!validProfessionalRoles.includes(professionalRole)) {
      return res.status(400).json({ success: false, error: 'Invalid professional role' });
    }

    // If professional role is 'other', validate that professionalRoleOther is provided
    if (professionalRole === 'other' && (!professionalRoleOther || !professionalRoleOther.trim())) {
      return res
        .status(400)
        .json({ success: false, error: 'Please specify your professional role' });
    }

    const connection = await pool.getConnection();
    try {
      // Validate invite code against database
      const [codeRows] = await connection.execute(
        'SELECT id, org_id, current_uses, max_uses FROM invite_code WHERE code = ? AND is_active = 1 AND expires_at > NOW()',
        [inviteCode],
      );

      if (codeRows.length === 0) {
        connection.release();
        return res.status(400).json({ success: false, error: 'Invalid or expired invite code' });
      }

      const inviteData = codeRows[0];
      const orgId = inviteData.org_id;

      if (inviteData.max_uses > 0 && inviteData.current_uses >= inviteData.max_uses) {
        connection.release();
        return res.status(400).json({ success: false, error: 'Invite code usage limit reached' });
      }

      // Increment invite code usage
      await connection.execute(
        'UPDATE invite_code SET current_uses = current_uses + 1 WHERE id = ?',
        [inviteData.id],
      );

      // Check if email already exists
      const [existingEmail] = await connection.execute('SELECT id FROM user WHERE email = ?', [
        email,
      ]);

      if (existingEmail.length > 0) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      // Check if employee ID already exists
      const [existingId] = await connection.execute('SELECT id FROM user WHERE employee_code = ?', [
        employeeId,
      ]);

      if (existingId.length > 0) {
        return res.status(400).json({ success: false, error: 'Employee ID already exists' });
      }

      // Get employee role ID (role_id for employee access level)
      const [roleRows] = await connection.execute(
        'SELECT id FROM role WHERE org_id = ? AND access_level = ? LIMIT 1',
        [orgId, 'employee'],
      );

      if (roleRows.length === 0) {
        return res.status(400).json({ success: false, error: 'Employee role not found' });
      }

      const roleId = roleRows[0].id;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user with professional role
      const [result] = await connection.execute(
        'INSERT INTO user (org_id, role_id, employee_code, first_name, last_name, email, phone, password_hash, professional_role, professional_role_other, application_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          orgId,
          roleId,
          employeeId,
          firstName,
          surname,
          email,
          phone,
          hashedPassword,
          professionalRole,
          professionalRoleOther || null,
          'employee',
        ],
      );

      const newUser = await getUserById(result.insertId);

      const { password_hash, ...userWithoutPassword } = newUser;
      const token = generateToken(userWithoutPassword);

      res.json({
        success: true,
        token,
        user: {
          id: userWithoutPassword.id.toString(),
          firstName: userWithoutPassword.first_name,
          surname: userWithoutPassword.last_name,
          email: userWithoutPassword.email,
          phone: userWithoutPassword.phone || '',
          role: userWithoutPassword.application_role === 'project_manager' ? 'pm' : 'employee',
          professionalRole: userWithoutPassword.professional_role,
          professionalRoleOther: userWithoutPassword.professional_role_other,
          employeeCode: userWithoutPassword.employee_code,
          avatar:
            userWithoutPassword.avatar || `https://i.pravatar.cc/150?img=${userWithoutPassword.id}`,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register Employee error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { role, identifier, email } = req.body;

    if (!identifier || !email) {
      return res.status(400).json({ success: false, error: 'Identifier and email are required' });
    }

    const user = await getUserByIdentifier(identifier);

    if (!user || user.email !== email) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // In production, send email with reset link
    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, error: 'New password is required' });
    }

    // In production, verify token and update password
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update user profile endpoint
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, surname, email, phone, avatar } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, avatar = ? WHERE id = ?',
        [firstName, surname, email, phone, avatar || null, userId],
      );

      // Fetch the updated user
      const [rows] = await connection.execute(
        'SELECT u.*, r.name as role_name, r.access_level FROM user u JOIN role r ON u.role_id = r.id WHERE u.id = ?',
        [userId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const dbUser = rows[0];
      const updatedUser = {
        id: dbUser.id.toString(),
        employeeCode: dbUser.employee_code,
        firstName: dbUser.first_name,
        surname: dbUser.last_name,
        email: dbUser.email,
        phone: dbUser.phone,
        avatar: dbUser.avatar || `https://i.pravatar.cc/150?img=${dbUser.id}`,
        role: dbUser.application_role === 'project_manager' ? 'pm' : 'employee',
      };

      res.json({ success: true, user: updatedUser });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// Get all users endpoint (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT u.id, u.employee_code, u.first_name, u.last_name, u.email, u.phone, r.name as role_name, r.access_level FROM user u JOIN role r ON u.role_id = r.id',
      );
      res.json({ success: true, users: rows });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PM API Routes (Protected)
app.use('/api/pm', authenticateToken, requireRole('pm'));
app.use('/api/pm/dashboard', dashboardRoutes(pool));
app.use('/api/pm/projects', projectRoutes(pool));
app.use('/api/pm/tasks', taskRoutes(pool));
app.use('/api/pm/resources', resourceRoutes(pool));
app.use('/api/pm/analytics', analyticsRoutes(pool));
app.use('/api/pm/org', organisationRoutes(pool));
app.use('/api/pm/notifications', notificationRoutes(pool));
app.use('/api/pm/calendar', calendarRoutes(pool));
app.use('/api/pm/schedule', schedulingRoutes(pool));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
