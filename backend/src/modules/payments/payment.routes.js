const express = require('express');
const paymentController = require('./payment.controller');
const authenticate = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createPaymentSchema, confirmPaymentSchema } = require('./payment.validation');

const router = express.Router();

router.use(authenticate);

router.post('/create', validate(createPaymentSchema), (req, res, next) => paymentController.createPayment(req, res, next));
router.post('/confirm', validate(confirmPaymentSchema), (req, res, next) => paymentController.confirmPayment(req, res, next));

module.exports = router;
