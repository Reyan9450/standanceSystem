require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Class = require('./src/models/Class');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const password = await bcrypt.hash('test123', 10);

  // --- Teacher ---
  let teacher = await User.findOne({ email: 'teacher@test.com' });
  if (!teacher) {
    teacher = await User.create({ name: 'Mr. John Smith', email: 'teacher@test.com', password, role: 'teacher' });
    console.log('Teacher created: teacher@test.com / test123');
  } else {
    console.log('Teacher already exists, skipping.');
  }

  // --- Class ---
  let cls = await Class.findOne({ name: 'Computer Science 101' });
  if (!cls) {
    cls = await Class.create({ name: 'Computer Science 101', teacherId: teacher._id });
    console.log(`Class created: Computer Science 101 (ID: ${cls._id})`);
  } else {
    console.log(`Class already exists (ID: ${cls._id}), skipping.`);
  }

  // --- Students ---
  const students = [
    { name: 'Alice Johnson', email: 'alice@test.com' },
    { name: 'Bob Williams', email: 'bob@test.com' },
    { name: 'Carol Davis', email: 'carol@test.com' },
  ];

  for (const s of students) {
    const existing = await User.findOne({ email: s.email });
    if (!existing) {
      await User.create({ name: s.name, email: s.email, password, role: 'student', classId: cls._id });
      console.log(`Student created: ${s.email} / test123`);
    } else {
      // Ensure classId is set
      if (!existing.classId) {
        existing.classId = cls._id;
        await existing.save();
        console.log(`Updated classId for existing student: ${s.email}`);
      } else {
        console.log(`Student already exists: ${s.email}, skipping.`);
      }
    }
  }

  // Update teacher's classId reference (optional, for dashboard use)
  await User.findByIdAndUpdate(teacher._id, { classId: cls._id });

  console.log('\n--- Seed complete ---');
  console.log(`Class ID (use this to start sessions): ${cls._id}`);
  console.log('\nCredentials (password: test123):');
  console.log('  Teacher:  teacher@test.com');
  console.log('  Student1: alice@test.com');
  console.log('  Student2: bob@test.com');
  console.log('  Student3: carol@test.com');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
