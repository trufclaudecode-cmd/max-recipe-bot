import { handleWebhookEvent } from './src/controllers/webhookController.js';
import { config } from './src/config/index.js';
import { logger } from './src/utils/logger.js';

export const handler = async (event) => {
  const method = (event.httpMethod || '').toUpperCase();
  const params = event.queryStringParameters || {};

  if (method === 'GET') {
    if (config.maxWebhookSecret && params.hub_secret !== config.maxWebhookSecret) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Invalid secret' }) };
    }
    return { statusCode: 200, body: params.hub_challenge || 'ok' };
  }

  if (method === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
    try {
      await handleWebhookEvent(body);
    } catch (err) {
      logger.error('Unhandled webhook error', { error: err.message });
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
