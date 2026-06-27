/**
 * Curated keyword strategy, layered on top of the auto-generated keywords in
 * lib/seo/keywords.js. Curated terms always take priority (they're listed
 * first); generated/DB keywords fill remaining slots up to the cap so every
 * page still gets unique, content-derived coverage rather than a copy-pasted
 * list. Never dump the full pool onto one page — mergeKeywords caps output.
 */

export const BRAND_KEYWORDS = [
  'ToolifHub',
  'ToolifHub Tools',
  'Free Online Tools',
  'Best Online Tools',
  'Web Tools',
  'AI Tools',
  'Developer Tools',
  'Productivity Tools',
  'Image Tools',
  'PDF Tools',
  'Text Tools',
  'Color Tools',
  'Government Tools',
  'Utility Tools',
  'Browser Based Tools',
  'Online Converter',
  'Free Web Applications',
];

export const HOMEPAGE_KEYWORDS = [
  'Free Online Tools',
  'AI Tools',
  'PDF Tools',
  'Image Tools',
  'Text Tools',
  'Developer Tools',
  'Online Utilities',
  'Productivity Tools',
  'Free Web Tools',
  'Browser Tools',
  'ToolifHub',
  'Best Free Tools',
  'AI Writing Tools',
  'Online Converters',
  'Developer Utilities',
  'Daily Use Tools',
  'Fast Online Tools',
  'Secure Online Tools',
  'No Installation Tools',
  'Free Digital Tools',
];

/** Category-page keyword overrides, keyed by category slug. */
export const CATEGORY_KEYWORD_OVERRIDES = {
  'ai-tools': [
    'AI Tools', 'Free AI Tools', 'AI Humanizer', 'AI Detector', 'AI Grammar Checker',
    'AI Paraphraser', 'AI Summarizer', 'AI Writing Tools', 'AI Productivity Tools',
    'AI Content Tools', 'Online AI Tools', 'AI Assistant', 'ChatGPT Tools', 'AI Text Tools', 'AI Utilities',
  ],
  'pdf-tools': [
    'PDF Tools', 'PDF Editor', 'Merge PDF', 'Split PDF', 'Compress PDF', 'PDF Converter',
    'Remove PDF Pages', 'Rotate PDF', 'Unlock PDF', 'Protect PDF', 'Watermark PDF',
    'PDF Utilities', 'Online PDF Tools', 'Free PDF Editor', 'PDF Management',
  ],
  'image-tools': [
    'Image Tools', 'Image Converter', 'Image Compressor', 'Image Resizer', 'Background Remover',
    'PNG Converter', 'JPG Converter', 'WebP Converter', 'Image Optimizer', 'Online Image Editor',
    'Photo Tools', 'Image Utilities', 'Image Cropper', 'Free Image Tools', 'Image Enhancement',
  ],
  'developer-tools': [
    'Developer Tools', 'JSON Formatter', 'JSON Validator', 'JSON Beautifier', 'JSON Minifier',
    'Base64 Encoder', 'Base64 Decoder', 'JWT Decoder', 'Regex Tester', 'URL Encoder', 'URL Decoder',
    'UUID Generator', 'Timestamp Converter', 'QR Code Generator', 'Password Generator',
    'CSS Minifier', 'HTML Formatter', 'XML Formatter', 'SQL Formatter', 'Code Formatter',
  ],
  'color-tools': [
    'Color Picker', 'Color Converter', 'HEX to RGB', 'RGB to HEX', 'HSL Converter', 'HSV Converter',
    'CMYK Converter', 'Color Palette Generator', 'Gradient Generator', 'CSS Color Generator',
    'Color Wheel', 'Tailwind Color Generator', 'Web Color Picker', 'Online Color Tool', 'Color Code Generator',
  ],
  'government-tools': [
    'GST Calculator', 'GST Number Validator', 'HSN Code Finder', 'SAC Code Finder', 'IFSC Code Finder',
    'PIN Code Lookup', 'Post Office Finder', 'RTO Code Finder', 'Fuel Price Checker',
    'Government Scheme Finder', 'Scholarship Finder', 'Mandi Price Checker', 'Blood Bank Finder', 'Bank Holiday Finder',
  ],
};

/** Tool-page keyword overrides, keyed by tool slug. */
export const TOOL_KEYWORD_OVERRIDES = {
  'ai-text-humanizer': [
    'AI Humanizer', 'AI Humanizer Free', 'Humanize AI Text', 'AI to Human Text', 'AI Content Humanizer',
    'Humanize ChatGPT Text', 'Undetectable AI Text', 'AI Rewrite Tool', 'AI Content Rewriter',
    'Natural Writing AI', 'Human Like Writing', 'AI Text Improver', 'Remove AI Tone', 'AI Humanizer Online', 'Best AI Humanizer',
  ],
  'ai-content-detector': [
    'AI Detector', 'AI Content Detector', 'AI Text Detector', 'ChatGPT Detector', 'AI Checker',
    'AI Detection Tool', 'Detect AI Writing', 'AI Content Checker', 'AI Generated Text Detector',
    'AI Detector Free', 'GPT Detector', 'AI Plagiarism Checker', 'AI Writing Detection', 'Online AI Detector', 'Best AI Detector',
  ],
  'ai-grammar-checker': [
    'Grammar Checker', 'AI Grammar Checker', 'Grammar Correction', 'Grammar Fixer', 'English Grammar Checker',
    'Free Grammar Checker', 'Grammar Tool', 'Spell Checker', 'Writing Assistant', 'Grammar Corrector',
    'Online Grammar Checker', 'Sentence Corrector', 'Grammar Improvement Tool', 'Writing Checker', 'AI Writing Assistant',
  ],
  'ai-paraphraser': [
    'AI Paraphraser', 'Paraphrasing Tool', 'Rewrite Text', 'Sentence Rewriter', 'AI Rewriter',
    'Text Rewriter', 'Free Paraphrasing Tool', 'Content Rewriter', 'AI Text Rewriter', 'Paraphrase Online',
    'Rewrite Paragraph', 'Rewrite Essay', 'AI Writing Tool', 'Text Improver', 'Best Paraphrasing Tool',
  ],
  'ai-text-summarizer': [
    'AI Summarizer', 'Text Summarizer', 'Article Summarizer', 'AI Summary Tool', 'Paragraph Summarizer',
    'Online Summarizer', 'Free AI Summarizer', 'Document Summarizer', 'PDF Summarizer', 'AI Text Summary',
    'Content Summarizer', 'AI Notes Generator', 'Summarize Text', 'AI Reading Tool', 'Best Text Summarizer',
  ],
  'color-picker': [
    'Color Picker', 'Color Converter', 'HEX to RGB', 'RGB to HEX', 'HSL Converter', 'HSV Converter',
    'CMYK Converter', 'Color Palette Generator', 'Gradient Generator', 'CSS Color Generator',
    'Tailwind Color Generator', 'Web Color Picker', 'Online Color Tool', 'Color Code Generator',
  ],
  'json-formatter': ['JSON Formatter', 'JSON Validator', 'JSON Beautifier', 'Developer Tools', 'Code Formatter'],
  'json-validator': ['JSON Validator', 'JSON Formatter', 'JSON Beautifier', 'Developer Tools'],
  'base64-encoder': ['Base64 Encoder', 'Base64 Decoder', 'Developer Tools', 'Online Converter'],
  'base64-decoder': ['Base64 Decoder', 'Base64 Encoder', 'Developer Tools', 'Online Converter'],
  'base64-encoder-decoder': ['Base64 Encoder', 'Base64 Decoder', 'Developer Tools', 'Online Converter'],
  'jwt-decoder': ['JWT Decoder', 'Developer Tools', 'Online Code Converter'],
  'regex-tester': ['Regex Tester', 'Developer Tools', 'Developer Utilities'],
  'uuid-generator': ['UUID Generator', 'Developer Tools', 'Developer Utilities'],
  'timestamp-converter': ['Timestamp Converter', 'Developer Tools', 'Online Converter'],
  'qr-code-generator': ['QR Code Generator', 'Utility Tools', 'Free Online Tools'],
  'password-generator': ['Password Generator', 'Security Tools', 'Secure Online Tools'],
  'css-minifier': ['CSS Minifier', 'Developer Tools', 'Code Formatter'],
  'js-minifier': ['JS Minifier', 'Developer Tools', 'Code Formatter'],
  'html-formatter': ['HTML Formatter', 'Developer Tools', 'Code Formatter'],
};

export const BLOG_KEYWORD_POOL = [
  'Technology Blog', 'AI Blog', 'Developer Blog', 'Productivity Blog',
  'Online Tools Guide', 'How To', 'Tutorials', 'AI Tips', 'Tool Guides', 'Free Software Guide',
];

export const LONG_TAIL_KEYWORDS = [
  'free online AI grammar checker',
  'best free AI humanizer',
  'online AI detector free',
  'free text summarizer online',
  'humanize AI content online',
  'free PDF editing tools',
  'online color picker and converter',
  'free developer tools online',
  'browser based utility tools',
  'no signup online tools',
  'secure online tools',
  'free productivity tools',
  'AI writing assistant free',
  'free image editing tools',
  'online code converter',
];

/**
 * Merge curated keywords (highest priority) with generated/DB keywords,
 * deduping case-insensitively and capping the total to avoid keyword stuffing.
 */
export function mergeKeywords(curated = [], generated = [], max = 15) {
  const seen = new Set();
  const out = [];
  for (const kw of [...curated, ...generated]) {
    const clean = String(kw || '').trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= max) break;
  }
  return out;
}

export function getCategoryKeywordOverride(slug) {
  return CATEGORY_KEYWORD_OVERRIDES[slug] || [];
}

export function getToolKeywordOverride(slug) {
  return TOOL_KEYWORD_OVERRIDES[slug] || [];
}
