const categoryService = require('./category.service');
const { sendSuccess, sendError } = require('../../shared/response');

class CategoryController {
  async listCategories(req, res, next) {
    try {
      const categories = await categoryService.listCategories();
      return sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryProducts(req, res, next) {
    try {
      const result = await categoryService.getCategoryProducts(req.params.slug, req.query);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new CategoryController();
