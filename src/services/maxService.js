// src/services/maxService.js
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const MAX_API_BASE = 'https://botapi.max.ru';

export const MENU_KEYBOARD = [
  {
    type: 'inline_keyboard',
    payload: {
      buttons: [
        [{ type: 'callback', text: 'Случайное блюдо', payload: 'random' }],
        [
          { type: 'callback', text: 'Перезапуск', payload: 'restart' },
          { type: 'callback', text: 'Связаться с нами', payload: 'contact' },
        ],
      ],
    },
  },
];

export const sendMessage = async (chatId, text, attachments) => {
  const url = `${MAX_API_BASE}/messages?chat_id=${chatId}`;

  const payload = { text };
  if (attachments) payload.attachments = attachments;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.maxBotToken,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`MAX API error ${response.status}: ${body}`);
    }

    logger.debug('Message sent to MAX', { chatId });
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};
