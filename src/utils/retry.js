import { logger } from './logger.js';

export const withRetry = async (fn, { retries = 3, baseDelayMs = 500, label = 'operation' } = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`${label} failed attempt ${attempt}/${retries}, retrying in ${delay}ms`, {
        error: err.message,
      });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
};
