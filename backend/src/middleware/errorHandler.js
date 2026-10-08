const logger = require('../config/logger');
const { sendError } = require('../shared/response');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  }, 'Unhandled Application Error');

  if (err.name === 'ZodError') {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 422, formattedErrors);
  }

  return sendError(res, 'Internal Server Error', 'INTERNAL_SERVER_ERROR', 500);
};

module.exports = errorHandler;
