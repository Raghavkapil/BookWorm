const addressService = require('./address.service');
const { sendSuccess, sendError } = require('../../shared/response');

class AddressController {
  async listAddresses(req, res, next) {
    try {
      const addresses = await addressService.listAddresses(req.user.id);
      return sendSuccess(res, addresses);
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req, res, next) {
    try {
      const address = await addressService.createAddress(req.user.id, req.body);
      return sendSuccess(res, address, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
      return sendSuccess(res, address);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const result = await addressService.deleteAddress(req.user.id, req.params.id);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new AddressController();
