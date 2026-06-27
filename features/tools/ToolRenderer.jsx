'use client';

import dynamic from 'next/dynamic';

// Tool registry: maps slug → dynamic import
const toolRegistry = {
  // YouTube Tools
  'youtube-tag-generator':       dynamic(() => import('./youtube/TagGenerator')),
  'youtube-title-generator':     dynamic(() => import('./youtube/TitleGenerator')),
  'youtube-description-generator': dynamic(() => import('./youtube/DescriptionGenerator')),
  'youtube-hashtag-generator':   dynamic(() => import('./youtube/HashtagGenerator')),
  'youtube-earnings-calculator': dynamic(() => import('./youtube/EarningsCalculator')),

  // Developer Tools
  'json-formatter':    dynamic(() => import('./developer/JsonFormatter')),
  'base64-encoder':    dynamic(() => import('./developer/Base64Tool')),
  'base64-decoder':    dynamic(() => import('./developer/Base64Tool')),
  'base64-encoder-decoder': dynamic(() => import('./developer/Base64Tool')),
  'uuid-generator':    dynamic(() => import('./developer/UUIDGenerator')),
  'hash-generator':    dynamic(() => import('./developer/HashGenerator')),
  'html-formatter':    dynamic(() => import('./developer/HtmlFormatter')),
  'json-validator':    dynamic(() => import('./developer/JsonFormatter')),
  'css-minifier':      dynamic(() => import('./developer/CssMinifier')),
  'js-minifier':       dynamic(() => import('./developer/JsMinifier')),
  'timestamp-converter':   dynamic(() => import('./developer/TimestampConverter')),
  'jwt-decoder':           dynamic(() => import('./developer/JWTDecoder')),
  'regex-tester':          dynamic(() => import('./developer/RegexTester')),
  'json-to-csv-converter': dynamic(() => import('./developer/JsonToCsvConverter')),

  // Security Tools
  'password-generator':    dynamic(() => import('./security/PasswordGenerator')),

  // Utility Tools
  'qr-code-generator':     dynamic(() => import('./utility/QRCodeGenerator')),
  'color-picker':          dynamic(() => import('./utility/ColorPicker')),

  // Text Tools
  'word-counter':              dynamic(() => import('./text/WordCounter')),
  'character-counter':         dynamic(() => import('./text/WordCounter')),
  'case-converter':            dynamic(() => import('./text/CaseConverter')),
  'lorem-ipsum-generator':     dynamic(() => import('./text/LoremIpsumGenerator')),
  'slug-generator':            dynamic(() => import('./text/SlugGenerator')),
  'text-repeater':             dynamic(() => import('./text/TextRepeater')),
  'remove-duplicate-lines':    dynamic(() => import('./text/DuplicateRemover')),
  'text-reverser':             dynamic(() => import('./text/TextReverser')),

  // AI Tools (Google Gemini-powered)
  'ai-text-humanizer':         dynamic(() => import('./text/Humanizer')),
  'ai-content-detector':       dynamic(() => import('./text/Detector')),
  'ai-paraphraser':            dynamic(() => import('./text/Paraphraser')),
  'ai-text-summarizer':        dynamic(() => import('./text/Summarizer')),
  'ai-grammar-checker':        dynamic(() => import('./text/GrammarChecker')),

  // SEO Tools
  'meta-title-generator':        dynamic(() => import('./seo/MetaTitleGenerator')),
  'meta-description-generator':  dynamic(() => import('./seo/MetaDescriptionGenerator')),
  'serp-preview-tool':            dynamic(() => import('./seo/SerpPreviewTool')),
  'open-graph-tag-generator':     dynamic(() => import('./seo/OpenGraphGenerator')),
  'twitter-card-generator':       dynamic(() => import('./seo/TwitterCardGenerator')),
  'meta-tags-analyzer':           dynamic(() => import('./seo/MetaTagsAnalyzer')),
  'keyword-density-checker':      dynamic(() => import('./seo/KeywordDensityChecker')),
  'long-tail-keyword-generator':  dynamic(() => import('./seo/LongTailKeywordGenerator')),
  'keyword-suggestion-tool':      dynamic(() => import('./seo/KeywordSuggestionTool')),
  'lsi-keyword-generator':        dynamic(() => import('./seo/LsiKeywordGenerator')),
  'related-keywords-finder':      dynamic(() => import('./seo/RelatedKeywordsFinder')),
  'keyword-position-checker':     dynamic(() => import('./seo/KeywordPositionChecker')),
  // Temporarily disabled — re-enable when keyword-data provider is connected
  // 'search-volume-checker':        dynamic(() => import('./seo/SearchVolumeChecker')),
  'keyword-difficulty-checker':   dynamic(() => import('./seo/KeywordDifficultyChecker')),

  // Calculators
  'age-calculator':        dynamic(() => import('./calculators/AgeCalculator')),
  'bmi-calculator':        dynamic(() => import('./calculators/BMICalculator')),
  'percentage-calculator': dynamic(() => import('./calculators/PercentageCalculator')),
  'emi-calculator':        dynamic(() => import('./calculators/EMICalculator')),
  'gst-calculator':        dynamic(() => import('./calculators/GSTCalculator')),
  'discount-calculator':   dynamic(() => import('./calculators/DiscountCalculator')),

  // Government Tools
  'gstin-validator':      dynamic(() => import('./government/GSTINValidator')),
  'pin-code-lookup':      dynamic(() => import('./government/PincodeLookup')),
  'post-office-finder':   dynamic(() => import('./government/PostOfficeFinder')),
  'ifsc-code-finder':     dynamic(() => import('./government/IFSCFinder')),
  'mandi-price-checker':  dynamic(() => import('./government/MandiPriceChecker')),
};

// Tools that render their own card chrome and manage popovers/overflow
// internally (e.g. dropdown menus that must not be clipped) skip the shared
// browser-style wrapper below, which applies `overflow-hidden` and would
// otherwise clip those popovers.
const NO_CHROME_TOOLS = new Set(['mandi-price-checker']);

function ComingSoon({ tool }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-muted/20">
      <div className="text-5xl mb-4">{tool?.icon || '🔧'}</div>
      <h2 className="text-xl font-bold mb-2">Tool Interface</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        This tool&apos;s interactive interface is launching soon. The tool is seeded and ready — add the frontend component in <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">features/tools/</code>.
      </p>
    </div>
  );
}

export default function ToolRenderer({ slug, tool }) {
  const ToolComponent = toolRegistry[slug];

  if (!ToolComponent) {
    return <ComingSoon tool={tool} />;
  }

  if (NO_CHROME_TOOLS.has(slug)) {
    return <ToolComponent tool={tool} />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-1 bg-muted/30 border-b border-border flex items-center gap-2 px-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <span className="text-xs text-muted-foreground ml-2 font-mono">{slug}</span>
      </div>
      <div className="p-6">
        <ToolComponent tool={tool} />
      </div>
    </div>
  );
}
