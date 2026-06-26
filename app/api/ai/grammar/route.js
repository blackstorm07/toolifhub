import { NextResponse } from 'next/server';
import { generateContent, toAiErrorResponse } from '@/lib/ai/groqClient';
import { buildGrammarPrompt } from '@/lib/ai/promptLibrary';
import { formatGrammarResponse } from '@/lib/ai/responseFormatter';
import { sanitizeInput, ValidationError } from '@/lib/ai/sanitize';
import { checkRateLimit } from '@/lib/ai/rateLimiter';
import { getClientIP } from '@/lib/utils';
import { logAiRequest } from '@/lib/ai/logger';

export async function POST(request) {
  const startedAt = Date.now();
  const ip = getClientIP(request);

  try {
    const { allowed, retryAfter } = checkRateLimit(`grammar:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await request.json();
    const text = sanitizeInput(body.text);

    const prompt = buildGrammarPrompt(text);
    const raw = await generateContent({ prompt, temperature: 0.2 });
    const data = formatGrammarResponse(raw);

    logAiRequest({ tool: 'grammar', ip, durationMs: Date.now() - startedAt, success: true });
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const { message, status } = toAiErrorResponse(err);
    logAiRequest({ tool: 'grammar', ip, durationMs: Date.now() - startedAt, success: false, error: message });
    return NextResponse.json({ error: message }, { status });
  }
}
