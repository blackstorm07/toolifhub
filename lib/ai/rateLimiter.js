/**
 * In-memory sliding-window rate limiter for AI tool routes, keyed by
 * `${tool}:${ip}`. Same Map-based, single-instance approach already used
 * for caching in lib/government/dataGovInService.js — acceptable since this
 * project has no shared store (Redis) today.
 */

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

/** @type {Map<string, number[]>} */
const requestLog = new Map();

/**
 * @param {string} key
 * @returns {{ allowed: boolean, retryAfter: number }}
 */
export function checkRateLimit(key) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (requestLog.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
    requestLog.set(key, timestamps);
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
  return { allowed: true, retryAfter: 0 };
}
