const attendanceService = require('../services/attendanceService');
const asyncHandler = require('../utils/asyncHandler');

const mark = asyncHandler(async (req, res) => {
  const studentIP = req.headers['x-forwarded-for'] || req.ip;
  const record = await attendanceService.markAttendance(req.user.userId, req.body.sessionId, studentIP);
  res.status(201).json({ success: true, data: record });
});

const getBySession = asyncHandler(async (req, res) => {
  const data = await attendanceService.getSessionAttendance(req.params.id);
  res.json({ success: true, data });
});

const approve = asyncHandler(async (req, res) => {
  const record = await attendanceService.approveRecord(req.params.id, req.user.userId);
  res.json({ success: true, data: record });
});

const reject = asyncHandler(async (req, res) => {
  const record = await attendanceService.rejectRecord(req.params.id, req.user.userId);
  res.json({ success: true, data: record });
});

const manual = asyncHandler(async (req, res) => {
  const { studentId, sessionId, status } = req.body;
  const record = await attendanceService.manualMark(req.user.userId, studentId, sessionId, status);
  res.json({ success: true, data: record });
});

const submit = asyncHandler(async (req, res) => {
  const session = await attendanceService.submitAttendance(req.body.sessionId, req.user.userId);
  res.json({ success: true, data: session });
});

const getHistory = asyncHandler(async (req, res) => {
  const records = await attendanceService.getStudentHistory(req.user.userId);
  res.json({ success: true, data: records });
});

module.exports = { mark, getBySession, approve, reject, manual, submit, getHistory };
