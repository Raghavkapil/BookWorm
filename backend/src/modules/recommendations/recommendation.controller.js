const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const recommendationService = require('./recommendation.service');
const { sendSuccess } = require('../../shared/response');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, config.jwtSecret);
          userId = decoded.userId;
        } catch (e) {
          // anonymous recommendation fallback
        }
      }

      const recommendations = await recommendationService.getPersonalizedRecommendations(userId);
      return sendSuccess(res, recommendations);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
