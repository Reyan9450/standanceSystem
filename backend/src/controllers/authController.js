const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.json({ success: true, data });
});

module.exports = { login };
