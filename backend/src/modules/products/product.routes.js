const express = require('express');
const productController = require('./product.controller');

const router = express.Router();

router.get('/', (req, res, next) => productController.listProducts(req, res, next));
router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));
router.get('/:id/related', (req, res, next) => productController.getRelatedProducts(req, res, next));

module.exports = router;
