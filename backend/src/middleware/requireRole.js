const { ForbiddenError } = require('../utils/errors');

function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

module.exports = requireRole;
