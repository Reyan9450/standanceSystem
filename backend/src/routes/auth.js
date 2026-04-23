const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/schemas');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
