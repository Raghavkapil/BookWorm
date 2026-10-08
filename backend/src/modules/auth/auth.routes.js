const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

module.exports = router;
