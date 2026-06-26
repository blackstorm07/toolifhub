/**
 * Input/output sanitization for AI tool routes.
 * Guards against control-character abuse, oversized payloads, and basic
 * prompt-injection attempts inside user-submitted text.
 */

export const MAX_INPUT_LENGTH = 8000;

// Matches ASCII control characters (0x00-0x1F, 0x7F) without using a literal
// control character in source, to avoid editor/encoding mangling.
const CONTROL_CHAR_REGEX = new RegExp('[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', 'g');

const INJECTION_PATTERNS = [
  /ignore (all|any|the)?\s*(previous|prior|above)\s*instructions?/gi,
  /disregard (all|any|the)?\s*(previous|prior|above)\s*instructions?/gi,
  /you are now/gi,
  /system\s*prompt\s*:/gi,
  /forget (all|everything)/gi,
];

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'INVALID_INPUT';
  }
}

/**
 * @param {string} text
 * @returns {string}
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') {
    throw new ValidationError('Text input is required.');
  }

  const trimmed = text.replace(CONTROL_CHAR_REGEX, '').trim();

  if (!trimmed) {
    throw new ValidationError('Text input cannot be empty.');
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new ValidationError(`Text input exceeds the ${MAX_INPUT_LENGTH} character limit.`);
  }

  let safe = trimmed;
  for (const pattern of INJECTION_PATTERNS) {
    safe = safe.replace(pattern, '[redacted]');
  }

  return safe;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function sanitizeOutput(text) {
  if (typeof text !== 'string') return '';
  return text.replace(CONTROL_CHAR_REGEX, '').trim();
}

/**
 * Validates that a value is one of an allowed enum set.
 * @param {string} value
 * @param {string[]} allowed
 * @param {string} fieldName
 */
export function validateEnum(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    throw new ValidationError(`Invalid ${fieldName}. Must be one of: ${allowed.join(', ')}.`);
  }
  return value;
}
