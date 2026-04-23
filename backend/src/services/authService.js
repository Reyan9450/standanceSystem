const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = jwt.sign({ userId: user._id, role: user.role });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = { login };
