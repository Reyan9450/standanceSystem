const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('./errors');

function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

module.exports = { sign, verify };
