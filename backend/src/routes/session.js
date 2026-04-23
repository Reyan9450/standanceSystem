const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { startSessionSchema, submitSchema } = require('../validators/schemas');
const sessionController = require('../controllers/sessionController');

router.post('/start', authenticate, requireRole('teacher'), validate(startSessionSchema), sessionController.start);
router.get('/active', authenticate, sessionController.getActive);
router.post('/end', authenticate, requireRole('teacher'), validate(submitSchema), sessionController.end);

module.exports = router;
