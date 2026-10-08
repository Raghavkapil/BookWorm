const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../shared/response');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 200);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }

  async logout(req, res) {
    return sendSuccess(res, { message: 'Logged out successfully' }, 200);
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, user, 200);
    } catch (error) {
      if (error.status) {
        return sendError(res, error.message, error.code, error.status);
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
