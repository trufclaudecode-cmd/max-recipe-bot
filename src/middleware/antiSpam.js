// src/middleware/antiSpam.js
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// In-memory state — single instance only. Multiple replicas will have independent state.
const userLastMessage = new Map();
const userLastTime = new Map();

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [key, time] of userLastTime.entries()) {
    if (time < cutoff) {
      userLastTime.delete(key);
      userLastMessage.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const antiSpam = (req, res, next) => {
  const userId = req.body?.message?.sender?.user_id;
  const text = req.body?.message?.message?.text;

  if (!userId || !text) return next();

  const now = Date.now();
  const lastTime = userLastTime.get(userId) || 0;
  const lastMsg = userLastMessage.get(userId) || '';

  if (now - lastTime < config.antiSpam.cooldownMs) {
    logger.warn('Anti-spam: cooldown active', { userId });
    return res.status(200).json({ ok: true });
  }

  if (text === lastMsg) {
    logger.warn('Anti-spam: duplicate message', { userId });
    return res.status(200).json({ ok: true });
  }

  if (text.length > config.antiSpam.maxMessageLength) {
    logger.warn('Anti-spam: message too long', { userId, length: text.length });
    return res.status(200).json({ ok: true });
  }

  userLastTime.set(userId, now);
  userLastMessage.set(userId, text);
  next();
};
