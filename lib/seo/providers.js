// Central registry of third-party data providers required for SEO tools that
// need real ranking / volume / authority / backlink data. None of these can
// be approximated honestly with free heuristics, so the tool UIs show a
// "service not configured" state until the corresponding env var is set.

export const PROVIDERS = {
  serpRanking: {
    envVar: 'SERPAPI_KEY',
    name: 'SerpApi (or any SERP-results API)',
    builtTools: ['Keyword Position Checker'],
    plannedTools: ['Google Index Checker', 'Search Snippet Preview Tool'],
  },
  keywordData: {
    envVar: 'KEYWORDS_DATA_API_KEY',
    name: 'A keyword-data API (e.g. DataForSEO, Keywords Everywhere)',
    builtTools: ['Search Volume Checker', 'Keyword Difficulty Checker'],
    plannedTools: ['Keyword Gap Analysis Tool'],
  },
  domainMetrics: {
    envVar: 'MOZ_API_KEY',
    name: 'Moz Link Explorer API (or Ahrefs/Majestic)',
    builtTools: [],
    plannedTools: ['Domain Authority Checker', 'Page Authority Checker', 'Backlink Checker', 'Referring Domains Checker', 'Backlink Gap Analysis Tool'],
  },
  pageSpeed: {
    envVar: 'PAGESPEED_API_KEY',
    name: 'Google PageSpeed Insights API',
    builtTools: [],
    plannedTools: ['Core Web Vitals Checker', 'Website Speed Test'],
  },
};

export function isProviderConfigured(providerKey) {
  const provider = PROVIDERS[providerKey];
  if (!provider) return false;
  return Boolean(process.env[provider.envVar]);
}

export function providerStatus(providerKey) {
  const provider = PROVIDERS[providerKey];
  if (!provider) return null;
  return { ...provider, configured: isProviderConfigured(providerKey) };
}
