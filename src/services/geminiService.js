import { config } from '../config/index.js';
import { withRetry } from '../utils/retry.js';
import { logger } from '../utils/logger.js';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

const SYSTEM_PROMPT = `You are an AI food assistant for a food store.
Help users with recipes and cooking.
Always provide ingredients, steps, cooking time, and substitutions.
Be concise, friendly, and practical.
Do not answer politics, medical, illegal, or dangerous questions.
If the user asks something unrelated to food or recipes, politely decline and redirect them to food topics.`;

const buildRequest = (userMessage) => ({
  system_instruction: {
    parts: [{ text: SYSTEM_PROMPT }],
  },
  contents: [
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ],
  generationConfig: {
    maxOutputTokens: 800,
    temperature: 0.7,
  },
});

export const askGemini = async (userMessage) => {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.geminiTimeout);

      try {
        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildRequest(userMessage)),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error('Empty response from Gemini');

        logger.debug('Gemini response received', { chars: text.length });
        return text.trim();
      } finally {
        clearTimeout(timeoutId);
      }
    },
    { retries: config.geminiMaxRetries, baseDelayMs: 500, label: 'Gemini API' }
  );
};
