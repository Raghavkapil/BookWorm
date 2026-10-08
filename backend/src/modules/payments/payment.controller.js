const paymentService = require('./payment.service');
const { sendSuccess, sendError } = require('../../shared/response');

class PaymentController {
  async createPayment(req, res, next) {
    try {
      const result = await paymentService.createPayment(req.user.id, req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async confirmPayment(req, res, next) {
    try {
      const result = await paymentService.confirmPayment(req.user.id, req.body);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new PaymentController();
