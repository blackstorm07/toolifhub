import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parseSafeUrl, fetchWithLimits } from '@/lib/seo/urlSafety';

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const safeUrl = parseSafeUrl(url);
    const { ok, status, finalUrl, text, headers } = await fetchWithLimits(safeUrl);

    const $ = cheerio.load(text);

    const getMeta = (name) =>
      $(`meta[name="${name}"]`).attr('content') ||
      $(`meta[property="${name}"]`).attr('content') ||
      null;

    const headings = {};
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
      headings[tag] = $(tag)
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean);
    });

    const images = $('img');
    const imagesMissingAlt = images
      .filter((_, el) => !$(el).attr('alt') || !$(el).attr('alt').trim())
      .map((_, el) => $(el).attr('src') || '(no src)')
      .get();

    const links = $('a[href]');
    const internalLinks = [];
    const externalLinks = [];
    links.each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const resolved = new URL(href, finalUrl);
        if (resolved.hostname === new URL(finalUrl).hostname) internalLinks.push(resolved.href);
        else externalLinks.push(resolved.href);
      } catch {
        // ignore malformed href
      }
    });

    const result = {
      requestedUrl: url,
      finalUrl,
      httpStatus: status,
      ok,
      title: $('title').first().text().trim() || null,
      metaDescription: getMeta('description'),
      metaRobots: getMeta('robots'),
      canonical: $('link[rel="canonical"]').attr('href') || null,
      viewport: getMeta('viewport'),
      lang: $('html').attr('lang') || null,
      charset: $('meta[charset]').attr('charset') || null,
      headings,
      h1Count: headings.h1.length,
      openGraph: {
        title: getMeta('og:title'),
        description: getMeta('og:description'),
        image: getMeta('og:image'),
        type: getMeta('og:type'),
        url: getMeta('og:url'),
      },
      twitter: {
        card: getMeta('twitter:card'),
        title: getMeta('twitter:title'),
        description: getMeta('twitter:description'),
        image: getMeta('twitter:image'),
      },
      images: { total: images.length, missingAlt: imagesMissingAlt.length, missingAltSamples: imagesMissingAlt.slice(0, 20) },
      links: {
        total: links.length,
        internal: internalLinks.length,
        external: externalLinks.length,
        internalSamples: internalLinks.slice(0, 30),
        externalSamples: externalLinks.slice(0, 30),
      },
      contentType: headers.get('content-type') || null,
      contentLengthBytes: Buffer.byteLength(text, 'utf-8'),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to analyze URL' }, { status: 400 });
  }
}
