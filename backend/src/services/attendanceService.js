const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const User = require('../models/User');
const { sameSubnet } = require('../utils/ipVerifier');
const sessionService = require('./sessionService');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

async function markAttendance(studentId, sessionId, studentIP) {
  const session = await Session.findById(sessionId);
  if (!session) throw new NotFoundError('Session not found');
  if (session.status === 'closed') throw new ValidationError('Session is closed');

  const existing = await Attendance.findOne({ studentId, sessionId });
  if (existing) throw new ConflictError('Attendance already marked');

  const verification = sameSubnet(studentIP, session.teacherIP) ? 'verified' : 'unverified';

  const diffMinutes = (new Date() - session.startTime) / 60000;
  const status = diffMinutes <= 5 ? 'present' : 'late';

  const record = await Attendance.create({
    studentId,
    sessionId,
    status,
    verification,
    source: 'wifi',
    time: new Date(),
  });

  return record;
}

async function getSessionAttendance(sessionId) {
  const session = await Session.findById(sessionId);
  if (!session) throw new NotFoundError('Session not found');

  const records = await Attendance.find({ sessionId }).populate('studentId', 'name email');
  const allStudents = await User.find({ classId: session.classId, role: 'student' });

  const markedIds = new Set(records.map((r) => r.studentId._id.toString()));

  const verified = records.filter(
    (r) => r.verification === 'verified' || r.verification === 'teacher-approved'
  );
  const unverified = records.filter((r) => r.verification === 'unverified');
  const absent = allStudents.filter((s) => !markedIds.has(s._id.toString()));

  return { verified, unverified, absent };
}

async function approveRecord(recordId, teacherId) {
  const record = await Attendance.findById(recordId).populate('sessionId');
  if (!record) throw new NotFoundError('Attendance record not found');
  if (record.sessionId.status === 'closed') throw new ValidationError('Session is closed');

  record.verification = 'verified';
  record.source = 'teacher-approved';
  await record.save();

  return record;
}

async function rejectRecord(recordId, teacherId) {
  const record = await Attendance.findById(recordId).populate('sessionId');
  if (!record) throw new NotFoundError('Attendance record not found');
  if (record.sessionId.status === 'closed') throw new ValidationError('Session is closed');

  record.status = 'absent';
  await record.save();

  return record;
}

async function manualMark(teacherId, studentId, sessionId, status) {
  const session = await Session.findById(sessionId);
  if (!session) throw new NotFoundError('Session not found');

  const student = await User.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');

  const record = await Attendance.findOneAndUpdate(
    { studentId, sessionId },
    {
      studentId,
      sessionId,
      status,
      source: 'manual',
      verification: 'teacher-approved',
      time: new Date(),
    },
    { upsert: true, new: true }
  );

  return record;
}

async function submitAttendance(sessionId, teacherId) {
  const session = await sessionService.endSession(sessionId, teacherId);
  return session;
}

async function getStudentHistory(studentId) {
  const records = await Attendance.find({ studentId }).populate({
    path: 'sessionId',
    select: 'classId subject startTime',
    populate: { path: 'classId', select: 'name' },
  });

  return records;
}

module.exports = {
  markAttendance,
  getSessionAttendance,
  approveRecord,
  rejectRecord,
  manualMark,
  submitAttendance,
  getStudentHistory,
};
