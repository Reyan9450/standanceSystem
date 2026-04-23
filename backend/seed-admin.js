require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const password = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Super Admin', email: 'admin@test.com', password, role: 'admin' });
  console.log('Admin created');
  process.exit(0);
});