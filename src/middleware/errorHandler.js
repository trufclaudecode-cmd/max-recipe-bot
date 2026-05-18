// src/middleware/errorHandler.js
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
};
