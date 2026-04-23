const sessionService = require('../services/sessionService');
const asyncHandler = require('../utils/asyncHandler');

const start = asyncHandler(async (req, res) => {
  const teacherIP = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
  const session = await sessionService.startSession(
    req.user.userId,
    req.body.classId,
    req.body.subject,
    teacherIP
  );
  res.status(201).json({ success: true, data: { session } });
});

const getActive = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const session = await sessionService.getActiveSession(classId);
  res.json({ success: true, data: { session } });
});

const end = asyncHandler(async (req, res) => {
  const session = await sessionService.endSession(req.body.sessionId, req.user.userId);
  res.json({ success: true, data: { session } });
});

module.exports = { start, getActive, end };
