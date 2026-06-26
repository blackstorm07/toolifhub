import { NextResponse } from 'next/server';
import { generateContent, toAiErrorResponse } from '@/lib/ai/groqClient';
import { buildHumanizerPrompt } from '@/lib/ai/promptLibrary';
import { formatHumanizerResponse } from '@/lib/ai/responseFormatter';
import { sanitizeInput, validateEnum, ValidationError } from '@/lib/ai/sanitize';
import { checkRateLimit } from '@/lib/ai/rateLimiter';
import { getClientIP } from '@/lib/utils';
import { logAiRequest } from '@/lib/ai/logger';

const STRENGTHS = ['light', 'medium', 'strong'];

export async function POST(request) {
  const startedAt = Date.now();
  const ip = getClientIP(request);

  try {
    const { allowed, retryAfter } = checkRateLimit(`humanizer:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await request.json();
    const text = sanitizeInput(body.text);
    const strength = validateEnum(body.strength || 'medium', STRENGTHS, 'strength');
    const preserveFormatting = body.preserveFormatting !== false;
    const preserveMeaning = body.preserveMeaning !== false;
    const improveReadability = body.improveReadability !== false;

    const prompt = buildHumanizerPrompt(text, { strength, preserveFormatting, preserveMeaning, improveReadability });
    const raw = await generateContent({ prompt, temperature: 0.7 });
    const data = formatHumanizerResponse(raw);

    logAiRequest({ tool: 'humanizer', ip, durationMs: Date.now() - startedAt, success: true });
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const { message, status } = toAiErrorResponse(err);
    logAiRequest({ tool: 'humanizer', ip, durationMs: Date.now() - startedAt, success: false, error: message });
    return NextResponse.json({ error: message }, { status });
  }
}
