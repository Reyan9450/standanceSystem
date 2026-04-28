require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existing = await User.findOne({ email: 'adminnew@test.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  const password = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'New Admin', email: 'adminnew@test.com', password, role: 'admin' });
  console.log('Admin created: adminnew@test.com / admin123');
  process.exit(0);
}).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
