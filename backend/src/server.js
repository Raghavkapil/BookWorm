const app = require('./app');
const config = require('./config/env');
const logger = require('./config/logger');

const server = app.listen(config.port, '127.0.0.1', () => {
  logger.info(`BookStore backend server running at http://127.0.0.1:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
});

module.exports = server;
