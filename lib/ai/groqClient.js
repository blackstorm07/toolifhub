/**
 * Server-side integration with Groq (Llama 3.3 70B via the official groq-sdk).
 * Never import this from a client component — the API key must stay server-only.
 */

import Groq from 'groq-sdk';

const DEFAULT_MODEL = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_MAX_TOKENS = 4096;
const REQUEST_TIMEOUT_MS = 30000;

const isDev = process.env.NODE_ENV !== 'production';

function devLog(label, payload) {
  if (!isDev) return;
  console.log(`[groq] ${label}`, payload);
}

export class AiServiceError extends Error {
  /** @param {string} message @param {number} [status] @param {string} [code] */
  constructor(message, status = 502, code = 'UPSTREAM_ERROR') {
    super(message);
    this.name = 'AiServiceError';
    this.status = status;
    this.code = code;
  }
}

let cachedClient = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new AiServiceError('AI service is not configured.', 503, 'NOT_CONFIGURED');
  }
  if (!cachedClient) {
    cachedClient = new Groq({ apiKey, timeout: REQUEST_TIMEOUT_MS });
  }
  return cachedClient;
}

/**
 * Safely extracts the generated text from a Groq chat completion response.
 * Never assumes the shape — validates every step before trusting it.
 * @param {any} completion
 * @returns {string}
 */
function extractGroqText(completion) {
  const choice = completion?.choices?.[0];
  const text = choice?.message?.content;

  if (typeof text !== 'string' || text.trim() === '') {
    throw new AiServiceError('AI service returned a malformed response.', 502, 'MALFORMED_RESPONSE');
  }

  return text;
}

/**
 * Maps a groq-sdk error into a consistent, frontend-safe AiServiceError.
 * @param {unknown} err
 */
function mapGroqError(err) {
  const status = err?.status;
  const name = err?.name;

  if (name === 'APIConnectionTimeoutError' || err?.code === 'ETIMEDOUT') {
    return new AiServiceError('AI service is temporarily unavailable.', 504, 'TIMEOUT');
  }
  if (name === 'APIConnectionError') {
    return new AiServiceError('AI service is temporarily unavailable.', 502, 'NETWORK_ERROR');
  }
  if (status === 401 || name === 'AuthenticationError') {
    return new AiServiceError('AI service is temporarily unavailable.', 502, 'AUTH_ERROR');
  }
  if (status === 403 || name === 'PermissionDeniedError') {
    return new AiServiceError('AI service is temporarily unavailable.', 502, 'AUTH_ERROR');
  }
  if (status === 404 || name === 'NotFoundError') {
    return new AiServiceError('AI service is temporarily unavailable.', 502, 'MODEL_NOT_FOUND');
  }
  if (status === 429 || name === 'RateLimitError') {
    return new AiServiceError('AI service is temporarily unavailable.', 429, 'RATE_LIMIT');
  }
  if (typeof status === 'number' && status >= 500) {
    return new AiServiceError('AI service is temporarily unavailable.', 502, 'UPSTREAM_HTTP');
  }
  return new AiServiceError('AI service is temporarily unavailable.', 502, 'UPSTREAM_ERROR');
}

/**
 * @param {{ prompt: string, temperature?: number, maxTokens?: number, model?: string }} options
 * @returns {Promise<string>} plain generated text — never the raw Groq response object
 */
export async function generateContent({
  prompt,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens = DEFAULT_MAX_TOKENS,
  model = DEFAULT_MODEL,
}) {
  const client = getGroqClient();

  devLog('request', { model, promptLength: prompt.length, temperature, maxTokens });

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    devLog('error', { name: err?.name, status: err?.status, message: err?.message, stack: err?.stack });
    if (err instanceof AiServiceError) throw err;
    throw mapGroqError(err);
  }

  devLog('response', completion);

  const text = extractGroqText(completion);

  devLog('parsed output', { textLength: text.length });

  return text;
}

/**
 * @param {unknown} err
 */
export function toAiErrorResponse(err) {
  if (err instanceof AiServiceError) {
    return { message: err.message, status: err.status, code: err.code };
  }
  if (isDev) {
    console.error('[groq] unknown error', err?.stack || err);
  }
  return { message: 'AI service is temporarily unavailable.', status: 502, code: 'UNKNOWN' };
}
