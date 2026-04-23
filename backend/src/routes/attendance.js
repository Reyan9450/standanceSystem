const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { markAttendanceSchema, manualMarkSchema, submitSchema } = require('../validators/schemas');
const attendanceController = require('../controllers/attendanceController');

router.post('/mark', authenticate, requireRole('student'), validate(markAttendanceSchema), attendanceController.mark);
router.get('/session/:id', authenticate, requireRole('teacher'), attendanceController.getBySession);
router.patch('/:id/approve', authenticate, requireRole('teacher'), attendanceController.approve);
router.patch('/:id/reject', authenticate, requireRole('teacher'), attendanceController.reject);
router.post('/manual', authenticate, requireRole('teacher'), validate(manualMarkSchema), attendanceController.manual);
router.post('/submit', authenticate, requireRole('teacher'), validate(submitSchema), attendanceController.submit);
router.get('/history', authenticate, requireRole('student'), attendanceController.getHistory);

module.exports = router;
