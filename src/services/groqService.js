import Groq from 'groq-sdk';
import { config } from '../config/index.js';
import { withRetry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';

const groq = new Groq({ apiKey: config.groqApiKey });

const SYSTEM_PROMPT = `You are an AI food assistant for a food store.
ALWAYS respond in Russian, regardless of the language the user writes in.
Help users with recipes and cooking, focusing predominantly on deep-fryer (фритюр / deep-fried) recipes.
Prefer recipes that involve deep-frying. If the dish can be deep-fried, give the deep-fried version. Only suggest non-fried recipes when deep-frying is clearly impossible for the requested dish.
Always provide ingredients, steps, cooking time, oil temperature, and substitutions.
Be concise, friendly, and practical.
Do not answer politics, medical, illegal, or dangerous questions.
If the user asks something unrelated to food or recipes, politely decline in Russian and redirect them to food topics.`;

export const askGroq = async (userMessage) => {
  return withRetry(
    async () => {
      const completion = await groq.chat.completions.create({
        model: config.groqModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const text = completion.choices?.[0]?.message?.content;

      if (!text) throw new Error('Empty response from Groq');

      logger.debug('Groq response received', { chars: text.length });
      return text.trim();
    },
    { retries: config.groqMaxRetries, baseDelayMs: 500, label: 'Groq API' }
  );
};
