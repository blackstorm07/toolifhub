import { NextResponse } from 'next/server';
import { providerStatus } from '@/lib/seo/providers';

// Backs Keyword Position Checker, Search Volume Checker, and Keyword
// Difficulty Checker. All three need real third-party ranking/volume data —
// once SERPAPI_KEY / KEYWORDS_DATA_API_KEY are set in .env.local, replace the
// TODO blocks below with real provider calls.
export async function POST(request) {
  try {
    const { action, keyword, domain } = await request.json();
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    if (action === 'position') {
      const status = providerStatus('serpRanking');
      if (!status.configured) return notConfigured(status, 'Keyword Position Checker');
      if (!domain) return NextResponse.json({ error: 'Domain is required to check ranking position' }, { status: 400 });
      // TODO: call SerpApi (or equivalent) search endpoint for `keyword`,
      // scan results for `domain`, return matched position.
      return NextResponse.json({ error: 'Provider call not implemented yet' }, { status: 501 });
    }

    if (action === 'volume') {
      const status = providerStatus('keywordData');
      if (!status.configured) return notConfigured(status, 'Search Volume Checker');
      // TODO: call keyword-data provider for monthly search volume + trend.
      return NextResponse.json({ error: 'Provider call not implemented yet' }, { status: 501 });
    }

    if (action === 'difficulty') {
      const status = providerStatus('keywordData');
      if (!status.configured) return notConfigured(status, 'Keyword Difficulty Checker');
      // TODO: call keyword-data provider's difficulty/competition score endpoint.
      return NextResponse.json({ error: 'Provider call not implemented yet' }, { status: 501 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

function notConfigured(status, toolName) {
  return NextResponse.json(
    {
      error: `${toolName} requires a connected data provider.`,
      provider: status.name,
      envVar: status.envVar,
      configured: false,
    },
    { status: 501 }
  );
}
