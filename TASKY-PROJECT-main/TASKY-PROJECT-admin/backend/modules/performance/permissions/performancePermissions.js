/**
 * Performance Analytics Permissions
 * 
 * Role-based access control for performance analytics
 */

/**
 * Check if user has employee access
 * Employees can only view their own performance data
 */
function employeeOnly(req, res, next) {
  if (!['admin', 'manager', 'employee'].includes(req.auth.accessLevel)) {
    return res.status(403).json({ message: 'Employee access required' });
  }
  next();
}

/**
 * Check if user has team lead access
 * Team leads can view their own data and their team's data
 */
function teamLeadOnly(req, res, next) {
  if (!['admin', 'manager', 'team_lead'].includes(req.auth.accessLevel)) {
    return res.status(403).json({ message: 'Team lead access required' });
  }
  next();
}

/**
 * Check if user has manager access
 * Managers can view department-wide analytics
 */
function managerOnly(req, res, next) {
  if (!['admin', 'manager'].includes(req.auth.accessLevel)) {
    return res.status(403).json({ message: 'Manager access required' });
  }
  next();
}

/**
 * Check if user has executive access
 * Executives can view organization-wide analytics
 */
function executiveOnly(req, res, next) {
  if (!['admin', 'executive'].includes(req.auth.accessLevel)) {
    return res.status(403).json({ message: 'Executive access required' });
  }
  next();
}

/**
 * Check if user can view the requested user's performance data
 * - Employees can only view their own data
 * - Team leads can view their team's data
 * - Managers can view department data
 * - Executives can view all data
 */
function canViewUserData(req, res, next) {
  const requestedUserId = parseInt(req.params.userId || req.query.userId);
  const currentUserId = req.auth.sub;
  const accessLevel = req.auth.accessLevel;

  // Admin can view all data
  if (accessLevel === 'admin') {
    return next();
  }

  // Executive can view all data
  if (accessLevel === 'executive') {
    return next();
  }

  // Manager can view department data (no specific user restriction needed for now)
  if (accessLevel === 'manager') {
    return next();
  }

  // Team lead can view their team's data (would need team membership check)
  if (accessLevel === 'team_lead') {
    // For now, allow team leads to view any data
    // In production, this should check if the requested user is in the same team
    return next();
  }

  // Employee can only view their own data
  if (accessLevel === 'employee') {
    if (requestedUserId && requestedUserId !== currentUserId) {
      return res.status(403).json({ message: 'You can only view your own performance data' });
    }
    return next();
  }

  return res.status(403).json({ message: 'Insufficient permissions' });
}

/**
 * Check if user can export performance data
 */
function canExportData(req, res, next) {
  const accessLevel = req.auth.accessLevel;

  // All authenticated users can export their own data
  if (['admin', 'executive', 'manager', 'team_lead', 'employee'].includes(accessLevel)) {
    return next();
  }

  return res.status(403).json({ message: 'Insufficient permissions to export data' });
}

/**
 * Check if user can manage filter presets
 */
function canManageFilterPresets(req, res, next) {
  const accessLevel = req.auth.accessLevel;

  // All authenticated users can manage their own filter presets
  if (['admin', 'executive', 'manager', 'team_lead', 'employee'].includes(accessLevel)) {
    return next();
  }

  return res.status(403).json({ message: 'Insufficient permissions to manage filter presets' });
}

export default {
  employeeOnly,
  teamLeadOnly,
  managerOnly,
  executiveOnly,
  canViewUserData,
  canExportData,
  canManageFilterPresets,
};
