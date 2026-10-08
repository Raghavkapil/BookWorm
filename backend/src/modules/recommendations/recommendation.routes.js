const express = require('express');
const recommendationController = require('./recommendation.controller');

const router = express.Router();

router.get('/', (req, res, next) => recommendationController.getRecommendations(req, res, next));

module.exports = router;
