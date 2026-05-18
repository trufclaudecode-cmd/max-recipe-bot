// app.js
import express from 'express';
import { rateLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import routes from './src/routes/index.js';
import { logger } from './src/utils/logger.js';

const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(express.json({ limit: '50kb' }));

  app.use((req, res, next) => {
    logger.debug('Incoming request', { method: req.method, path: req.path });
    next();
  });

  app.use(rateLimiter);
  app.use(routes);
  app.use(errorHandler);

  return app;
};

export default createApp;
