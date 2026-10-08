const productService = require('./product.service');
const { sendSuccess, sendError } = require('../../shared/response');

class ProductController {
  async listProducts(req, res, next) {
    try {
      const result = await productService.listProducts(req.query);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return sendSuccess(res, product);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async getRelatedProducts(req, res, next) {
    try {
      const related = await productService.getRelatedProducts(req.params.id);
      return sendSuccess(res, related);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new ProductController();
