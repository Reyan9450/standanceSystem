const Session = require('../models/Session');
const Class = require('../models/Class');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { ConflictError, ForbiddenError, NotFoundError, ValidationError } = require('../utils/errors');

async function startSession(teacherId, classId, subject, teacherIP) {
  const existing = await Session.findOne({ classId, status: 'active' });
  if (existing) {
    throw new ConflictError('Active session already exists for this class');
  }

  const cls = await Class.findById(classId);
  if (!cls || cls.teacherId.toString() !== teacherId.toString()) {
    throw new ForbiddenError('You are not assigned to this class');
  }

  const session = await Session.create({
    classId,
    teacherId,
    subject,
    status: 'active',
    startTime: new Date(),
    teacherIP,
  });

  return session;
}

async function getActiveSession(classId) {
  const session = await Session.findOne({ classId, status: 'active' });
  return session || null;
}

async function endSession(sessionId, teacherId) {
  const session = await Session.findById(sessionId);
  if (!session) throw new NotFoundError('Session not found');

  if (session.teacherId.toString() !== teacherId.toString()) {
    throw new ForbiddenError('You do not own this session');
  }

  if (session.status === 'closed') {
    throw new ValidationError('Session is already closed');
  }

  const students = await User.find({ classId: session.classId, role: 'student' });
  const existingRecords = await Attendance.find({ sessionId });
  const markedIds = new Set(existingRecords.map((r) => r.studentId.toString()));

  const absentRecords = students
    .filter((s) => !markedIds.has(s._id.toString()))
    .map((s) => ({
      studentId: s._id,
      sessionId: session._id,
      status: 'absent',
      verification: 'unverified',
      source: 'system',
      time: new Date(),
    }));

  if (absentRecords.length > 0) {
    await Attendance.insertMany(absentRecords);
  }

  session.status = 'closed';
  session.endTime = new Date();
  await session.save();

  return session;
}

module.exports = { startSession, getActiveSession, endSession };
