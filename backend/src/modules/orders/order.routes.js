const express = require('express');
const orderController = require('./order.controller');
const authenticate = require('../../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res, next) => orderController.listOrders(req, res, next));
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));
router.post('/:id/buy-again', (req, res, next) => orderController.buyAgain(req, res, next));
router.post('/:id/cancel', (req, res, next) => orderController.cancelOrder(req, res, next));

module.exports = router;
