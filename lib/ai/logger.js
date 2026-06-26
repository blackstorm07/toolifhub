/**
 * Structured logging for AI tool requests. No dedicated logging
 * infrastructure exists in this project yet, so this writes to console
 * with consistent structured fields.
 */

/**
 * @param {{ tool: string, ip: string, durationMs: number, success: boolean, error?: string }} entry
 */
export function logAiRequest({ tool, ip, durationMs, success, error }) {
  const payload = {
    scope: 'ai-tool',
    tool,
    ip,
    durationMs,
    success,
    ...(error ? { error } : {}),
    timestamp: new Date().toISOString(),
  };

  if (success) {
    console.log('[ai-tool]', JSON.stringify(payload));
  } else {
    console.error('[ai-tool]', JSON.stringify(payload));
  }
}
