'use client';

import dynamic from 'next/dynamic';

// Reserves the tool UI's typical height while its chunk loads, so the
// component popping in doesn't shift surrounding layout (CLS).
function ToolSkeleton() {
  return (
    <div className="min-h-[280px] rounded-xl bg-muted/40 animate-pulse" aria-hidden="true" />
  );
}

const loadTool = (importFn) => dynamic(importFn, { loading: ToolSkeleton });

// Tool registry: maps slug → dynamic import
const toolRegistry = {
  // YouTube Tools
  'youtube-tag-generator':       loadTool(() => import('./youtube/TagGenerator')),
  'youtube-title-generator':     loadTool(() => import('./youtube/TitleGenerator')),
  'youtube-description-generator': loadTool(() => import('./youtube/DescriptionGenerator')),
  'youtube-hashtag-generator':   loadTool(() => import('./youtube/HashtagGenerator')),
  'youtube-earnings-calculator': loadTool(() => import('./youtube/EarningsCalculator')),

  // Developer Tools
  'json-formatter':    loadTool(() => import('./developer/JsonFormatter')),
  'base64-encoder':    loadTool(() => import('./developer/Base64Tool')),
  'base64-decoder':    loadTool(() => import('./developer/Base64Tool')),
  'base64-encoder-decoder': loadTool(() => import('./developer/Base64Tool')),
  'uuid-generator':    loadTool(() => import('./developer/UUIDGenerator')),
  'hash-generator':    loadTool(() => import('./developer/HashGenerator')),
  'html-formatter':    loadTool(() => import('./developer/HtmlFormatter')),
  'json-validator':    loadTool(() => import('./developer/JsonFormatter')),
  'css-minifier':      loadTool(() => import('./developer/CssMinifier')),
  'js-minifier':       loadTool(() => import('./developer/JsMinifier')),
  'timestamp-converter':   loadTool(() => import('./developer/TimestampConverter')),
  'jwt-decoder':           loadTool(() => import('./developer/JWTDecoder')),
  'regex-tester':          loadTool(() => import('./developer/RegexTester')),
  'json-to-csv-converter': loadTool(() => import('./developer/JsonToCsvConverter')),

  // Security Tools
  'password-generator':    loadTool(() => import('./security/PasswordGenerator')),

  // Utility Tools
  'qr-code-generator':     loadTool(() => import('./utility/QRCodeGenerator')),
  'color-picker':          loadTool(() => import('./utility/ColorPicker')),

  // Text Tools
  'word-counter':              loadTool(() => import('./text/WordCounter')),
  'character-counter':         loadTool(() => import('./text/WordCounter')),
  'case-converter':            loadTool(() => import('./text/CaseConverter')),
  'lorem-ipsum-generator':     loadTool(() => import('./text/LoremIpsumGenerator')),
  'slug-generator':            loadTool(() => import('./text/SlugGenerator')),
  'text-repeater':             loadTool(() => import('./text/TextRepeater')),
  'remove-duplicate-lines':    loadTool(() => import('./text/DuplicateRemover')),
  'text-reverser':             loadTool(() => import('./text/TextReverser')),

  // AI Tools (Google Gemini-powered)
  'ai-text-humanizer':         loadTool(() => import('./text/Humanizer')),
  'ai-content-detector':       loadTool(() => import('./text/Detector')),
  'ai-paraphraser':            loadTool(() => import('./text/Paraphraser')),
  'ai-text-summarizer':        loadTool(() => import('./text/Summarizer')),
  'ai-grammar-checker':        loadTool(() => import('./text/GrammarChecker')),

  // SEO Tools
  'meta-title-generator':        loadTool(() => import('./seo/MetaTitleGenerator')),
  'meta-description-generator':  loadTool(() => import('./seo/MetaDescriptionGenerator')),
  'serp-preview-tool':            loadTool(() => import('./seo/SerpPreviewTool')),
  'open-graph-tag-generator':     loadTool(() => import('./seo/OpenGraphGenerator')),
  'twitter-card-generator':       loadTool(() => import('./seo/TwitterCardGenerator')),
  'meta-tags-analyzer':           loadTool(() => import('./seo/MetaTagsAnalyzer')),
  'keyword-density-checker':      loadTool(() => import('./seo/KeywordDensityChecker')),
  'long-tail-keyword-generator':  loadTool(() => import('./seo/LongTailKeywordGenerator')),
  'keyword-suggestion-tool':      loadTool(() => import('./seo/KeywordSuggestionTool')),
  'lsi-keyword-generator':        loadTool(() => import('./seo/LsiKeywordGenerator')),
  'related-keywords-finder':      loadTool(() => import('./seo/RelatedKeywordsFinder')),
  'keyword-position-checker':     loadTool(() => import('./seo/KeywordPositionChecker')),
  // Temporarily disabled — re-enable when keyword-data provider is connected
  // 'search-volume-checker':        loadTool(() => import('./seo/SearchVolumeChecker')),
  'keyword-difficulty-checker':   loadTool(() => import('./seo/KeywordDifficultyChecker')),

  // Calculators
  'age-calculator':        loadTool(() => import('./calculators/AgeCalculator')),
  'bmi-calculator':        loadTool(() => import('./calculators/BMICalculator')),
  'percentage-calculator': loadTool(() => import('./calculators/PercentageCalculator')),
  'emi-calculator':        loadTool(() => import('./calculators/EMICalculator')),
  'gst-calculator':        loadTool(() => import('./calculators/GSTCalculator')),
  'discount-calculator':   loadTool(() => import('./calculators/DiscountCalculator')),

  // Government Tools
  'gstin-validator':      loadTool(() => import('./government/GSTINValidator')),
  'pin-code-lookup':      loadTool(() => import('./government/PincodeLookup')),
  'post-office-finder':   loadTool(() => import('./government/PostOfficeFinder')),
  'ifsc-code-finder':     loadTool(() => import('./government/IFSCFinder')),
  'mandi-price-checker':  loadTool(() => import('./government/MandiPriceChecker')),

  // Image Tools
  'image-compressor':         loadTool(() => import('./image/ImageCompressor')),
  'png-to-jpg':                loadTool(() => import('./image/PngToJpg')),
  'jpg-to-png':                loadTool(() => import('./image/JpgToPng')),
  'webp-converter':            loadTool(() => import('./image/WebpConverter')),
  'image-resizer':             loadTool(() => import('./image/ImageResizer')),
  'image-cropper':             loadTool(() => import('./image/ImageCropper')),
  'remove-background':         loadTool(() => import('./image/RemoveBackground')),
  'image-metadata-viewer':     loadTool(() => import('./image/ImageMetadataViewer')),
  'remove-exif':               loadTool(() => import('./image/RemoveExif')),
  'image-optimizer':           loadTool(() => import('./image/ImageOptimizer')),
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
