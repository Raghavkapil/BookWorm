const express = require('express');
const categoryController = require('./category.controller');

const router = express.Router();

router.get('/', (req, res, next) => categoryController.listCategories(req, res, next));
router.get('/:slug/products', (req, res, next) => categoryController.getCategoryProducts(req, res, next));

module.exports = router;
