// src/controllers/webhookController.js
import { askGroq } from '../services/groqService.js';
import { sendMessage } from '../services/maxService.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export const handleWebhook = async (req, res) => {
  // Always respond 200 immediately so MAX doesn't retry
  res.status(200).json({ ok: true });

  const body = req.body;

  // Only handle message_created events with text
  if (body?.update_type !== 'message_created') return;

  const text = body?.message?.message?.text?.trim();
  const chatId = body?.message?.recipient?.chat_id;
  const userId = body?.message?.sender?.user_id;

  if (!text || !chatId) return;

  logger.info('Incoming message', { userId, chatId, textLength: text.length });

  try {
    const reply = await askGroq(text);
    await sendMessage(chatId, reply);
    logger.info('Reply sent', { userId, chatId });
  } catch (err) {
    logger.error('Failed to process message', { userId, chatId, error: err.message });
    try {
      await sendMessage(chatId, 'Sorry, I had trouble generating a recipe. Please try again.');
    } catch {
      // Silently ignore send failure
    }
  }
};

export const handleWebhookVerification = (req, res) => {
  const secret = req.query.hub_challenge;
  if (config.maxWebhookSecret && req.query.hub_secret !== config.maxWebhookSecret) {
    return res.status(403).json({ error: 'Invalid secret' });
  }
  res.status(200).send(secret || 'ok');
};
