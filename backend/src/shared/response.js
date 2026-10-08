const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

const sendError = (res, message, code = 'INTERNAL_SERVER_ERROR', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError
};
