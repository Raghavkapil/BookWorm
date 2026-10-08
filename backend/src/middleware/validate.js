const { sendError } = require('../shared/response');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      const formattedErrors = parsed.error.issues.map((err) => ({
        field: err.path.slice(1).join('.'),
        message: err.message
      }));

      return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 422, formattedErrors);
    }

    if (parsed.data.body) req.body = parsed.data.body;
    if (parsed.data.query) req.query = parsed.data.query;
    if (parsed.data.params) req.params = parsed.data.params;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
