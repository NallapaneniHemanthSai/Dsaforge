const { ROLES } = require('../constants/roles');

/**
 * Middleware to restrict access to admin-only routes.
 * Must be used AFTER the auth middleware (req.user must exist).
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_ONLY',
    });
  }

  next();
};

module.exports = { requireAdmin };
