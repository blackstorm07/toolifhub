// Guards against SSRF when a tool accepts an arbitrary user-supplied URL to
// fetch server-side (Meta Tags Analyzer, Robots.txt Tester, Redirect Checker, etc).

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^\[::1\]$/,
];

export function parseSafeUrl(input) {
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error('Please enter a valid URL, including https://');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http:// and https:// URLs are supported');
  }

  const hostname = url.hostname;
  if (BLOCKED_HOSTNAME_PATTERNS.some((p) => p.test(hostname))) {
    throw new Error('This URL points to a private or local address and cannot be fetched');
  }

  return url;
}

export async function fetchWithLimits(url, { timeoutMs = 8000, maxBytes = 1_500_000, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ToolifHubBot/1.0; +https://toolifhub.com)',
        ...headers,
      },
    });

    const reader = res.body?.getReader();
    let received = 0;
    const chunks = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        if (received > maxBytes) {
          controller.abort();
          break;
        }
        chunks.push(value);
      }
    }
    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const text = buffer.toString('utf-8');

    return {
      ok: res.ok,
      status: res.status,
      headers: res.headers,
      finalUrl: res.url,
      text,
    };
  } finally {
    clearTimeout(timer);
  }
}
