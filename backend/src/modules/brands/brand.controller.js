const brandService = require('./brand.service');
const { sendSuccess, sendError } = require('../../shared/response');

class BrandController {
  async listBrands(req, res, next) {
    try {
      const brands = await brandService.listBrands();
      return sendSuccess(res, brands);
    } catch (error) {
      next(error);
    }
  }

  async getBrandProducts(req, res, next) {
    try {
      const result = await brandService.getBrandProducts(req.params.slug, req.query);
      return sendSuccess(res, result);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new BrandController();
