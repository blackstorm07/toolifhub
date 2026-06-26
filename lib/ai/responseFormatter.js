import { AiServiceError } from './groqClient';
import { sanitizeOutput } from './sanitize';

/**
 * The model is instructed to respond with raw JSON, but sometimes wraps it in
 * markdown fences. Strip those before parsing.
 * @param {string} raw
 */
function extractJson(raw) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  try {
    return JSON.parse(candidate.trim());
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[groq] failed to parse model output as JSON', { raw: raw.slice(0, 2000), error: err?.message });
    }
    throw new AiServiceError('AI service is temporarily unavailable.', 502, 'INVALID_RESPONSE');
  }
}

export function formatHumanizerResponse(raw) {
  const parsed = extractJson(raw);
  return { humanizedText: sanitizeOutput(parsed.humanizedText || '') };
}

export function formatDetectorResponse(raw) {
  const parsed = extractJson(raw);
  const aiProbability = clampPercent(parsed.aiProbability);
  const humanProbability = clampPercent(parsed.humanProbability ?? 100 - aiProbability);
  return {
    aiProbability,
    humanProbability,
    confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'medium',
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(sanitizeOutput).filter(Boolean).slice(0, 5) : [],
    disclaimer: 'This result is an AI-generated estimate and should not be treated as definitive proof.',
  };
}

export function formatParaphraserResponse(raw) {
  const parsed = extractJson(raw);
  return { paraphrasedText: sanitizeOutput(parsed.paraphrasedText || '') };
}

export function formatSummarizerResponse(raw) {
  const parsed = extractJson(raw);
  return { summary: sanitizeOutput(parsed.summary || '') };
}

export function formatGrammarResponse(raw) {
  const parsed = extractJson(raw);
  return {
    correctedText: sanitizeOutput(parsed.correctedText || ''),
    corrections: Array.isArray(parsed.corrections)
      ? parsed.corrections.map((c) => ({
          original: sanitizeOutput(c.original || ''),
          corrected: sanitizeOutput(c.corrected || ''),
          explanation: sanitizeOutput(c.explanation || ''),
          type: c.type || 'grammar',
        }))
      : [],
  };
}

function clampPercent(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}
