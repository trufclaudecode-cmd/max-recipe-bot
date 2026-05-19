// src/controllers/webhookController.js
import { askGroq } from '../services/groqService.js';
import { sendMessage, MENU_KEYBOARD } from '../services/maxService.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

const WELCOME_TEXT = `Привет! Я кулинарный бот. Присылаю рецепты блюд во фритюре.

Напишите название блюда или нажмите кнопку ниже.`;

const CONTACT_TEXT = `Связаться с нами:

Email: support@example.com
Телефон: +7 000 000-00-00
Telegram: @example

(замените на реальные контакты в src/controllers/webhookController.js)`;

const RANDOM_PROMPT = 'Предложи случайное блюдо во фритюре и дай его рецепт.';

const replyWithMenu = async (chatId, text) => {
  await sendMessage(chatId, text, MENU_KEYBOARD);
};

const handleCallback = async (chatId, payload, userId) => {
  logger.info('Callback pressed', { userId, chatId, payload });

  if (payload === 'restart') {
    await replyWithMenu(chatId, WELCOME_TEXT);
    return;
  }

  if (payload === 'contact') {
    await replyWithMenu(chatId, CONTACT_TEXT);
    return;
  }

  if (payload === 'random') {
    const reply = await askGroq(RANDOM_PROMPT);
    await replyWithMenu(chatId, reply);
    return;
  }
};

export const handleWebhook = async (req, res) => {
  // Always respond 200 immediately so MAX doesn't retry
  res.status(200).json({ ok: true });

  const body = req.body;
  const updateType = body?.update_type;

  if (updateType === 'message_callback') {
    const chatId = body?.message?.recipient?.chat_id;
    const payload = body?.callback?.payload;
    const userId = body?.callback?.user?.user_id;
    if (!chatId || !payload) return;

    try {
      await handleCallback(chatId, payload, userId);
      logger.info('Callback handled', { userId, chatId, payload });
    } catch (err) {
      logger.error('Failed to handle callback', { userId, chatId, payload, error: err.message });
      try {
        await replyWithMenu(chatId, 'Извините, произошла ошибка. Попробуйте ещё раз.');
      } catch {
        // Silently ignore send failure
      }
    }
    return;
  }

  if (updateType === 'bot_started') {
    const chatId = body?.chat_id;
    if (!chatId) return;
    try {
      await replyWithMenu(chatId, WELCOME_TEXT);
    } catch (err) {
      logger.error('Failed to send welcome', { chatId, error: err.message });
    }
    return;
  }

  if (updateType !== 'message_created') return;

  const text = body?.message?.message?.text?.trim();
  const chatId = body?.message?.recipient?.chat_id;
  const userId = body?.message?.sender?.user_id;

  if (!text || !chatId) return;

  logger.info('Incoming message', { userId, chatId, textLength: text.length });

  try {
    const reply = await askGroq(text);
    await replyWithMenu(chatId, reply);
    logger.info('Reply sent', { userId, chatId });
  } catch (err) {
    logger.error('Failed to process message', { userId, chatId, error: err.message });
    try {
      await replyWithMenu(chatId, 'Извините, не удалось сгенерировать рецепт. Попробуйте ещё раз.');
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
