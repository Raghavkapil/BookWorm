const orderService = require('./order.service');
const { sendSuccess, sendError } = require('../../shared/response');

class OrderController {
  async listOrders(req, res, next) {
    try {
      const orders = await orderService.listOrders(req.user.id);
      return sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.user.id, req.params.id);
      return sendSuccess(res, order);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const result = await orderService.cancelOrder(req.user.id, req.params.id);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async buyAgain(req, res, next) {
    try {
      const result = await orderService.buyAgain(req.user.id, req.params.id);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new OrderController();
