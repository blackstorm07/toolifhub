import { NextResponse } from 'next/server';
import { generateContent, toAiErrorResponse } from '@/lib/ai/groqClient';
import { buildSummarizerPrompt } from '@/lib/ai/promptLibrary';
import { formatSummarizerResponse } from '@/lib/ai/responseFormatter';
import { sanitizeInput, validateEnum, ValidationError } from '@/lib/ai/sanitize';
import { checkRateLimit } from '@/lib/ai/rateLimiter';
import { getClientIP } from '@/lib/utils';
import { logAiRequest } from '@/lib/ai/logger';

const MODES = ['bullet', 'short', 'detailed', 'executive', 'key-takeaways'];
const LENGTHS = ['short', 'medium', 'long'];

export async function POST(request) {
  const startedAt = Date.now();
  const ip = getClientIP(request);

  try {
    const { allowed, retryAfter } = checkRateLimit(`summarizer:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await request.json();
    const text = sanitizeInput(body.text);
    const mode = validateEnum(body.mode || 'short', MODES, 'mode');
    const length = validateEnum(body.length || 'medium', LENGTHS, 'length');

    const prompt = buildSummarizerPrompt(text, { mode, length });
    const raw = await generateContent({ prompt, temperature: 0.5 });
    const data = formatSummarizerResponse(raw);

    logAiRequest({ tool: 'summarizer', ip, durationMs: Date.now() - startedAt, success: true });
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const { message, status } = toAiErrorResponse(err);
    logAiRequest({ tool: 'summarizer', ip, durationMs: Date.now() - startedAt, success: false, error: message });
    return NextResponse.json({ error: message }, { status });
  }
}
