// src/services/maxService.js
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const MAX_API_BASE = 'https://botapi.max.ru';

export const sendMessage = async (chatId, text) => {
  const url = `${MAX_API_BASE}/messages?access_token=${config.maxBotToken}&chat_id=${chatId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MAX API error ${response.status}: ${body}`);
  }

  logger.debug('Message sent to MAX', { chatId });
  return response.json();
};
