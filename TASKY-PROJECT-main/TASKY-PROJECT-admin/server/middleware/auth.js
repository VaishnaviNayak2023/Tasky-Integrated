import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tasky_jwt_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.application_role === 'project_manager' ? 'pm' : 'employee',
      org_id: user.org_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ success: false, error: `Access denied. Required role: ${role}` });
    }
    next();
  };
}
