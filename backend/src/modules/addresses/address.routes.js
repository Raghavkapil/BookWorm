const express = require('express');
const addressController = require('./address.controller');
const authenticate = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { addressSchema, updateAddressSchema } = require('./address.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res, next) => addressController.listAddresses(req, res, next));
router.post('/', validate(addressSchema), (req, res, next) => addressController.createAddress(req, res, next));
router.patch('/:id', validate(updateAddressSchema), (req, res, next) => addressController.updateAddress(req, res, next));
router.delete('/:id', (req, res, next) => addressController.deleteAddress(req, res, next));

module.exports = router;
