const checkoutService = require('./checkout.service');
const { sendSuccess, sendError } = require('../../shared/response');

class CheckoutController {
  async validate(req, res, next) {
    try {
      const result = await checkoutService.validateCheckout(req.user.id);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status, error.errors || []);
      }
      next(error);
    }
  }

  async applyPoints(req, res, next) {
    try {
      const result = await checkoutService.applyPoints(req.user.id, req.body.points);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
      const order = await checkoutService.createPendingOrder(req.user.id, req.body);
      return sendSuccess(res, order, 201);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new CheckoutController();
