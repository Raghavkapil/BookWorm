const express = require('express');
const brandController = require('./brand.controller');

const router = express.Router();

router.get('/', (req, res, next) => brandController.listBrands(req, res, next));
router.get('/:slug/products', (req, res, next) => brandController.getBrandProducts(req, res, next));

module.exports = router;
