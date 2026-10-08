const cartService = require('./cart.service');
const { sendSuccess, sendError } = require('../../shared/response');

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getOrCreateCart(req.user.id);
      return sendSuccess(res, cart);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const cart = await cartService.addItem(req.user.id, req.body);
      return sendSuccess(res, cart, 201);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const cart = await cartService.updateItemQuantity(req.user.id, req.params.id, req.body.quantity);
      return sendSuccess(res, cart);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const cart = await cartService.removeItem(req.user.id, req.params.id);
      return sendSuccess(res, cart);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user.id);
      return sendSuccess(res, cart);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
