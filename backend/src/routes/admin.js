const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createUserSchema, createClassSchema, assignStudentSchema } = require('../validators/schemas');
const adminController = require('../controllers/adminController');

router.post('/users', authenticate, requireRole('admin'), validate(createUserSchema), adminController.createUser);
router.get('/users', authenticate, requireRole('admin'), adminController.listUsers);
router.post('/classes', authenticate, requireRole('admin'), validate(createClassSchema), adminController.createClass);
router.post('/classes/:id/assign', authenticate, requireRole('admin'), validate(assignStudentSchema), adminController.assignStudent);
router.get('/reports', authenticate, requireRole('admin'), adminController.getReports);

module.exports = router;
