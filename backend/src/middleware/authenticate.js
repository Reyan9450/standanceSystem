const jwt = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

module.exports = authenticate;
