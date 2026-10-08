const express = require('express');
const cartController = require('./cart.controller');
const authenticate = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { addItemSchema, updateItemSchema } = require('./cart.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res, next) => cartController.getCart(req, res, next));
router.post('/items', validate(addItemSchema), (req, res, next) => cartController.addItem(req, res, next));
router.patch('/items/:id', validate(updateItemSchema), (req, res, next) => cartController.updateItem(req, res, next));
router.delete('/items/:id', (req, res, next) => cartController.removeItem(req, res, next));
router.delete('/', (req, res, next) => cartController.clearCart(req, res, next));

module.exports = router;
