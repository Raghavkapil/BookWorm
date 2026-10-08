const express = require('express');
const checkoutController = require('./checkout.controller');
const authenticate = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { applyPointsSchema, createOrderSchema } = require('./checkout.validation');

const router = express.Router();

router.use(authenticate);

router.post('/validate', (req, res, next) => checkoutController.validate(req, res, next));
router.post('/apply-points', validate(applyPointsSchema), (req, res, next) => checkoutController.applyPoints(req, res, next));
router.post('/order', validate(createOrderSchema), (req, res, next) => checkoutController.createOrder(req, res, next));

module.exports = router;
