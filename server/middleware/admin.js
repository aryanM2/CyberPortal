const { USER_ROLES } = require('../config/constants');

/**
 * Admin Authorization Middleware
 * Checks if user has admin role
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized. Admin access required.',
    });
  }

  next();
};

/**
 * Customer Authorization Middleware
 * Checks if user has customer role
 */
const authorizeCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== USER_ROLES.CUSTOMER) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized. Customer access required.',
    });
  }

  next();
};

/**
 * Role-based Authorization Middleware
 * Checks if user has one of the specified roles
 * @param {...string} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Not authorized. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  authorizeAdmin,
  authorizeCustomer,
  authorize,
};
