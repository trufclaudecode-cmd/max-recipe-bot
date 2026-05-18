import 'dotenv/config';

const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  groqApiKey: required('GROQ_API_KEY'),
  maxBotToken: required('MAX_BOT_TOKEN'),
  maxWebhookSecret: process.env.MAX_WEBHOOK_SECRET || '',
  groqModel: 'mixtral-8x7b-32768',
  groqMaxRetries: 3,
  rateLimit: {
    windowMs: 60 * 1000,
    max: 10,
  },
  antiSpam: {
    cooldownMs: 3000,
    maxMessageLength: 500,
  },
};
