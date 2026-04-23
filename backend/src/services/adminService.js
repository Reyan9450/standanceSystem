const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { ConflictError, NotFoundError } = require('../utils/errors');

async function createUser(name, email, password, role, classId) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ConflictError('Email already in use');

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role, classId: classId || null });

  const { password: _pw, ...rest } = user.toObject();
  return rest;
}

async function listUsers() {
  return User.find({}).select('-password');
}

async function createClass(name, teacherId) {
  return Class.create({ name, teacherId });
}

async function assignStudentToClass(classId, studentId) {
  const cls = await Class.findById(classId);
  if (!cls) throw new NotFoundError('Class not found');

  const student = await User.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');

  student.classId = classId;
  await student.save();

  return User.findById(studentId).select('-password');
}

async function getReports() {
  return Attendance.aggregate([
    {
      $group: {
        _id: '$studentId',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' } },
    { $unwind: { path: '$student', preserveNullAndEmpty: true } },
    { $lookup: { from: 'classes', localField: 'student.classId', foreignField: '_id', as: 'class' } },
    { $unwind: { path: '$class', preserveNullAndEmpty: true } },
    {
      $project: {
        _id: 0,
        studentId: '$_id',
        studentName: '$student.name',
        className: '$class.name',
        total: 1,
        present: 1,
        late: 1,
        absent: 1,
      },
    },
  ]);
}

module.exports = { createUser, listUsers, createClass, assignStudentToClass, getReports };
