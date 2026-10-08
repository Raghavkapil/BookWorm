const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const { sendError } = require('../shared/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return sendError(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return sendError(res, 'User not found', 'UNAUTHORIZED', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
