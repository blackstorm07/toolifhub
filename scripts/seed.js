/**
 * ToolifHub Database Seed Script
 *
 * Run with: node scripts/seed.js
 * Or:       npm run seed
 *
 * Requires .env.local to be configured with MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@toolifhub.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

if (!MONGODB_URI) { console.error('❌ MONGODB_URI is not set in .env.local'); process.exit(1); }
if (!ADMIN_PASSWORD) { console.error('❌ ADMIN_PASSWORD is not set in .env.local'); process.exit(1); }

// ─── Schemas ──────────────────────────────────────────────────────────────────

const CategorySchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, icon: String,
  description: String, featured: Boolean, order: Number,
}, { timestamps: true });

const ToolSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  shortDescription: String, fullDescription: String, keywords: [String],
  icon: String, featured: Boolean, trending: Boolean,
  status: { type: String, enum: ['active', 'inactive', 'coming-soon'], default: 'active' },
  faq: [{ question: String, answer: String }],
  relatedTools: [String],
  seoTitle: String, seoDescription: String, seoKeywords: [String],
  views: { type: Number, default: 0 }, usageCount: { type: Number, default: 0 },
}, { timestamps: true });

const BlogSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true },
  content: String, excerpt: String, featuredImage: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String], status: { type: String, default: 'published' },
  featured: Boolean, views: { type: Number, default: 0 },
  seoTitle: String, seoDescription: String, publishedAt: Date,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'YouTube Tools', slug: 'youtube-tools', icon: '📹', description: 'Tools to grow your YouTube channel — tag generators, title optimizers, earnings calculators, and more.', featured: true, order: 1 },
  { name: 'SEO Tools', slug: 'seo-tools', icon: '🔍', description: 'Optimize your website for search engines with keyword research, meta tag generators, and SERP analyzers.', featured: true, order: 2 },
  { name: 'Developer Tools', slug: 'developer-tools', icon: '💻', description: 'Essential tools for developers — JSON formatter, Base64 encoder, UUID generator, hash generators, and more.', featured: true, order: 3 },
  { name: 'Text Tools', slug: 'text-tools', icon: '📝', description: 'Manipulate and analyze text with word counters, case converters, Lorem ipsum generators, and text transformers.', featured: true, order: 4 },
  { name: 'Image Tools', slug: 'image-tools', icon: '🖼️', description: 'Edit, convert, compress, and transform images directly in your browser.', featured: false, order: 5 },
  { name: 'PDF Tools', slug: 'pdf-tools', icon: '📄', description: 'Work with PDFs — merge, split, compress, convert, and extract text from PDF files.', featured: false, order: 6 },
  { name: 'Calculators', slug: 'calculators', icon: '🧮', description: 'Financial, health, math, and everyday calculators — EMI, BMI, age, percentage, GST, and more.', featured: true, order: 7 },
  { name: 'Converters', slug: 'converters', icon: '🔄', description: 'Convert between units, formats, currencies, and file types instantly.', featured: false, order: 8 },
  { name: 'Security Tools', slug: 'security-tools', icon: '🔐', description: 'Protect your digital life with password generators, hash checkers, and encryption tools.', featured: false, order: 9 },
  { name: 'Color Tools', slug: 'color-tools', icon: '🎨', description: 'Pick colors, convert between formats (HEX, RGB, HSL), generate palettes, and find accessible color combinations.', featured: false, order: 10 },
  { name: 'AI Tools', slug: 'ai-tools', icon: '🤖', description: 'Boost your productivity with free AI-powered tools. Humanize AI text, detect AI-generated content, summarize articles, paraphrase text, check grammar, and more—all in one place.', featured: true, order: 11 },
  { name: 'Social Media Tools', slug: 'social-media-tools', icon: '📱', description: 'Hashtag generators, bio writers, and engagement tools for Instagram, Twitter, TikTok, and more.', featured: false, order: 12 },
  { name: 'Utility Tools', slug: 'utility-tools', icon: '🛠️', description: 'Handy everyday tools — QR code generators, barcode creators, countdown timers, and miscellaneous utilities.', featured: false, order: 13 },
  { name: 'Productivity Tools', slug: 'productivity-tools', icon: '⚡', description: 'Boost your productivity with note organizers, Pomodoro timers, to-do list generators, and focus tools.', featured: false, order: 14 },
  { name: 'Random Generators', slug: 'random-generators', icon: '🎲', description: 'Generate random names, numbers, passwords, colors, quotes, and more with a single click.', featured: false, order: 15 },
  { name: 'Government Tools', slug: 'government-tools', icon: '🏛️', description: 'India government and public-data tools — GSTIN validation, PIN code lookup, IFSC finder, mandi prices, and more.', featured: true, order: 16 },
];

// Tools data keyed by category slug
const TOOLS_BY_CATEGORY = {
  'youtube-tools': [
    {
      title: 'YouTube Tag Generator', slug: 'youtube-tag-generator', icon: '🏷️',
      shortDescription: 'Generate optimized YouTube tags to boost your video discoverability.',
      fullDescription: 'Our YouTube Tag Generator helps you create high-ranking tags for your YouTube videos. Simply enter your video title or topic, and our tool will generate relevant, searchable tags that can improve your video\'s reach and visibility on YouTube.',
      keywords: ['youtube tags', 'video tags', 'youtube seo', 'tag generator', 'video seo'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'How many tags should I use on YouTube?', answer: 'YouTube allows up to 500 characters for tags. Aim for 5–15 highly relevant tags that describe your video content, channel, and topic.' },
        { question: 'Do YouTube tags still matter in 2024?', answer: 'Yes, while their weight has decreased, tags still help YouTube understand your video content and can improve discoverability, especially for long-tail keywords.' },
      ],
      relatedTools: ['youtube-title-generator', 'youtube-description-generator'],
      seoTitle: 'YouTube Tag Generator — Free Tool for Better Video SEO | ToolifHub',
      seoDescription: 'Generate optimized YouTube tags for free. Enter your video title or topic and get relevant tags to boost discoverability.',
    },
    {
      title: 'YouTube Title Generator', slug: 'youtube-title-generator', icon: '✍️',
      shortDescription: 'Generate click-worthy YouTube video titles that attract more viewers.',
      fullDescription: 'Create compelling YouTube video titles that drive clicks and improve search ranking. Our AI-powered title generator provides you with multiple high-converting title options based on your topic.',
      keywords: ['youtube title', 'video title generator', 'click bait title', 'youtube seo title'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'What makes a good YouTube title?', answer: 'A good YouTube title includes your main keyword near the beginning, is under 60 characters, creates curiosity or promises value, and is honest about the video content.' },
        { question: 'How long should a YouTube title be?', answer: 'YouTube titles should be between 40–60 characters. Longer titles may get cut off in search results and recommendations.' },
      ],
      relatedTools: ['youtube-tag-generator', 'youtube-description-generator'],
      seoTitle: 'YouTube Title Generator — Craft Click-Worthy Titles | ToolifHub',
      seoDescription: 'Generate compelling YouTube video titles that boost clicks and rankings. Free YouTube title generator with dozens of proven templates.',
    },
    {
      title: 'YouTube Description Generator', slug: 'youtube-description-generator', icon: '📋',
      shortDescription: 'Create SEO-optimized YouTube descriptions to increase your video reach.',
      fullDescription: 'Generate professional, keyword-rich YouTube video descriptions in seconds. Our description generator creates complete descriptions with timestamps, CTAs, hashtags, and social links.',
      keywords: ['youtube description', 'video description generator', 'youtube seo', 'description template'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'How long should a YouTube description be?', answer: 'YouTube allows up to 5,000 characters for descriptions. Aim for at least 200–300 words. Put the most important information and keywords in the first 2–3 lines.' },
      ],
      relatedTools: ['youtube-tag-generator', 'youtube-title-generator'],
      seoTitle: 'YouTube Description Generator — Free SEO Description Tool | ToolifHub',
      seoDescription: 'Create SEO-optimized YouTube video descriptions with timestamps, hashtags, and CTAs. Free YouTube description generator.',
    },
    {
      title: 'YouTube Hashtag Generator', slug: 'youtube-hashtag-generator', icon: '#️⃣',
      shortDescription: 'Generate trending hashtags to increase your YouTube video visibility.',
      fullDescription: 'Boost your YouTube video reach with relevant hashtags. Enter your topic and our tool generates the best hashtags to use in your video title, description, or comments.',
      keywords: ['youtube hashtags', 'hashtag generator', 'video hashtags', 'trending hashtags'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'How many hashtags can I use on YouTube?', answer: 'You can use up to 60 hashtags on YouTube, but YouTube recommends using 3–5 highly relevant hashtags for best results.' },
      ],
      relatedTools: ['youtube-tag-generator'],
      seoTitle: 'YouTube Hashtag Generator — Free Tool | ToolifHub',
      seoDescription: 'Generate trending YouTube hashtags for free. Enter your topic and get optimized hashtags to boost your video discoverability.',
    },
    {
      title: 'YouTube Earnings Calculator', slug: 'youtube-earnings-calculator', icon: '💰',
      shortDescription: 'Estimate your YouTube channel earnings based on views and niche.',
      fullDescription: 'Calculate potential YouTube earnings based on your video views, niche, and estimated CPM/RPM rates. Get minimum, maximum, and average earning estimates.',
      keywords: ['youtube earnings', 'youtube money calculator', 'youtube revenue', 'adsense calculator', 'youtube cpm'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'How much does YouTube pay per 1000 views?', answer: 'YouTube typically pays between $0.25–$4 per 1,000 views (RPM), though this varies significantly by niche, audience location, and time of year. Finance and tech niches tend to earn more.' },
      ],
      relatedTools: ['youtube-tag-generator', 'youtube-title-generator'],
      seoTitle: 'YouTube Earnings Calculator — How Much Can You Make? | ToolifHub',
      seoDescription: 'Calculate your estimated YouTube earnings based on views and niche. Free YouTube money calculator with CPM/RPM estimation.',
    },
  ],

  'seo-tools': [
    {
      title: 'Meta Title Generator', slug: 'meta-title-generator', icon: '🏷️',
      shortDescription: 'Generate SEO-optimized title tag suggestions from any keyword.',
      fullDescription: 'Enter a target keyword and get multiple SEO-friendly title tag templates instantly, complete with character/pixel-width checks so your titles don\'t get truncated in Google search results.',
      keywords: ['meta title generator', 'title tag generator', 'seo title', 'page title generator'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'How long should a meta title be?', answer: 'Keep title tags under about 60 characters (≈580px) so Google doesn\'t truncate them in search results.' },
        { question: 'Should my keyword be at the start of the title?', answer: 'Placing your primary keyword near the beginning of the title tends to carry slightly more SEO weight and is more noticeable to users scanning results.' },
      ],
      relatedTools: ['meta-description-generator', 'serp-preview-tool'],
      seoTitle: 'Meta Title Generator — Free SEO Title Tag Tool | ToolifHub',
      seoDescription: 'Generate SEO-optimized meta title suggestions for any keyword. Free title tag generator with character and pixel-width checks.',
    },
    {
      title: 'Meta Description Generator', slug: 'meta-description-generator', icon: '📝',
      shortDescription: 'Generate compelling, SEO-friendly meta description suggestions.',
      fullDescription: 'Generate multiple meta description options from a single keyword, each checked against Google\'s typical SERP truncation width so your descriptions display fully in search results.',
      keywords: ['meta description generator', 'seo description', 'meta tag generator', 'page description generator'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'How long should a meta description be?', answer: 'Aim for under 160 characters so Google doesn\'t cut off your description in search results.' },
        { question: 'Does meta description affect rankings?', answer: 'It\'s not a direct ranking factor, but a compelling description improves click-through rate, which can indirectly benefit SEO performance.' },
      ],
      relatedTools: ['meta-title-generator', 'serp-preview-tool'],
      seoTitle: 'Meta Description Generator — Free SEO Tool | ToolifHub',
      seoDescription: 'Generate SEO-friendly meta description suggestions for any keyword. Free meta tag generator with length checks.',
    },
    {
      title: 'SERP Preview Tool', slug: 'serp-preview-tool', icon: '🔍',
      shortDescription: 'Preview how your title and description will look in Google search results.',
      fullDescription: 'See a live, realistic preview of how your page will appear in Google search results on desktop and mobile, with real-time character and pixel-width truncation warnings.',
      keywords: ['serp preview', 'google snippet preview', 'search result preview', 'serp simulator'],
      featured: true, trending: false, status: 'active',
      faq: [{ question: 'Why does Google sometimes rewrite my title or description?', answer: 'Google occasionally generates its own title or snippet from page content if it judges the existing tags don\'t match the search query well. Writing clear, relevant tags reduces the chance of this.' }],
      relatedTools: ['meta-title-generator', 'meta-description-generator'],
      seoTitle: 'SERP Preview Tool — Google Search Result Snippet Preview | ToolifHub',
      seoDescription: 'Preview how your page title and description will appear in Google search results on desktop and mobile. Free SERP snippet simulator.',
    },
    {
      title: 'Open Graph Tag Generator', slug: 'open-graph-tag-generator', icon: '🌐',
      shortDescription: 'Generate Open Graph meta tags for rich social media link previews.',
      fullDescription: 'Generate complete Open Graph (og:) meta tags for Facebook, LinkedIn, and other platforms that use the OG protocol. Live preview shows exactly how your shared link will look.',
      keywords: ['open graph generator', 'og tags generator', 'facebook meta tags', 'social share preview'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'What is Open Graph?', answer: 'Open Graph is a protocol that lets any web page become a rich object in social platforms — controlling the title, description, and image shown when your page is shared on Facebook, LinkedIn, and similar networks.' }],
      relatedTools: ['twitter-card-generator', 'meta-title-generator'],
      seoTitle: 'Open Graph Tag Generator — Free OG Meta Tag Tool | ToolifHub',
      seoDescription: 'Generate Open Graph meta tags for rich social media previews on Facebook, LinkedIn, and more. Free OG tag generator with live preview.',
    },
    {
      title: 'Twitter Card Generator', slug: 'twitter-card-generator', icon: '🐦',
      shortDescription: 'Generate Twitter/X Card meta tags for rich link previews.',
      fullDescription: 'Create Twitter Card meta tags (summary, summary large image, app, and player cards) with a live preview, so your links display with rich images and descriptions when shared on X/Twitter.',
      keywords: ['twitter card generator', 'twitter meta tags', 'x card generator', 'twitter:card'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Which Twitter Card type should I use?', answer: '"summary_large_image" is best for most content with a strong featured image. Use "summary" for smaller thumbnails, "app" for app install cards, and "player" for video/audio content.' }],
      relatedTools: ['open-graph-tag-generator', 'meta-title-generator'],
      seoTitle: 'Twitter Card Generator — Free X/Twitter Meta Tag Tool | ToolifHub',
      seoDescription: 'Generate Twitter/X Card meta tags with a live preview. Free Twitter Card generator for rich link previews.',
    },
    {
      title: 'Meta Tags Analyzer', slug: 'meta-tags-analyzer', icon: '🧪',
      shortDescription: 'Analyze any live URL\'s title, meta tags, headings, and social tags.',
      fullDescription: 'Enter any public URL and instantly see its title tag, meta description, canonical URL, robots directives, Open Graph/Twitter tags, heading structure, and image alt-text coverage — fetched live from the page.',
      keywords: ['meta tags analyzer', 'seo tag checker', 'meta tag checker', 'on-page seo checker'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'Does this analyzer crawl the whole site?', answer: 'No — it analyzes a single URL you provide each time, fetching the live HTML to extract meta and tag data.' },
        { question: 'Why might a URL fail to analyze?', answer: 'The target site may block automated requests, require JavaScript rendering, or be unreachable. Local/private network addresses are blocked for security.' },
      ],
      relatedTools: ['serp-preview-tool', 'open-graph-tag-generator'],
      seoTitle: 'Meta Tags Analyzer — Free On-Page SEO Tag Checker | ToolifHub',
      seoDescription: 'Analyze any URL\'s title, meta description, canonical tag, Open Graph/Twitter tags, and headings live. Free meta tags analyzer.',
    },
    {
      title: 'Keyword Density Checker', slug: 'keyword-density-checker', icon: '📊',
      shortDescription: 'Check keyword and phrase density in your content to avoid stuffing.',
      fullDescription: 'Paste your article or page content and instantly see the most frequently repeated single words, 2-word phrases, and 3-word phrases, along with their density percentage — helping you avoid keyword stuffing while staying topically focused.',
      keywords: ['keyword density checker', 'keyword density tool', 'content keyword analyzer', 'keyword stuffing checker'],
      featured: true, trending: false, status: 'active',
      faq: [{ question: 'What is a healthy keyword density?', answer: 'Most SEO practitioners recommend keeping your primary keyword density between 1–3%. Densities above 5% risk being seen as keyword stuffing.' }],
      relatedTools: ['keyword-suggestion-tool', 'lsi-keyword-generator'],
      seoTitle: 'Keyword Density Checker — Free Content Analysis Tool | ToolifHub',
      seoDescription: 'Check keyword and phrase density in your content for free. Avoid keyword stuffing and optimize your on-page SEO.',
    },
    {
      title: 'Long Tail Keyword Generator', slug: 'long-tail-keyword-generator', icon: '🐍',
      shortDescription: 'Generate long-tail keyword phrase variations from a seed keyword.',
      fullDescription: 'Enter a seed keyword and generate dozens of longer, more specific keyword phrase variations using proven long-tail and question-based patterns — great for blog topic ideation and content planning.',
      keywords: ['long tail keyword generator', 'long tail keywords', 'keyword phrase generator', 'content idea generator'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Why target long-tail keywords?', answer: 'Long-tail keywords are typically less competitive and more specific, often converting better because they match precise user intent.' }],
      relatedTools: ['keyword-suggestion-tool', 'related-keywords-finder'],
      seoTitle: 'Long Tail Keyword Generator — Free Keyword Ideas Tool | ToolifHub',
      seoDescription: 'Generate long-tail keyword phrase variations from any seed keyword. Free tool for content and SEO planning.',
    },
    {
      title: 'Keyword Suggestion Tool', slug: 'keyword-suggestion-tool', icon: '💡',
      shortDescription: 'Get keyword ideas using the alphabet-soup and modifier methods.',
      fullDescription: 'Generate keyword ideas around your seed term using commercial modifiers, prepositions, and the classic "alphabet soup" technique used to mine autocomplete-style suggestions.',
      keywords: ['keyword suggestion tool', 'keyword ideas generator', 'keyword brainstorm tool'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Where do these suggestions come from?', answer: 'They\'re generated from common keyword-expansion patterns (modifiers, prepositions, alphabet variations) rather than live search engine autocomplete data.' }],
      relatedTools: ['long-tail-keyword-generator', 'related-keywords-finder'],
      seoTitle: 'Keyword Suggestion Tool — Free Keyword Ideas Generator | ToolifHub',
      seoDescription: 'Generate keyword suggestions from any seed term using proven keyword-expansion patterns. Free keyword ideas tool.',
    },
    {
      title: 'LSI Keyword Generator', slug: 'lsi-keyword-generator', icon: '🧠',
      shortDescription: 'Generate semantically related terms to add topical depth to content.',
      fullDescription: 'Generate a list of semantically and topically related terms around your main keyword to help you write more comprehensive, contextually rich content.',
      keywords: ['lsi keyword generator', 'semantic keywords', 'related terms generator', 'topical seo'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'What are LSI keywords?', answer: 'LSI (Latent Semantic Indexing) keywords are terms conceptually related to your main topic. Including them helps search engines and readers understand your content\'s context and depth.' }],
      relatedTools: ['related-keywords-finder', 'keyword-density-checker'],
      seoTitle: 'LSI Keyword Generator — Free Semantic Keyword Tool | ToolifHub',
      seoDescription: 'Generate semantically related LSI keywords for any topic. Free tool to add topical depth to your content.',
    },
    {
      title: 'Related Keywords Finder', slug: 'related-keywords-finder', icon: '🔗',
      shortDescription: 'Find related keyword ideas based on your seed topic.',
      fullDescription: 'Discover keyword ideas related to your seed topic using question, preposition, and topical-relation patterns — useful for expanding content briefs and internal linking strategy.',
      keywords: ['related keywords finder', 'related keyword tool', 'keyword expansion tool'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'How is this different from the Keyword Suggestion Tool?', answer: 'This tool focuses specifically on topically and conceptually related terms, while the Keyword Suggestion Tool leans more on commercial and alphabet-based modifiers.' }],
      relatedTools: ['lsi-keyword-generator', 'long-tail-keyword-generator'],
      seoTitle: 'Related Keywords Finder — Free Keyword Expansion Tool | ToolifHub',
      seoDescription: 'Find related keyword ideas for any seed topic. Free related keywords tool for content and SEO research.',
    },
    {
      title: 'Keyword Position Checker', slug: 'keyword-position-checker', icon: '📍',
      shortDescription: 'Check where a domain ranks in Google for a target keyword.',
      fullDescription: 'Check a domain\'s real-time Google ranking position for any keyword. This tool requires a connected SERP data provider (e.g. SerpApi) — until one is configured, the tool clearly indicates it isn\'t connected rather than showing fabricated rankings.',
      keywords: ['keyword position checker', 'keyword rank checker', 'serp position checker', 'google rank tracker'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Why does this tool show "not connected"?', answer: 'Real-time ranking data requires a licensed SERP API. Once an administrator configures the SERPAPI_KEY environment variable, this tool returns live ranking positions.' }],
      relatedTools: ['search-volume-checker', 'keyword-difficulty-checker'],
      seoTitle: 'Keyword Position Checker — Google Rank Tracker | ToolifHub',
      seoDescription: 'Check your domain\'s Google ranking position for any keyword. Requires a connected SERP data provider.',
    },
    {
      title: 'Search Volume Checker', slug: 'search-volume-checker', icon: '📈',
      shortDescription: 'Check the average monthly search volume for any keyword.',
      fullDescription: 'Look up estimated monthly search volume for any keyword. This tool requires a connected keyword-data provider — until one is configured, the tool clearly indicates it isn\'t connected rather than showing fabricated numbers.',
      keywords: ['search volume checker', 'keyword volume tool', 'monthly search volume checker'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Where does search volume data come from?', answer: 'Once configured, this tool sources volume data from a connected keyword-data API (e.g. DataForSEO or Keywords Everywhere). It does not estimate volume from heuristics.' }],
      relatedTools: ['keyword-difficulty-checker', 'keyword-position-checker'],
      seoTitle: 'Search Volume Checker — Free Keyword Volume Tool | ToolifHub',
      seoDescription: 'Check average monthly search volume for any keyword. Requires a connected keyword-data provider.',
    },
    {
      title: 'Keyword Difficulty Checker', slug: 'keyword-difficulty-checker', icon: '⚔️',
      shortDescription: 'Check how difficult it would be to rank for a target keyword.',
      fullDescription: 'Get a keyword difficulty score reflecting how hard it would be to rank on page 1 for a given term. This tool requires a connected keyword-data provider — until one is configured, the tool clearly indicates it isn\'t connected rather than showing a fabricated score.',
      keywords: ['keyword difficulty checker', 'keyword competition checker', 'kd score tool'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'What does a difficulty score mean?', answer: 'A higher score means stronger, more established competition currently ranks for that keyword. Once a provider is connected, scores typically run from 0 (easiest) to 100 (hardest).' }],
      relatedTools: ['search-volume-checker', 'keyword-position-checker'],
      seoTitle: 'Keyword Difficulty Checker — Free SEO Competition Tool | ToolifHub',
      seoDescription: 'Check keyword difficulty/competition scores for any term. Requires a connected keyword-data provider.',
    },
  ],

  'developer-tools': [
    {
      title: 'JSON Formatter & Beautifier', slug: 'json-formatter', icon: '{}',
      shortDescription: 'Format, validate, and minify JSON data with syntax highlighting.',
      fullDescription: 'Format and beautify ugly JSON data or minify it for production. Validate JSON syntax, customize indentation, and instantly spot errors. Perfect for developers working with APIs and data files.',
      keywords: ['json formatter', 'json beautifier', 'json validator', 'json minifier', 'format json online'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'What is JSON formatting?', answer: 'JSON formatting (or beautifying) adds proper indentation and line breaks to compact JSON data, making it human-readable and easier to debug.' },
        { question: 'Is JSON formatting safe?', answer: 'Yes, all processing happens in your browser. No data is sent to any server.' },
      ],
      relatedTools: ['base64-encoder-decoder', 'json-to-csv-converter'],
      seoTitle: 'JSON Formatter & Beautifier — Format & Validate JSON Online | ToolifHub',
      seoDescription: 'Format, beautify, validate, and minify JSON data online for free. Fast JSON formatter with syntax highlighting and error detection.',
    },
    {
      title: 'Base64 Encoder & Decoder', slug: 'base64-encoder-decoder', icon: '🔢',
      shortDescription: 'Encode text or data to Base64 and decode Base64 strings instantly.',
      fullDescription: 'Easily encode text, URLs, or data to Base64 format, or decode Base64 strings back to plain text. Supports UTF-8 encoding and handles special characters correctly.',
      keywords: ['base64 encoder', 'base64 decoder', 'base64 online', 'encode base64', 'decode base64'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What is Base64 encoding used for?', answer: 'Base64 is used to encode binary data (like images or files) as ASCII text for safe transmission in URLs, emails, and data URIs. It\'s commonly used in JWTs, embedding images in CSS/HTML, and API payloads.' },
      ],
      relatedTools: ['json-formatter', 'hash-generator'],
      seoTitle: 'Base64 Encoder & Decoder — Free Online Tool | ToolifHub',
      seoDescription: 'Encode text to Base64 or decode Base64 strings online for free. Supports UTF-8 and handles special characters correctly.',
    },
    {
      title: 'UUID Generator', slug: 'uuid-generator', icon: '🆔',
      shortDescription: 'Generate random UUID v4 values for your development projects.',
      fullDescription: 'Generate cryptographically random UUID (Universally Unique Identifier) v4 values. Generate 1 to 20 UUIDs at a time, copy individually or all at once.',
      keywords: ['uuid generator', 'guid generator', 'unique id generator', 'uuid v4', 'random uuid'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What is a UUID?', answer: 'A UUID (Universally Unique Identifier) is a 128-bit label used in computing to uniquely identify information. UUID v4 is randomly generated and has an extremely low probability of collision.' },
      ],
      relatedTools: ['hash-generator', 'json-formatter'],
      seoTitle: 'UUID Generator — Generate UUID v4 Online Free | ToolifHub',
      seoDescription: 'Generate random UUID v4 values instantly. Copy one or multiple UUIDs for your databases, APIs, and development projects.',
    },
    {
      title: 'Hash Generator', slug: 'hash-generator', icon: '#️⃣',
      shortDescription: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text.',
      fullDescription: 'Generate cryptographic hash values for any text using MD5, SHA-1, SHA-256, or SHA-512 algorithms. All processing happens client-side in your browser for maximum security.',
      keywords: ['hash generator', 'md5 generator', 'sha256 generator', 'sha1 hash', 'checksum generator'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What is a hash function?', answer: 'A hash function takes input data and produces a fixed-size output (hash/digest). The same input always produces the same hash, but the process is one-way — you cannot reverse a hash to get the original data.' },
      ],
      relatedTools: ['base64-encoder-decoder', 'uuid-generator'],
      seoTitle: 'Hash Generator — MD5, SHA-1, SHA-256 Online | ToolifHub',
      seoDescription: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes online for free. All processing is done in your browser for security.',
    },
    {
      title: 'HTML Formatter', slug: 'html-formatter', icon: '🌐',
      shortDescription: 'Format and beautify HTML code with proper indentation.',
      fullDescription: 'Instantly format messy HTML code with proper indentation and structure. Also supports HTML minification to reduce file size for production.',
      keywords: ['html formatter', 'html beautifier', 'format html', 'html minifier', 'prettify html'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Does HTML formatting affect my website?', answer: 'HTML formatting only changes whitespace and indentation, which doesn\'t affect how browsers render the page. It\'s purely for readability.' }],
      relatedTools: ['css-minifier', 'js-minifier'],
      seoTitle: 'HTML Formatter & Beautifier — Format HTML Online | ToolifHub',
      seoDescription: 'Format and beautify HTML code online for free. Proper indentation and clean structure in one click.',
    },
    {
      title: 'CSS Minifier', slug: 'css-minifier', icon: '🎨',
      shortDescription: 'Minify CSS code to reduce file size and improve page load speed.',
      fullDescription: 'Remove unnecessary whitespace, comments, and redundant code from your CSS files. See real-time savings percentage and copy minified CSS instantly.',
      keywords: ['css minifier', 'css compressor', 'minify css', 'compress css', 'css optimizer'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'How much can CSS minification reduce file size?', answer: 'CSS minification typically reduces file size by 20–50% depending on the amount of comments and whitespace in the original file.' }],
      relatedTools: ['html-formatter', 'js-minifier'],
      seoTitle: 'CSS Minifier — Compress CSS Online Free | ToolifHub',
      seoDescription: 'Minify and compress CSS code online for free. Reduce CSS file size for faster page load speeds.',
    },
    {
      title: 'JavaScript Minifier', slug: 'js-minifier', icon: '⚡',
      shortDescription: 'Minify JavaScript code to reduce bundle size and speed up your site.',
      fullDescription: 'Compress JavaScript code by removing whitespace, comments, and unnecessary characters. Ideal for preparing scripts for production deployment.',
      keywords: ['js minifier', 'javascript minifier', 'minify javascript', 'compress js', 'js compressor'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Is minified JavaScript harder to debug?', answer: 'Yes, minified code is less readable. Always keep your original source files and use source maps in development. Minification is for production deployment only.' }],
      relatedTools: ['css-minifier', 'html-formatter'],
      seoTitle: 'JavaScript Minifier — Compress JS Online Free | ToolifHub',
      seoDescription: 'Minify JavaScript code online for free. Reduce JS file size by removing whitespace and comments.',
    },
    {
      title: 'Timestamp Converter', slug: 'timestamp-converter', icon: '⏱️',
      shortDescription: 'Convert between Unix timestamps and human-readable dates instantly.',
      fullDescription: 'Convert Unix timestamps (seconds or milliseconds) to readable dates, or convert any date to a Unix timestamp. View results in UTC, your local timezone, and ISO 8601 format, all updated in real time as you type.',
      keywords: ['timestamp converter', 'unix timestamp', 'epoch converter', 'unix time to date', 'date to timestamp'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'What is a Unix timestamp?', answer: 'A Unix timestamp is the number of seconds (or milliseconds) that have elapsed since January 1, 1970 (the Unix epoch), excluding leap seconds. It is widely used in programming to represent dates and times.' },
        { question: 'How do I know if a timestamp is in seconds or milliseconds?', answer: 'Unix timestamps in seconds are typically 10 digits (e.g. 1718000000), while millisecond timestamps are 13 digits (e.g. 1718000000000). This tool detects the format automatically based on digit count.' },
      ],
      relatedTools: ['jwt-decoder', 'json-formatter'],
      seoTitle: 'Timestamp Converter — Unix Time to Date Online | ToolifHub',
      seoDescription: 'Convert Unix timestamps to dates and dates to Unix timestamps instantly. View UTC, local time, and ISO 8601 formats in real time.',
    },
    {
      title: 'JWT Decoder', slug: 'jwt-decoder', icon: '🔓',
      shortDescription: 'Decode JWT tokens to view header and payload claims instantly.',
      fullDescription: 'Paste any JSON Web Token (JWT) to instantly decode its header and payload into readable JSON. View expiration (exp) and issued-at (iat) claims as human-readable dates. All decoding happens locally in your browser — the signature is never verified or sent anywhere.',
      keywords: ['jwt decoder', 'decode jwt', 'jwt parser', 'json web token decoder', 'jwt viewer'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'Does this tool verify the JWT signature?', answer: 'No, this tool only decodes the header and payload — it does not verify the signature. Signature verification requires the secret key or public key used to sign the token, which should never be entered into a third-party tool.' },
        { question: 'Is it safe to paste a JWT here?', answer: 'Decoding happens entirely in your browser using client-side JavaScript. The token is never sent to any server. However, avoid pasting tokens containing sensitive production secrets into any online tool as a general precaution.' },
      ],
      relatedTools: ['timestamp-converter', 'base64-encoder-decoder'],
      seoTitle: 'JWT Decoder — Decode JSON Web Tokens Online | ToolifHub',
      seoDescription: 'Decode JWT tokens online for free. View header, payload, and expiration claims instantly. All processing happens in your browser.',
    },
    {
      title: 'Regex Tester', slug: 'regex-tester', icon: '🔍',
      shortDescription: 'Test regular expressions against sample text with live match highlighting.',
      fullDescription: 'Build and test regular expressions with real-time match highlighting, support for all standard flags (g, i, m, s), and a library of common pattern examples for email, URL, phone number, and more.',
      keywords: ['regex tester', 'regular expression tester', 'regex online', 'test regex', 'regex match highlighter'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What do regex flags like g, i, m, s mean?', answer: '"g" (global) finds all matches instead of just the first. "i" (case-insensitive) ignores letter case. "m" (multiline) makes ^ and $ match line boundaries. "s" (dotAll) makes "." match newline characters too.' },
        { question: 'Why is my regex not matching anything?', answer: 'Common causes include forgetting the "g" flag (which limits results to the first match in some checks), unescaped special characters, or case sensitivity — try toggling the "i" flag.' },
      ],
      relatedTools: ['json-formatter', 'json-to-csv-converter'],
      seoTitle: 'Regex Tester — Test Regular Expressions Online | ToolifHub',
      seoDescription: 'Test and debug regular expressions online with live match highlighting. Supports all regex flags and includes common pattern examples.',
    },
    {
      title: 'JSON to CSV Converter', slug: 'json-to-csv-converter', icon: '📋',
      shortDescription: 'Convert a JSON array of objects into downloadable CSV data.',
      fullDescription: 'Paste a JSON array of objects to instantly convert it into CSV format. Automatically builds column headers from all object keys, handles missing fields, and lets you copy or download the result as a .csv file.',
      keywords: ['json to csv', 'json to csv converter', 'convert json to csv', 'json csv online', 'csv export tool'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What JSON format does this tool expect?', answer: 'An array of flat objects, e.g. [{"name": "Asha", "age": 28}, {"name": "Ravi", "age": 34}]. Nested objects or arrays within a field are converted to a JSON string in that CSV cell.' },
        { question: 'What happens if objects have different keys?', answer: 'The CSV header includes every key found across all objects. Rows missing a particular key will have an empty value in that column.' },
      ],
      relatedTools: ['json-formatter', 'regex-tester'],
      seoTitle: 'JSON to CSV Converter — Convert JSON Online Free | ToolifHub',
      seoDescription: 'Convert JSON arrays to CSV online for free. Automatic header detection, CSV download, and copy support. All processing happens in your browser.',
    },
  ],

  'text-tools': [
    {
      title: 'Word Counter', slug: 'word-counter', icon: '📊',
      shortDescription: 'Count words, characters, sentences, and reading time instantly.',
      fullDescription: 'Paste or type your text to instantly see word count, character count (with and without spaces), sentence count, paragraph count, and estimated reading time. Also shows keyword density for your top words.',
      keywords: ['word counter', 'character counter', 'word count tool', 'text analyzer', 'reading time calculator'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'How is reading time calculated?', answer: 'Reading time is calculated based on an average reading speed of 200–250 words per minute for adults.' },
        { question: 'Does the word counter include numbers?', answer: 'Yes, numbers are counted as words. A sequence of digits separated by spaces counts as individual words.' },
      ],
      relatedTools: ['case-converter', 'lorem-ipsum-generator'],
      seoTitle: 'Word Counter — Count Words, Characters & Reading Time | ToolifHub',
      seoDescription: 'Free online word counter. Instantly count words, characters, sentences, paragraphs, and reading time. No login required.',
    },
    {
      title: 'Case Converter', slug: 'case-converter', icon: 'Aa',
      shortDescription: 'Convert text between UPPERCASE, lowercase, Title Case, camelCase, and more.',
      fullDescription: 'Instantly convert text to 10 different cases: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, aLtErNaTiNg, and iNVERSE cASE.',
      keywords: ['case converter', 'text case converter', 'uppercase converter', 'camelcase converter', 'snake case converter'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'What is camelCase used for?', answer: 'camelCase is commonly used in JavaScript, Java, and other programming languages for variable and function names (e.g., myVariableName).' },
        { question: 'What is snake_case?', answer: 'snake_case uses underscores between words and is common in Python, SQL, and file naming conventions.' },
      ],
      relatedTools: ['word-counter', 'slug-generator'],
      seoTitle: 'Case Converter — Convert Text to Any Case Online | ToolifHub',
      seoDescription: 'Convert text to uppercase, lowercase, title case, camelCase, snake_case, and 6 more text cases instantly. Free online case converter.',
    },
    {
      title: 'Lorem Ipsum Generator', slug: 'lorem-ipsum-generator', icon: '📄',
      shortDescription: 'Generate placeholder Lorem Ipsum text for your design projects.',
      fullDescription: 'Generate classic Lorem Ipsum placeholder text in words, sentences, or paragraphs. Perfect for filling design mockups, testing layouts, and placeholder content in web development.',
      keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator', 'filler text', 'lorem ipsum'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'What is Lorem Ipsum?', answer: 'Lorem Ipsum is placeholder text used in design and publishing to simulate the appearance of real text without the distraction of actual content.' }],
      relatedTools: ['word-counter', 'text-repeater'],
      seoTitle: 'Lorem Ipsum Generator — Free Placeholder Text | ToolifHub',
      seoDescription: 'Generate Lorem Ipsum placeholder text for free. Choose words, sentences, or paragraphs for your design mockups.',
    },
    {
      title: 'Slug Generator', slug: 'slug-generator', icon: '🔗',
      shortDescription: 'Convert text to URL-friendly slugs for blog posts and pages.',
      fullDescription: 'Convert any text into a clean, URL-friendly slug. Choose your separator (hyphen, underscore, or none), and get instant previews with and without the separator.',
      keywords: ['slug generator', 'url slug', 'permalink generator', 'seo url', 'url friendly text'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'What is a URL slug?', answer: 'A URL slug is the readable part of a URL that identifies a specific page. For example, in example.com/blog/my-post, the slug is "my-post". Good slugs are lowercase, use hyphens, and include relevant keywords.' }],
      relatedTools: ['case-converter', 'word-counter'],
      seoTitle: 'Slug Generator — Create SEO-Friendly URL Slugs | ToolifHub',
      seoDescription: 'Convert text to URL-friendly slugs instantly. Choose hyphen or underscore separator. Free online slug generator.',
    },
    {
      title: 'Text Repeater', slug: 'text-repeater', icon: '🔁',
      shortDescription: 'Repeat any text multiple times with custom separators.',
      fullDescription: 'Repeat any text or phrase a specified number of times with your choice of separator: new line, space, or comma. Useful for generating test data, filling forms, or creating repeated patterns.',
      keywords: ['text repeater', 'repeat text', 'duplicate text', 'text duplicator'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'What is a text repeater used for?', answer: 'Text repeaters are useful for generating test data, creating fill patterns, testing form fields with repeated input, or simply repeating a phrase for creative writing.' }],
      relatedTools: ['lorem-ipsum-generator', 'word-counter'],
      seoTitle: 'Text Repeater — Repeat Any Text Multiple Times | ToolifHub',
      seoDescription: 'Repeat any text up to 1000 times with custom separators. Free online text repeater tool.',
    },
    {
      title: 'Duplicate Line Remover', slug: 'remove-duplicate-lines', icon: '🧹',
      shortDescription: 'Remove duplicate lines from text with case-insensitive matching.',
      fullDescription: 'Paste a list of lines and instantly remove all duplicates. Supports case-sensitive and case-insensitive matching, with optional whitespace trimming. See exactly how many duplicates were removed.',
      keywords: ['remove duplicates', 'duplicate remover', 'remove duplicate lines', 'unique lines', 'deduplicate text'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'Can I remove duplicates case-insensitively?', answer: 'Yes! Toggle "Case sensitive" off to treat "Apple" and "apple" as duplicates. The original casing of the first occurrence is preserved.' }],
      relatedTools: ['word-counter', 'text-reverser'],
      seoTitle: 'Duplicate Line Remover — Remove Duplicate Lines Online | ToolifHub',
      seoDescription: 'Remove duplicate lines from text online for free. Case-insensitive matching and whitespace trimming options available.',
    },
    {
      title: 'Text Reverser', slug: 'text-reverser', icon: '↩️',
      shortDescription: 'Reverse text characters, words, or lines instantly.',
      fullDescription: 'Reverse your text in three ways: character-by-character, word order, or line order. Useful for creating mirror text, testing parsers, or just having fun with text.',
      keywords: ['text reverser', 'reverse text', 'mirror text', 'reverse words', 'backwards text'],
      featured: false, trending: false, status: 'active',
      faq: [{ question: 'What are the different reverse modes?', answer: 'Character mode reverses every character (e.g., "hello" → "olleh"). Word mode reverses the word order. Line mode reverses the order of lines while keeping each line intact.' }],
      relatedTools: ['case-converter', 'remove-duplicate-lines'],
      seoTitle: 'Text Reverser — Reverse Text, Words & Lines Online | ToolifHub',
      seoDescription: 'Reverse text characters, word order, or line order instantly. Free online text reverser tool.',
    },
  ],

  'calculators': [
    {
      title: 'Age Calculator', slug: 'age-calculator', icon: '🎂',
      shortDescription: 'Calculate your exact age in years, months, days, and more.',
      fullDescription: 'Calculate your exact age from your date of birth. See your age in years, months, days, total weeks, total days, and total hours. Also shows how many days until your next birthday.',
      keywords: ['age calculator', 'how old am i', 'birthday calculator', 'age in days', 'age calculator online'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'Can I calculate age between two specific dates?', answer: 'Yes! Use the "Calculate Age As Of" field to specify a reference date other than today.' },
        { question: 'How accurate is the age calculator?', answer: 'Our calculator accounts for leap years and varying month lengths to give you the exact age down to the day.' },
      ],
      relatedTools: ['bmi-calculator', 'percentage-calculator'],
      seoTitle: 'Age Calculator — Calculate Your Exact Age | ToolifHub',
      seoDescription: 'Calculate your exact age in years, months, days, weeks, and hours. Free online age calculator with birthday countdown.',
    },
    {
      title: 'BMI Calculator', slug: 'bmi-calculator', icon: '⚖️',
      shortDescription: 'Calculate your Body Mass Index (BMI) and healthy weight range.',
      fullDescription: 'Calculate your Body Mass Index (BMI) in metric (kg/cm) or imperial (lbs/ft) units. Get your BMI category, healthy weight range, and personalized health advice.',
      keywords: ['bmi calculator', 'body mass index', 'healthy weight calculator', 'bmi chart', 'overweight calculator'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'What is a healthy BMI?', answer: 'A BMI between 18.5 and 24.9 is considered normal/healthy. Under 18.5 is underweight, 25–29.9 is overweight, and 30+ is obese.' },
        { question: 'Is BMI accurate for everyone?', answer: 'BMI is a screening tool and doesn\'t account for muscle mass, bone density, age, or sex differences. Athletes may have high BMI despite being healthy. Always consult a healthcare professional.' },
      ],
      relatedTools: ['age-calculator', 'percentage-calculator'],
      seoTitle: 'BMI Calculator — Calculate Body Mass Index Online | ToolifHub',
      seoDescription: 'Calculate your BMI in metric or imperial units. Get your healthy weight range and BMI category instantly.',
    },
    {
      title: 'Percentage Calculator', slug: 'percentage-calculator', icon: '%',
      shortDescription: 'Calculate percentages, increases, decreases, and more in seconds.',
      fullDescription: 'Six different percentage calculators in one tool: find X% of Y, calculate what percentage X is of Y, find percentage change, add/subtract percentage, and more.',
      keywords: ['percentage calculator', 'percent calculator', 'calculate percentage', 'percentage increase', 'percentage decrease'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'How do I calculate percentage increase?', answer: 'Percentage increase = ((New Value - Old Value) / Old Value) × 100. For example, from 50 to 75: ((75-50)/50) × 100 = 50% increase.' },
      ],
      relatedTools: ['gst-calculator', 'discount-calculator'],
      seoTitle: 'Percentage Calculator — Calculate Percentages Online | ToolifHub',
      seoDescription: 'Calculate percentages, increases, decreases, and more with our free online percentage calculator. Six different calculation modes.',
    },
    {
      title: 'EMI Calculator', slug: 'emi-calculator', icon: '🏦',
      shortDescription: 'Calculate monthly EMI for home, car, or personal loans.',
      fullDescription: 'Calculate Equated Monthly Installments (EMI) for any loan. Enter the loan amount, interest rate, and tenure to get your monthly EMI, total interest payable, and full amortization schedule.',
      keywords: ['emi calculator', 'loan emi calculator', 'home loan calculator', 'car loan calculator', 'mortgage calculator'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'What is EMI?', answer: 'EMI (Equated Monthly Installment) is a fixed monthly payment made to a lender on a set date each calendar month. EMI is used to pay off both the principal and interest of a loan over a period of time.' },
        { question: 'How is EMI calculated?', answer: 'EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is the principal, r is the monthly interest rate, and n is the number of months.' },
      ],
      relatedTools: ['gst-calculator', 'percentage-calculator'],
      seoTitle: 'EMI Calculator — Calculate Loan EMI Online | ToolifHub',
      seoDescription: 'Calculate monthly EMI for home, car, or personal loans. Get amortization schedule and total interest payable.',
    },
    {
      title: 'GST Calculator', slug: 'gst-calculator', icon: '🧾',
      shortDescription: 'Add or extract GST from any amount with CGST and SGST breakdown.',
      fullDescription: 'Calculate GST (Goods and Services Tax) on any amount. Supports all GST slabs (0%, 0.25%, 3%, 5%, 12%, 18%, 28%) and custom rates. Shows CGST and SGST breakdown for inter-state transactions.',
      keywords: ['gst calculator', 'goods and services tax', 'gst inclusive calculator', 'cgst sgst calculator', 'india gst'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What are CGST and SGST?', answer: 'CGST (Central GST) and SGST (State GST) together make up the total GST for intra-state transactions. Each is typically half of the total GST rate.' },
        { question: 'What is GST inclusive vs exclusive?', answer: 'GST exclusive means the price doesn\'t include GST (GST is added on top). GST inclusive means the price already includes GST (GST is extracted from it).' },
      ],
      relatedTools: ['percentage-calculator', 'discount-calculator'],
      seoTitle: 'GST Calculator — Calculate GST Online with CGST & SGST | ToolifHub',
      seoDescription: 'Add or extract GST from any amount. Supports all GST slabs with CGST and SGST breakdown. Free online GST calculator.',
    },
    {
      title: 'Discount Calculator', slug: 'discount-calculator', icon: '🏷️',
      shortDescription: 'Calculate discount prices, savings, and percentage off instantly.',
      fullDescription: 'Four discount calculation modes: find the discounted price from a percentage, calculate the discount from a fixed amount, find what percentage off was applied, or find the original price. Includes comparison with other discount rates.',
      keywords: ['discount calculator', 'sale price calculator', 'percentage off calculator', 'savings calculator', 'price discount'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'How do I calculate 20% off a price?', answer: 'Multiply the original price by 0.20 to get the discount amount, then subtract from the original price. For $100 at 20% off: $100 × 0.20 = $20 discount, $100 - $20 = $80 final price.' },
      ],
      relatedTools: ['gst-calculator', 'percentage-calculator'],
      seoTitle: 'Discount Calculator — Calculate Sale Prices & Savings | ToolifHub',
      seoDescription: 'Calculate discounted prices, savings, and percentage off. Four calculation modes for all your discount needs.',
    },
  ],

  'security-tools': [
    {
      title: 'Password Generator', slug: 'password-generator', icon: '🔑',
      shortDescription: 'Generate strong, secure random passwords with custom settings.',
      fullDescription: 'Generate cryptographically random passwords with customizable length and character sets. Choose uppercase, lowercase, numbers, and symbols. Includes password strength meter.',
      keywords: ['password generator', 'random password', 'strong password generator', 'secure password', 'password maker'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'How long should a password be?', answer: 'Security experts recommend passwords of at least 12 characters, with 16+ characters being ideal for sensitive accounts. Longer passwords are exponentially harder to crack.' },
      ],
      relatedTools: ['hash-generator', 'uuid-generator'],
      seoTitle: 'Password Generator — Generate Strong Secure Passwords | ToolifHub',
      seoDescription: 'Generate strong, random passwords with custom length and character sets. Free online password generator with strength meter.',
    },
  ],

  'color-tools': [
    {
      title: 'Color Picker & Converter', slug: 'color-picker', icon: '🎨',
      shortDescription: 'Pick colors and convert instantly between HEX, RGB, HSL, HSV, CMYK, and HWB — with palettes, gradients, CSS/Tailwind code, and accessibility checks.',
      fullDescription: 'Pick any color visually, with the EyeDropper tool, or by typing a value, and instantly convert it between HEX, HEXA, RGB, RGBA, HSL, HSLA, HSV, CMYK, and HWB formats. Generate complementary, analogous, triadic, and monochromatic palettes, shades and tints, linear/radial/conic gradients, ready-to-use CSS and Tailwind classes, and WCAG contrast/accessibility checks — all client-side with no sign-up.',
      keywords: ['color picker', 'color converter', 'hex to rgb', 'rgb to hex', 'hsl converter', 'cmyk converter', 'css color generator', 'tailwind color generator', 'color palette generator', 'gradient generator', 'color code'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What is HEX color code?', answer: 'HEX is a 6-character hexadecimal representation of a color (e.g., #3B82F6) used throughout CSS and HTML. Each pair of characters represents the red, green, and blue intensity from 00 to FF.' },
        { question: 'How do I convert RGB to HEX?', answer: 'RGB values (0–255 for red, green, and blue) are each converted to a 2-digit hexadecimal number and concatenated. This tool does the conversion instantly and keeps every format in sync as you type.' },
        { question: 'What is CMYK and when is it used?', answer: 'CMYK (Cyan, Magenta, Yellow, Key/Black) is a subtractive color model used primarily for print design, while RGB and HEX are used for screens. This tool converts your selected color to CMYK percentages for print-ready output.' },
        { question: 'How accurate is this color converter?', answer: 'All conversions use standard, mathematically precise formulas for RGB, HSL, HSV, CMYK, and HWB color spaces, matching the values used by browsers and design tools like Photoshop and Figma.' },
        { question: 'How does the EyeDropper tool work?', answer: 'Click "Pick Color From Screen" to activate your browser\'s native EyeDropper API, then click anywhere on your screen to sample that exact pixel color. It is supported in Chrome, Edge, and other Chromium-based browsers; unsupported browsers will see a graceful fallback message.' },
        { question: 'Does this tool store or upload my colors?', answer: 'No. Everything runs entirely in your browser — recent colors and favorites are saved only in your browser\'s local storage, and no color data is ever sent to a server.' },
      ],
      relatedTools: [],
      seoTitle: 'Color Picker & Converter — HEX, RGB, HSL, CMYK Converter | ToolifHub',
      seoDescription: 'Pick colors and convert between HEX, RGB, HSL, HSV, CMYK, and HWB formats. Generate palettes, gradients, CSS and Tailwind code, plus accessibility checks — free and instant.',
    },
  ],

  'random-generators': [
    {
      title: 'Random Number Generator', slug: 'random-number-generator', icon: '🎲',
      shortDescription: 'Generate random numbers within any range with custom settings.',
      fullDescription: 'Generate one or multiple random numbers within any specified range. Choose between integers and decimals, set the quantity, and see results instantly.',
      keywords: ['random number generator', 'random number', 'number randomizer', 'dice roller', 'random integer'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'Are the random numbers truly random?', answer: 'Our tool uses the browser\'s built-in crypto.getRandomValues() for cryptographically secure random numbers, which is far more random than Math.random().' },
      ],
      relatedTools: ['uuid-generator', 'password-generator'],
      seoTitle: 'Random Number Generator — Generate Random Numbers Online | ToolifHub',
      seoDescription: 'Generate random numbers within any range instantly. Supports integers and decimals, single or multiple numbers.',
    },
    {
      title: 'Random User Generator', slug: 'random-user-generator', icon: '👤',
      shortDescription: 'Generate realistic random user profiles with names, countries, and email addresses.',
      fullDescription: 'Generate realistic random user profiles — full names, gender, country, email address, username, and UUID — for developers, QA engineers, designers, and anyone needing sample user data. Choose from 14 supported countries or generate an international mix. Everything runs locally, fully offline.',
      keywords: ['random user generator', 'fake user generator', 'random profile generator', 'dummy user generator', 'sample user data', 'random email generator', 'random person generator', 'random user profile', 'mock user generator', 'developer test data', 'qa test data', 'user data generator', 'random identity generator', 'sample database generator', 'free user generator', 'online user generator', 'random name generator', 'generate random users', 'mock data generator', 'ToolifHub'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What is a random user generator used for?', answer: 'Random user generators are used by developers and QA engineers to populate test databases, by designers to mock up UI with realistic data, and by writers or students to create sample profiles — without using real people\'s information.' },
        { question: 'Are the generated emails real?', answer: 'No. Email addresses are generated locally from realistic name-based patterns and sample domains (example.com, mail.com, outlook.com, gmail.com) — they are not verified to exist and nothing is sent to any server.' },
        { question: 'Does this tool generate phone numbers?', answer: 'No, this tool intentionally does not generate phone numbers — only name, gender, country, email, username, and UUID.' },
      ],
      relatedTools: ['uuid-generator', 'random-number-generator'],
      seoTitle: 'Random User Generator – Generate Random Users & Email Addresses Online Free | ToolifHub',
      seoDescription: 'Generate realistic random user profiles with names, countries, and email addresses instantly. Perfect for developers, QA testing, UI design, mock databases, and sample user data.',
    },
  ],

  'social-media-tools': [
    {
      title: 'Instagram Hashtag Generator', slug: 'instagram-hashtag-generator', icon: '📸',
      shortDescription: 'Generate viral Instagram hashtags to boost your post reach.',
      fullDescription: 'Generate relevant, trending Instagram hashtags for any topic or niche. Mix of popular, medium, and niche-specific hashtags for maximum reach. Copy all with one click.',
      keywords: ['instagram hashtags', 'hashtag generator', 'instagram tags', 'instagram seo', 'viral hashtags'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'How many hashtags should I use on Instagram?', answer: 'Instagram allows up to 30 hashtags. Research suggests 5–11 highly relevant hashtags often perform better than using all 30, as Instagram\'s algorithm can flag over-hashtagging as spam.' },
      ],
      relatedTools: ['youtube-hashtag-generator'],
      seoTitle: 'Instagram Hashtag Generator — Get Viral Hashtags | ToolifHub',
      seoDescription: 'Generate trending Instagram hashtags for any topic. Mix of popular and niche hashtags for maximum post reach.',
    },
  ],

  'utility-tools': [
    {
      title: 'QR Code Generator', slug: 'qr-code-generator', icon: '📱',
      shortDescription: 'Generate QR codes for URLs, text, contact info, and more.',
      fullDescription: 'Create customizable QR codes for URLs, plain text, email addresses, phone numbers, and more. Download as PNG or SVG. Customize colors and size.',
      keywords: ['qr code generator', 'qr generator', 'create qr code', 'free qr code', 'qr code maker'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'What can I encode in a QR code?', answer: 'QR codes can encode URLs, plain text, email addresses, phone numbers, SMS messages, Wi-Fi credentials, vCard contact info, and more.' },
      ],
      relatedTools: ['password-generator', 'json-formatter'],
      seoTitle: 'QR Code Generator — Create Free QR Codes Online | ToolifHub',
      seoDescription: 'Generate free QR codes for URLs, text, contacts, and more. Download as PNG or SVG. No registration required.',
    },
  ],

  'government-tools': [
    {
      title: 'GSTIN Validator', slug: 'gstin-validator', icon: '🧾',
      shortDescription: 'Validate any Indian GSTIN, check its checksum, and extract the state code.',
      fullDescription: 'Validate a 15-character Indian GSTIN (GST Identification Number) using the official format rules and checksum algorithm. Instantly see whether the format and checksum are valid, and which state the GSTIN was issued in.',
      keywords: ['gstin validator', 'gst number validator', 'gst number check', 'validate gstin', 'gst checksum'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'What is a GSTIN?', answer: 'GSTIN (Goods and Services Tax Identification Number) is a unique 15-character alphanumeric code assigned to every business registered under GST in India.' },
        { question: 'How is the GSTIN checksum validated?', answer: 'The 15th character of a GSTIN is a checksum digit computed from the first 14 characters using a defined algorithm. This tool recomputes it and compares it to verify validity.' },
        { question: 'Does this tool check GST registration status?', answer: 'This tool validates the GSTIN format and checksum only. Live registration status lookup requires GSTN portal access and is not available via a free public API.' },
      ],
      relatedTools: ['gst-calculator', 'hsn-code-finder'],
      seoTitle: 'GSTIN Validator — Validate GST Number Online | ToolifHub',
      seoDescription: 'Validate any Indian GSTIN format and checksum, and extract the issuing state code. Free GST number validator.',
    },
    {
      title: 'PIN Code Lookup', slug: 'pin-code-lookup', icon: '📮',
      shortDescription: 'Look up Indian PIN codes to find state, district, taluka, and post offices.',
      fullDescription: 'Search any 6-digit Indian postal PIN code to find the associated state, district, taluka (block), and the list of post offices serving that PIN code. Data sourced from India Post.',
      keywords: ['pin code lookup', 'pincode finder', 'postal code india', 'find pin code', 'india post pincode'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'How many digits does an Indian PIN code have?', answer: 'Indian PIN codes (Postal Index Number) are 6 digits long. The first digit represents a postal zone, and the rest narrow down to a specific area.' },
        { question: 'Where does the PIN code data come from?', answer: 'This tool uses the public India Post PIN code data via api.postalpincode.in.' },
      ],
      relatedTools: ['post-office-finder', 'ifsc-code-finder'],
      seoTitle: 'PIN Code Lookup — Find State, District & Post Offices | ToolifHub',
      seoDescription: 'Look up any Indian PIN code to find the state, district, taluka, and post offices serving that area.',
    },
    {
      title: 'Post Office Finder', slug: 'post-office-finder', icon: '🏤',
      shortDescription: 'Find post offices by city, district, or post office name across India.',
      fullDescription: 'Search for Indian post offices by name, city, or district and see all matching post offices along with their PIN code, branch type, and delivery status.',
      keywords: ['post office finder', 'find post office', 'india post office search', 'post office near me', 'post office by city'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'Can I search by city or district name?', answer: 'Yes, you can search by post office name, city, or district and the tool will return all matching post offices with their PIN codes.' },
      ],
      relatedTools: ['pin-code-lookup', 'ifsc-code-finder'],
      seoTitle: 'Post Office Finder — Search India Post Offices | ToolifHub',
      seoDescription: 'Find post offices anywhere in India by name, city, or district. See PIN codes and branch details instantly.',
    },
    {
      title: 'IFSC Code Finder', slug: 'ifsc-code-finder', icon: '🏦',
      shortDescription: 'Look up any Indian bank IFSC code to get the bank, branch, and address.',
      fullDescription: 'Enter an 11-character IFSC code to instantly find the bank name, branch name, full address, city, district, state, and contact details. Useful for verifying bank details before NEFT/RTGS/IMPS transfers.',
      keywords: ['ifsc code finder', 'ifsc code search', 'find ifsc code', 'bank branch finder', 'neft ifsc lookup'],
      featured: true, trending: true, status: 'active',
      faq: [
        { question: 'What is an IFSC code?', answer: 'IFSC (Indian Financial System Code) is an 11-character alphanumeric code that uniquely identifies a bank branch for electronic fund transfers like NEFT, RTGS, and IMPS.' },
        { question: 'Where can I find my IFSC code?', answer: 'Your IFSC code is printed on your bank passbook or cheque book, or you can search by bank and branch name using this tool.' },
      ],
      relatedTools: ['pin-code-lookup', 'post-office-finder'],
      seoTitle: 'IFSC Code Finder — Search Bank Branch IFSC Codes | ToolifHub',
      seoDescription: 'Find the bank, branch, and address for any Indian IFSC code. Free IFSC code lookup for NEFT, RTGS, and IMPS transfers.',
    },
    {
      title: 'Mandi Price Checker', slug: 'mandi-price-checker', icon: '🌾',
      shortDescription: 'Check the latest mandi (market) prices for agricultural commodities across India.',
      fullDescription: 'Search daily mandi (market) prices for agricultural commodities by commodity name, state, and market. Data is sourced from the Government of India\'s open data platform and updated daily.',
      keywords: ['mandi price checker', 'mandi bhav', 'agricultural commodity prices', 'market price india', 'crop price today'],
      featured: true, trending: false, status: 'active',
      faq: [
        { question: 'How often are mandi prices updated?', answer: 'Mandi prices are sourced from the Government of India open data platform (data.gov.in) and are typically updated daily by participating mandis.' },
        { question: 'Can I filter prices by state or market?', answer: 'Yes, you can filter results by commodity, state, and specific market (mandi) name.' },
      ],
      relatedTools: ['gst-calculator'],
      seoTitle: 'Mandi Price Checker — Daily Agricultural Commodity Prices | ToolifHub',
      seoDescription: 'Check the latest mandi prices for crops and commodities across Indian markets, sourced from government open data.',
    },
  ],
  'image-tools': [
    {
      title: 'Image Compressor', slug: 'image-compressor', icon: '🗜️',
      shortDescription: 'Compress JPG, PNG, and WebP images to reduce file size without losing visible quality.',
      fullDescription: 'Drag and drop one or more JPG, PNG, or WebP images and compress them right in your browser. Adjust the quality slider to balance file size against visual fidelity, watch live before/after size comparisons with percentage savings for every file, and download each compressed image individually or all at once. Nothing is uploaded to a server — all compression runs locally using efficient browser-based image processing.',
      keywords: ['image compressor', 'compress image', 'reduce image size', 'jpg compressor', 'png compressor', 'webp compressor', 'shrink image file size'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'Does compressing an image reduce its dimensions?', answer: 'No. The Image Compressor keeps width and height the same — it only reduces file size by optimizing pixel data and re-encoding at the quality level you choose. Use the Image Resizer if you also want to change dimensions.' },
        { question: 'Will my images be uploaded to a server?', answer: 'No. Every compression operation runs entirely inside your browser using JavaScript. Your images never leave your device, which means there is no upload wait time and no privacy concern.' },
        { question: 'What quality setting should I use?', answer: 'For photos shared on the web, 70-85% quality usually gives a strong balance between visible quality and file size. For thumbnails or background images where detail matters less, you can go as low as 40-60%.' },
        { question: 'Can I compress multiple images at once?', answer: 'Yes. Drag and drop or select multiple files and they will all be queued and compressed using the same quality setting. Each file gets its own progress indicator and download button.' },
        { question: 'Which file formats are supported?', answer: 'JPG, PNG, and WebP images are all supported as input. The compressor preserves the original format while reducing file size.' },
        { question: 'Why didn\'t my PNG shrink as much as my JPG?', answer: 'PNG is a lossless format, so compression gains mostly come from re-encoding and color optimization rather than quality reduction. JPG and WebP support true lossy compression, so they typically see larger size reductions.' },
        { question: 'Is there a file size or count limit?', answer: 'There\'s no hard limit enforced by the tool, but very large images or large batches may take longer to process since everything runs on your device\'s CPU.' },
        { question: 'Can I download all compressed images in one click?', answer: 'Yes, once your files are compressed, use the "Download All" button to save them sequentially without having to click each one individually.' },
      ],
      relatedTools: ['png-to-jpg', 'jpg-to-png', 'image-optimizer', 'image-resizer'],
      seoTitle: 'Image Compressor — Compress JPG, PNG & WebP Online Free | ToolifHub',
      seoDescription: 'Compress JPG, PNG, and WebP images online for free. Reduce file size with a quality slider, live before/after comparison, and batch download — all in your browser.',
      seoContent: {
        overview: 'Large image files slow down websites, fill up storage, and make emails and uploads frustrating. The Image Compressor solves this by shrinking JPG, PNG, and WebP files directly in your browser, with no software to install and no files ever leaving your device. Whether you\'re preparing product photos for an online store, optimizing a blog\'s hero images, or just trying to fit a photo under an upload size limit, this tool gives you precise control over the size-versus-quality tradeoff.\n\nUnlike many online compressors that route your images through a remote server (introducing upload time and privacy concerns), this tool uses client-side JavaScript compression so processing starts instantly and your photos are never transmitted anywhere. You can compress one image or an entire batch in a single pass, watching real-time progress and the resulting size reduction for each file.\n\nThe quality slider gives you fine-grained control: drag it down for maximum savings when quality is less critical, or keep it high when you need the image to look crisp on a high-resolution display. A live before/after size comparison with a percentage-reduction badge makes it easy to see exactly how much space you\'re saving before you commit to downloading.\n\nBecause everything happens locally, there\'s no daily usage cap, no watermarking, and no account required. It is built to be the fastest way to get web-ready images without a round trip to a desktop editor.',
        features: [
          'Drag-and-drop or click-to-browse upload supporting JPG, PNG, and WebP',
          'Batch processing of multiple images in a single session',
          'Adjustable quality slider from 10% to 100%',
          'Live before/after file size comparison with percentage reduction badges',
          'Per-file progress indicators during compression',
          'Individual download buttons plus a one-click "Download All"',
          'Thumbnail previews so you can confirm which file is which',
          '100% client-side processing — no uploads, no server round trip',
        ],
        benefits: [
          'Faster website load times from smaller image payloads',
          'Easily meet email attachment or upload size limits',
          'Save storage space across devices and cloud drives',
          'No privacy risk since images never leave your browser',
          'No software installation or account sign-up required',
        ],
        howToUse: [
          'Drag your image(s) into the upload area, or click to browse and select files',
          'Adjust the compression quality slider to your desired balance of size and clarity',
          'Watch each file compress with a live progress bar and resulting size shown',
          'Review the before/after size and percentage reduction for every image',
          'Download files individually, or click "Download All" to save the whole batch',
        ],
        useCases: [
          { title: 'E-commerce product photos', description: 'Shrink high-resolution product shots so store pages load quickly without sacrificing visible detail.' },
          { title: 'Blog and content images', description: 'Compress hero images and inline screenshots to improve Core Web Vitals and page speed scores.' },
          { title: 'Email attachments', description: 'Reduce photo sizes so they fit within email provider attachment limits.' },
          { title: 'Portfolio and gallery uploads', description: 'Prepare batches of photos for faster uploads to portfolio sites or social platforms.' },
        ],
      },
    },
    {
      title: 'PNG to JPG Converter', slug: 'png-to-jpg', icon: '🔄',
      shortDescription: 'Convert PNG images to JPG format with a custom background color for transparency.',
      fullDescription: 'Convert PNG files to JPG directly in your browser. Since JPG doesn\'t support transparency, choose a background color to fill any transparent areas before conversion, adjust the output quality, and convert multiple files at once with instant previews and downloads.',
      keywords: ['png to jpg', 'png to jpg converter', 'convert png to jpeg', 'png to jpeg online', 'image format converter'],
      featured: true, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'What happens to transparent areas when converting PNG to JPG?', answer: 'JPG does not support transparency, so any transparent pixels in your PNG are filled with the background color you choose before conversion — white by default, but you can pick any color.' },
        { question: 'Will converting to JPG reduce image quality?', answer: 'JPG uses lossy compression, so there can be a small quality loss, especially at lower quality settings. Using a quality setting of 85% or higher typically preserves visual quality very well.' },
        { question: 'Can I convert multiple PNG files at once?', answer: 'Yes, you can drag and drop multiple PNG files and they\'ll all be converted using the same quality and background color settings, with individual download buttons.' },
        { question: 'Why would I convert PNG to JPG?', answer: 'JPG files are usually much smaller than PNG for photographic images, making them better for web pages, email attachments, and storage efficiency when transparency isn\'t needed.' },
        { question: 'Does this tool change the image resolution?', answer: 'No, the output JPG keeps the same pixel dimensions as your original PNG. Use the Image Resizer separately if you also want to change dimensions.' },
        { question: 'Can I pick any background color?', answer: 'Yes, use the color picker to choose any solid background color to fill transparent regions, not just white.' },
        { question: 'Is my image uploaded anywhere during conversion?', answer: 'No. Conversion happens entirely in your browser using the HTML canvas API — your files are never sent to a server.' },
        { question: 'What quality setting is recommended?', answer: 'For most photos, 80-95% quality gives excellent results with reasonable file size. Lower settings save more space but can introduce visible compression artifacts.' },
      ],
      relatedTools: ['jpg-to-png', 'webp-converter', 'image-compressor'],
      seoTitle: 'PNG to JPG Converter — Free Online Image Converter | ToolifHub',
      seoDescription: 'Convert PNG to JPG online for free. Choose a background color for transparency, adjust quality, and batch convert — all processed locally in your browser.',
      seoContent: {
        overview: 'PNG is great for graphics with transparency and sharp edges, but it often produces larger files than necessary for photographic content, and many platforms or print workflows specifically require JPG. The PNG to JPG Converter handles this transition cleanly, drawing your PNG onto a canvas with a background color of your choice to correctly handle any transparent pixels before re-encoding as a JPG.\n\nBecause JPG has no concept of an alpha channel, simply changing a file extension from .png to .jpg would corrupt transparent areas or fail outright. This tool does the conversion properly: it paints a solid background behind your image first, ensuring transparent regions become a clean, intentional color rather than black or a strange artifact.\n\nYou get full control over both the background color (via a standard color picker, defaulting to white) and the JPG output quality, so you can fine-tune the result for your specific use case — whether that\'s minimizing file size for a web upload or preserving maximum fidelity for print.\n\nThe tool supports converting several PNGs in one batch, each with live thumbnail previews, so you can visually confirm the conversion before downloading. All processing happens locally via your browser\'s canvas API, meaning conversions are instant and your images are never transmitted to any server.',
        features: [
          'Batch PNG to JPG conversion with thumbnail previews',
          'Customizable background color picker for transparent areas',
          'Adjustable JPG output quality slider',
          'Canvas-based conversion that preserves original resolution',
          'Individual and bulk download options',
          'Instant client-side processing with no file uploads',
          'Visual before/after preview of the converted file',
        ],
        benefits: [
          'Smaller file sizes for photographic PNG images',
          'Compatibility with platforms that require JPG format',
          'Full control over how transparency is handled',
          'No quality surprises thanks to a live quality slider',
          'Completely private — no server uploads involved',
        ],
        howToUse: [
          'Drag and drop your PNG file(s) into the upload zone',
          'Pick a background color to replace any transparent pixels',
          'Adjust the JPG quality slider to your preference',
          'Review the converted preview and resulting file size',
          'Download the converted JPG file or all files at once',
        ],
        useCases: [
          { title: 'Removing transparency for legacy systems', description: 'Convert transparent PNG logos or graphics into JPGs for platforms that don\'t support alpha channels.' },
          { title: 'Reducing storage for photo PNGs', description: 'Shrink photographic PNG screenshots into much smaller JPGs without significant visible quality loss.' },
          { title: 'Print and document preparation', description: 'Convert PNG assets to JPG when a print workflow or document template requires that format.' },
          { title: 'Email and upload compatibility', description: 'Convert to JPG when a form, CMS, or email client only accepts JPG image uploads.' },
        ],
      },
    },
    {
      title: 'JPG to PNG Converter', slug: 'jpg-to-png', icon: '🔁',
      shortDescription: 'Convert JPG/JPEG images to lossless PNG format while preserving resolution.',
      fullDescription: 'Convert JPG or JPEG images to PNG format directly in your browser. The conversion preserves the original resolution and produces a lossless PNG output, ideal for further editing or when you need an image format that supports transparency for future edits.',
      keywords: ['jpg to png', 'jpeg to png converter', 'convert jpg to png online', 'jpg to png free', 'image converter'],
      featured: false, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'Will converting JPG to PNG improve image quality?', answer: 'No. PNG is lossless going forward, but it cannot restore detail already lost during the original JPG compression. The conversion simply re-encodes the existing pixel data without further lossy compression.' },
        { question: 'Why convert JPG to PNG at all?', answer: 'PNG is useful when you need a format that supports transparency for future edits, want lossless re-saving during an editing workflow, or need compatibility with tools that require PNG input.' },
        { question: 'Will the output PNG have a transparent background?', answer: 'No. JPG images don\'t have transparency information, so the converted PNG will have the same fully opaque background as the original JPG.' },
        { question: 'Does this tool resize my image?', answer: 'No, the converter preserves the exact original pixel dimensions of your JPG. Use the Image Resizer if you also need to change the size.' },
        { question: 'Can I convert several JPGs in one batch?', answer: 'Yes, drag and drop multiple JPG files and each will be converted to PNG independently with its own preview and download button.' },
        { question: 'Will the PNG file be larger than the original JPG?', answer: 'Usually yes, since PNG is lossless and JPG uses lossy compression. Expect the PNG file size to be noticeably larger, especially for photographic images.' },
        { question: 'Is this conversion done on a server?', answer: 'No, everything happens locally in your browser using the canvas API, so your images are never uploaded anywhere.' },
        { question: 'What image formats can I upload?', answer: 'This tool accepts standard JPG and JPEG files as input and always outputs PNG.' },
      ],
      relatedTools: ['png-to-jpg', 'webp-converter', 'image-compressor'],
      seoTitle: 'JPG to PNG Converter — Free Online Lossless Converter | ToolifHub',
      seoDescription: 'Convert JPG or JPEG images to PNG for free, preserving resolution with lossless output. Fast, private, browser-based conversion with no uploads.',
      seoContent: {
        overview: 'While JPG is excellent for compact photo storage, certain workflows call for PNG instead — particularly when you need a lossless format for further editing, or compatibility with software and design tools that expect PNG input. The JPG to PNG Converter performs this transformation entirely within your browser, drawing the original JPG onto a canvas and exporting it as a PNG without any additional lossy re-compression.\n\nThe output preserves your image\'s exact resolution, so nothing is upscaled, downscaled, or cropped during conversion. This makes the tool a reliable first step before further image editing, layering, or annotation work where a lossless intermediate format is preferred.\n\nBatch support means you can convert several JPG files in one pass, each with a live thumbnail so you can verify the right files were selected. As with all the tools in this suite, conversion happens locally in your browser using the HTML canvas API — no images are ever uploaded to a remote server, keeping your files completely private.\n\nKeep in mind that converting from JPG to PNG cannot recover detail already lost to JPG\'s lossy compression; it simply stops further lossy re-encoding going forward and gives you a format more suitable for subsequent editing steps.',
        features: [
          'Batch JPG/JPEG to PNG conversion',
          'Lossless PNG output with no further compression artifacts',
          'Preserves exact original image resolution',
          'Thumbnail previews for each queued file',
          'Individual and bulk download support',
          'Entirely client-side — no server uploads',
        ],
        benefits: [
          'A clean, lossless format for further image editing',
          'Better compatibility with tools that require PNG',
          'No quality degradation introduced by the conversion itself',
          'Fast, private processing with zero file uploads',
          'No installation or account required',
        ],
        howToUse: [
          'Drag and drop or browse to select your JPG/JPEG file(s)',
          'Wait for the automatic conversion to PNG to complete',
          'Preview the converted image thumbnail and file size',
          'Download the PNG file individually or download all at once',
        ],
        useCases: [
          { title: 'Preparing images for design software', description: 'Convert JPG photos to PNG before importing into design tools that prefer lossless formats.' },
          { title: 'Avoiding repeated JPG compression', description: 'Use PNG as an intermediate format during multi-step editing to prevent cumulative quality loss.' },
          { title: 'CMS or platform requirements', description: 'Meet upload requirements for systems that only accept PNG image files.' },
          { title: 'Archiving important photos', description: 'Store a lossless PNG copy of a JPG photo before performing further edits.' },
        ],
      },
    },
    {
      title: 'WebP Converter', slug: 'webp-converter', icon: '🌐',
      shortDescription: 'Convert images between WebP, JPG, and PNG formats in any direction.',
      fullDescription: 'A flexible, bidirectional image format converter that handles WebP, JPG, and PNG conversions in any direction. Pick your target format, adjust quality for lossy outputs, choose a background color when converting transparent images to JPG, and convert files in batches — all locally in your browser.',
      keywords: ['webp converter', 'webp to jpg', 'webp to png', 'jpg to webp', 'png to webp', 'convert webp online'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'What formats can I convert to and from?', answer: 'You can upload WebP, JPG, or PNG images and convert to any of WebP, JPG, or PNG as the target output format.' },
        { question: 'Why would I convert an image to WebP?', answer: 'WebP typically produces smaller file sizes than JPG or PNG at similar visual quality, making it a great choice for fast-loading websites, provided your target platform supports it.' },
        { question: 'Why would I convert WebP to JPG or PNG?', answer: 'Some older browsers, email clients, design tools, or social platforms don\'t fully support WebP, so converting to a more universally supported format like JPG or PNG ensures compatibility.' },
        { question: 'What happens to transparency when converting to JPG?', answer: 'Since JPG doesn\'t support transparency, any transparent areas in a WebP or PNG source are filled with a background color you choose before the JPG is created.' },
        { question: 'Is converting to PNG lossless?', answer: 'Yes, PNG output is always lossless — the quality slider only applies when converting to WebP or JPG.' },
        { question: 'Can I batch convert several files at once?', answer: 'Yes, upload multiple files and they will all be converted to your chosen target format using the same settings.' },
        { question: 'Does the browser support WebP natively for this conversion?', answer: 'Yes, modern browsers can both decode and encode WebP using the canvas API, which is what powers this tool entirely client-side.' },
        { question: 'Are my files uploaded to a server during conversion?', answer: 'No, all conversions happen locally in your browser. Your images are never transmitted anywhere.' },
        { question: 'Will the output have the same dimensions as the input?', answer: 'Yes, this tool only changes the file format and encoding, not the pixel dimensions.' },
      ],
      relatedTools: ['png-to-jpg', 'jpg-to-png', 'image-compressor', 'image-optimizer'],
      seoTitle: 'WebP Converter — Convert WebP, JPG & PNG Online Free | ToolifHub',
      seoDescription: 'Convert images between WebP, JPG, and PNG in any direction for free. Adjust quality, handle transparency, and batch convert — all in your browser.',
      seoContent: {
        overview: 'WebP has become the modern web\'s preferred image format thanks to its excellent compression efficiency, but compatibility gaps still exist with certain older tools, email clients, and design software. The WebP Converter is built to handle both directions of this problem: converting legacy JPG or PNG files into efficient WebP, and converting WebP back into more universally compatible JPG or PNG when needed.\n\nThe tool automatically detects your uploaded file\'s type and lets you choose any target format from a simple selector. When converting an image with transparency to JPG (which has no alpha channel), the tool walks you through choosing a background color so the result looks intentional rather than broken. Quality controls apply to lossy targets (WebP and JPG), while PNG output is always lossless.\n\nUnder the hood, conversion uses the HTML canvas element\'s native encoding support, which modern browsers handle for WebP just as reliably as for JPG and PNG. This means conversions are instant, accurate, and entirely private — nothing is sent to a server at any point.\n\nBatch support lets you process several images of mixed formats in a single session, each converted independently to your chosen target format, with live previews and individual or bulk downloads.',
        features: [
          'Bidirectional conversion: WebP ⇄ JPG ⇄ PNG',
          'Automatic detection of uploaded image type',
          'Adjustable quality slider for WebP and JPG outputs',
          'Background color picker for transparency when targeting JPG',
          'Lossless PNG output option',
          'Batch processing of multiple mixed-format files',
          'Live thumbnail previews of converted results',
          'Fully client-side — no uploads, no waiting on a server',
        ],
        benefits: [
          'Smaller file sizes by converting to WebP for modern websites',
          'Restored compatibility by converting WebP to JPG/PNG when needed',
          'One tool covers every common conversion direction',
          'Full control over quality and transparency handling',
          'Completely private with zero server-side processing',
        ],
        howToUse: [
          'Drag and drop or select your WebP, JPG, or PNG image(s)',
          'Choose your target output format from the format selector',
          'Adjust the quality slider if converting to WebP or JPG',
          'Pick a background color if converting a transparent image to JPG',
          'Review the converted preview and download individually or in bulk',
        ],
        useCases: [
          { title: 'Modernizing a website\'s images', description: 'Convert legacy JPG and PNG assets to WebP for faster page loads on supporting browsers.' },
          { title: 'Fixing compatibility issues', description: 'Convert WebP images to JPG or PNG when a platform, email client, or design tool can\'t open WebP files.' },
          { title: 'Mixed-format batch cleanup', description: 'Normalize a folder of images with mixed formats into a single consistent target format.' },
          { title: 'Email and document attachments', description: 'Convert WebP photos to JPG before attaching them to emails or documents that don\'t render WebP.' },
        ],
      },
    },
    {
      title: 'Image Resizer', slug: 'image-resizer', icon: '📐',
      shortDescription: 'Resize images to exact dimensions or by percentage, with common social media presets.',
      fullDescription: 'Resize any image to specific pixel dimensions, scale it by a percentage, or apply one of several common presets like 1920×1080, Instagram Square, or Open Graph image size. Maintain aspect ratio automatically or set custom width and height independently — all processed locally in your browser.',
      keywords: ['image resizer', 'resize image online', 'resize photo', 'image dimensions changer', 'resize image for instagram', 'og image resizer'],
      featured: true, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How do I resize an image to an exact size?', answer: 'Switch to "By Dimensions" mode, then type your desired width and height in pixels. If "Maintain aspect ratio" is enabled, the other dimension updates automatically to match the original proportions.' },
        { question: 'Can I resize by a percentage instead of exact pixels?', answer: 'Yes, switch to "By Percentage" mode and use the slider to scale the image up or down relative to its original size.' },
        { question: 'What are the preset sizes for?', answer: 'Presets like 1920×1080, 1280×720, 1080×1080 (Instagram Square), and 1200×630 (Open Graph image) instantly apply common dimensions used across social media, video thumbnails, and website link previews.' },
        { question: 'Does resizing reduce image quality?', answer: 'Resizing down generally preserves quality well. Resizing up (enlarging) beyond the original resolution can introduce some softness since new pixels are interpolated rather than captured.' },
        { question: 'What happens if I uncheck "maintain aspect ratio"?', answer: 'You can then set width and height independently, which may stretch or squash the image if the new ratio doesn\'t match the original.' },
        { question: 'What file formats are supported for resizing?', answer: 'You can upload most common image formats; the resized output is saved as PNG if the original was PNG, or JPG otherwise.' },
        { question: 'Is there a maximum size limit?', answer: 'There\'s no hardcoded limit, but extremely large target dimensions may take longer to render since resizing happens using your device\'s processing power.' },
        { question: 'Are my images uploaded to a server?', answer: 'No, resizing is done entirely client-side using the HTML canvas API, so your images never leave your browser.' },
      ],
      relatedTools: ['image-cropper', 'image-compressor', 'image-optimizer'],
      seoTitle: 'Image Resizer — Resize Images Online Free (Pixels or %) | ToolifHub',
      seoDescription: 'Resize images online for free by exact dimensions or percentage. Includes presets for Instagram, OG images, and HD video. Fast, private, browser-based.',
      seoContent: {
        overview: 'Different platforms expect different image dimensions — a YouTube thumbnail, an Instagram post, and an Open Graph social preview image all have distinct ideal sizes. The Image Resizer gives you precise control to hit these targets without opening a heavyweight desktop editor. Set an exact pixel width and height, scale proportionally by percentage, or click one of the built-in presets for instant results.\n\nThe aspect ratio lock makes everyday resizing painless: change the width and the height adjusts automatically to keep your image looking correct, with no manual math required. When you do need independent control — say, to force a square crop-like resize for a specific layout — simply turn off aspect ratio locking and set both values directly.\n\nFor situations where you just need to make an image "a bit smaller" or "twice as big" without worrying about exact numbers, percentage mode lets you scale relative to the original size using a simple slider, with the resulting pixel dimensions shown live as you adjust.\n\nBuilt-in presets cover the most commonly requested sizes: 1920×1080 and 1280×720 for HD video and screenshots, 1080×1080 for Instagram\'s square format, 1200×630 for Open Graph link previews, and 800×600 for general-purpose use. All resizing happens instantly using your browser\'s canvas rendering, with results downloadable immediately — no server round trip involved.',
        features: [
          'Resize by exact width and height in pixels',
          'Resize by percentage with a live slider',
          'Aspect ratio lock toggle for proportional resizing',
          'One-click presets for HD, Instagram Square, and OG Image sizes',
          'Live preview of resulting dimensions before resizing',
          'Canvas-based resizing that runs entirely in your browser',
          'Instant download of the resized result',
        ],
        benefits: [
          'Hit exact platform-required dimensions in seconds',
          'No guesswork with aspect-ratio-locked resizing',
          'Common presets eliminate manual dimension lookup',
          'No software installation or account required',
          'Completely private — no images are uploaded',
        ],
        howToUse: [
          'Upload the image you want to resize',
          'Choose "By Dimensions" or "By Percentage" mode',
          'Enter custom width/height, drag the percentage slider, or click a preset',
          'Toggle "Maintain aspect ratio" on or off depending on your needs',
          'Click "Resize Image" and download the result',
        ],
        useCases: [
          { title: 'Social media post sizing', description: 'Resize a photo to 1080×1080 for a perfectly cropped Instagram square post.' },
          { title: 'Open Graph preview images', description: 'Create a 1200×630 image so your page looks great when shared on Facebook, LinkedIn, or Slack.' },
          { title: 'Video thumbnail prep', description: 'Resize artwork to 1920×1080 or 1280×720 for YouTube or streaming thumbnails.' },
          { title: 'Reducing oversized uploads', description: 'Scale down a high-resolution camera photo by percentage before uploading it to a form with size limits.' },
        ],
      },
    },
    {
      title: 'Image Cropper', slug: 'image-cropper', icon: '✂️',
      shortDescription: 'Crop, rotate, zoom, and create circular crops of any image with precise drag controls.',
      fullDescription: 'An interactive image cropping tool with a draggable, resizable crop box, common aspect ratio presets (1:1, 4:3, 16:9, 9:16, or free-form), a circle crop mode, zoom slider, and rotation controls including 90° quick-rotate buttons and a free-rotate slider. Export your crop directly to a downloadable file, all processed locally in your browser.',
      keywords: ['image cropper', 'crop image online', 'circle crop tool', 'crop photo free', 'aspect ratio cropper', 'rotate and crop image'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How do I move or resize the crop box?', answer: 'Click and drag anywhere inside the crop box to move it. Drag any of the four corner handles to resize it, and the box will respect your selected aspect ratio if one is set.' },
        { question: 'What aspect ratio options are available?', answer: 'You can choose Free (any shape), 1:1 (square), 4:3, 16:9 (widescreen), or 9:16 (portrait/stories format).' },
        { question: 'How does the circle crop work?', answer: 'Toggle "Circle crop" on and your final exported image will be clipped into a circle inscribed within your crop box selection — perfect for profile pictures and avatars.' },
        { question: 'Can I rotate the image before cropping?', answer: 'Yes, use the 90° rotate buttons for quick quarter-turns, or the free-rotate slider for any angle between 0 and 359 degrees.' },
        { question: 'What does the zoom slider do?', answer: 'It zooms the source image within the crop stage, letting you crop in tighter on a specific area without needing to shrink the crop box itself.' },
        { question: 'What format is the final cropped file?', answer: 'If circle crop is enabled, or your original was a PNG, the export is a transparent PNG. Otherwise it exports as a JPG.' },
        { question: 'Is the crop tool accurate for high-resolution images?', answer: 'Yes, the crop coordinates are mapped back to your image\'s full original resolution, so the exported crop is rendered at full quality, not just the screen preview size.' },
        { question: 'Does cropping happen on a server?', answer: 'No, all cropping, rotation, and zoom math happens locally using the HTML canvas API in your browser. Your image is never uploaded.' },
      ],
      relatedTools: ['remove-background', 'image-resizer', 'png-to-jpg'],
      seoTitle: 'Image Cropper — Crop, Rotate & Circle Crop Online Free | ToolifHub',
      seoDescription: 'Crop images online for free with draggable crop box, aspect ratio presets, circle crop, zoom, and rotation. Fast, private, browser-based cropping.',
      seoContent: {
        overview: 'Cropping is one of the most common image edits, yet many free online croppers feel clunky or limited. The Image Cropper is built around a smooth, draggable crop box with proper corner-handle resizing, so you can select exactly the region you want with precision similar to a desktop editor — directly in your browser.\n\nAspect ratio presets make common crops effortless: lock to 1:1 for a perfect square profile picture, 16:9 for a widescreen thumbnail, 9:16 for vertical stories and reels, or 4:3 for traditional photo framing. Free mode removes all constraints when you need full creative control over the crop shape.\n\nBeyond basic rectangular crops, the tool includes a dedicated circle crop mode, ideal for avatars and profile photos, which clips your selection into a perfect circle on export. Combined with a zoom slider to get closer to fine details and rotation controls — both quick 90-degree steps and a free-rotate slider for any angle — you have a complete set of adjustments before finalizing your crop.\n\nAll of the math for mapping your on-screen crop selection back to the image\'s full native resolution happens automatically, so your final exported file is rendered at full quality rather than a downscaled preview. As with the rest of this tool suite, everything runs locally via the canvas API; no image data is ever sent to a server.',
        features: [
          'Draggable, resizable crop box with corner handles',
          'Aspect ratio presets: Free, 1:1, 4:3, 16:9, 9:16',
          'Circle crop mode for avatars and profile pictures',
          'Zoom slider to crop in tighter on image details',
          'Quick 90° rotate buttons plus a free-rotate slider',
          'Full-resolution export regardless of on-screen preview size',
          'One-click "Crop & Download" export',
          'Entirely client-side processing with no uploads',
        ],
        benefits: [
          'Precise, desktop-editor-like cropping in the browser',
          'Built-in presets remove the need to calculate ratios manually',
          'Perfect circular avatars without extra software',
          'Rotate and crop in a single streamlined workflow',
          'Private — your photos are never uploaded anywhere',
        ],
        howToUse: [
          'Upload the image you want to crop',
          'Choose an aspect ratio preset, or leave it free-form',
          'Drag the crop box into position and resize using the corner handles',
          'Optionally zoom in, rotate, or enable circle crop',
          'Click "Crop & Download" to save your final cropped image',
        ],
        useCases: [
          { title: 'Profile picture avatars', description: 'Use circle crop with a 1:1 ratio to create a perfectly round profile photo for social platforms.' },
          { title: 'Story and reel formatting', description: 'Crop a photo to a 9:16 ratio for Instagram Stories, Reels, or TikTok-style vertical content.' },
          { title: 'Removing unwanted background', description: 'Tighten the crop box around just the subject of a photo to remove distracting surroundings.' },
          { title: 'Straightening tilted photos', description: 'Use the free-rotate slider to level a slightly tilted photo before applying the final crop.' },
        ],
      },
    },
    {
      title: 'Remove Background', slug: 'remove-background', icon: '🪄',
      shortDescription: 'Automatically remove the background from any photo using on-device AI.',
      fullDescription: 'Upload a photo and automatically remove its background using an AI model that runs entirely inside your browser via WebAssembly — no images are ever uploaded to a server. View a side-by-side before/after comparison with a transparent checkerboard background, then download the result as a transparent PNG.',
      keywords: ['remove background from image', 'background remover', 'transparent background tool', 'ai background removal', 'cut out image background'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How does background removal work without uploading my photo?', answer: 'The tool uses an AI segmentation model that runs locally in your browser using WebAssembly. Your image is processed entirely on your device — it\'s never sent to any server.' },
        { question: 'What browsers support this tool?', answer: 'You need a modern browser with WebAssembly and SharedArrayBuffer support, such as a recent version of Chrome, Edge, or Firefox. If unsupported, the tool will clearly tell you instead of failing silently.' },
        { question: 'What format is the result saved as?', answer: 'The output is always a transparent PNG, since PNG is the only common format that supports an alpha (transparency) channel.' },
        { question: 'Why does processing take a little while?', answer: 'The AI model needs to download (the first time) and run inference locally on your device, which can take a few seconds to a minute depending on your hardware and image size.' },
        { question: 'Does it work well on all types of photos?', answer: 'It works best on photos with a clear subject like a person, product, or animal against a reasonably distinct background. Very busy or low-contrast scenes may produce a less clean cutout.' },
        { question: 'Can I see progress while it processes?', answer: 'Yes, a progress bar shows real-time status as the model downloads and processes your image.' },
        { question: 'Is there a file size limit?', answer: 'Very large images may take longer to process since everything runs on your device. For best performance, typical photo resolutions work well.' },
        { question: 'Can I undo or try again with a different photo?', answer: 'Yes, use the Reset button to clear the current image and upload a new one.' },
      ],
      relatedTools: ['image-cropper', 'png-to-jpg', 'image-resizer'],
      seoTitle: 'Remove Background from Image — Free AI Tool, No Upload | ToolifHub',
      seoDescription: 'Remove the background from any photo for free using on-device AI. No uploads — processing runs entirely in your browser. Download as a transparent PNG.',
      seoContent: {
        overview: 'Removing a background traditionally meant careful manual selection in a photo editor, or uploading your photo to a third-party service and hoping they handle your data responsibly. This tool takes a different approach: it runs a genuine AI segmentation model directly inside your browser using WebAssembly, meaning your photo is analyzed and the background removed without ever being transmitted to a server.\n\nWhen you upload an image, the tool first checks that your browser supports the necessary WebAssembly and SharedArrayBuffer features. If it doesn\'t — which can happen in some privacy-focused browser configurations or older browsers — you\'ll see a clear explanation rather than a confusing failure.\n\nOnce processing starts, you\'ll see a live progress bar as the AI model works through your image. The result is displayed side-by-side with your original: the original photo on the left, and the background-removed result on the right, shown over a checkerboard pattern so you can clearly see which areas are now transparent.\n\nThe final output is always a transparent PNG, ready to drop onto any new background, use as a sticker-style cutout, or place into a design project. Because the heavy lifting happens entirely on your device, there\'s no per-image cost, no rate limit tied to a paid API, and no concern about your photos being stored or analyzed by a third party.',
        features: [
          'On-device AI background removal via WebAssembly',
          'No image uploads — 100% local processing',
          'Clear browser-compatibility detection with graceful fallback messaging',
          'Real-time progress bar during processing',
          'Side-by-side before/after comparison over a checkerboard backdrop',
          'Transparent PNG export ready for any new background',
          'One-click reset to process another photo',
        ],
        benefits: [
          'Complete privacy — your photos never leave your device',
          'No usage limits tied to a third-party API',
          'Professional-looking cutouts without manual selection tools',
          'Works for product photos, portraits, and more',
          'Free to use with no account or subscription required',
        ],
        howToUse: [
          'Upload a photo with a clear subject',
          'Wait for the on-device AI model to process the image, tracked by a progress bar',
          'Compare the original and the background-removed result side-by-side',
          'Download the result as a transparent PNG',
          'Click Reset to process another image if needed',
        ],
        useCases: [
          { title: 'E-commerce product cutouts', description: 'Remove backgrounds from product photos to create clean, consistent catalog images.' },
          { title: 'Profile picture editing', description: 'Cut out a portrait subject to place on a new background or solid color.' },
          { title: 'Design and collage work', description: 'Extract subjects from photos to combine into graphics, posters, or social media designs.' },
          { title: 'Sticker-style image creation', description: 'Create transparent PNG cutouts for use as overlay stickers or watermark-free graphics.' },
        ],
      },
    },
    {
      title: 'Image Metadata Viewer', slug: 'image-metadata-viewer', icon: '🔍',
      shortDescription: 'View EXIF, IPTC, XMP, and GPS metadata embedded in any photo.',
      fullDescription: 'Inspect the hidden metadata embedded in your photos, including camera make and model, lens, exposure settings, ISO, focal length, color profile, and GPS location if present. View results in an organized, readable layout, then copy the data as JSON or download it as a file.',
      keywords: ['image metadata viewer', 'exif viewer', 'photo metadata checker', 'view exif data online', 'gps location in photo', 'check image metadata'],
      featured: false, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'What metadata can this tool read?', answer: 'It reads EXIF (camera and capture settings), IPTC (descriptive/copyright info), XMP (Adobe and other software metadata), ICC color profile data, and GPS location data if embedded in the file.' },
        { question: 'Why doesn\'t my photo show any camera information?', answer: 'Many images have their metadata stripped by messaging apps, social media platforms, or screenshot tools before you download them, so there may simply be nothing left to read.' },
        { question: 'Will this tool show my photo\'s exact location?', answer: 'Only if GPS coordinates are embedded in the file\'s metadata. If present, you\'ll see the coordinates along with a "View on map" link to open the location in Google Maps.' },
        { question: 'Can I export the metadata?', answer: 'Yes, use "Copy metadata as JSON" to copy it to your clipboard, or "Download as JSON" to save it as a file.' },
        { question: 'Is my photo uploaded anywhere to read its metadata?', answer: 'No, metadata extraction happens entirely client-side in your browser using a JavaScript parsing library. Your photo is never uploaded.' },
        { question: 'What does ISO, aperture, and focal length tell me?', answer: 'These are camera exposure settings recorded at the moment the photo was taken — ISO reflects sensor sensitivity, aperture (f-number) reflects how much light the lens let in, and focal length describes the lens zoom level used.' },
        { question: 'Can I check metadata for screenshots?', answer: 'Yes, but screenshots typically contain little to no EXIF data since they aren\'t captured by a camera sensor.' },
        { question: 'Does this tool modify my photo?', answer: 'No, this is a read-only viewer. It does not alter your original file in any way. Use the Remove EXIF Data tool if you want to strip metadata.' },
      ],
      relatedTools: ['remove-exif', 'image-compressor'],
      seoTitle: 'Image Metadata Viewer — View EXIF & GPS Data Online Free | ToolifHub',
      seoDescription: 'View EXIF, IPTC, XMP, and GPS metadata hidden in any photo for free. See camera settings and location data, then export as JSON. All processed locally.',
      seoContent: {
        overview: 'Every photo taken with a digital camera or smartphone typically carries hidden metadata describing how and where it was captured. The Image Metadata Viewer extracts and presents this information in a clean, organized layout, covering EXIF camera settings, IPTC descriptive fields, XMP software metadata, embedded color profile details, and GPS location data when present.\n\nUpload any photo and the tool immediately surfaces useful technical details: the camera make and model, lens used, exposure time, ISO sensitivity, aperture, and focal length — everything a photographer might want to review about how a shot was taken. Basic file information like dimensions, format, and file size rounds out the picture.\n\nIf GPS coordinates are embedded in the file (common with many smartphone photos unless location services were disabled), the tool displays the exact latitude and longitude along with a direct "View on map" link that opens the location in Google Maps. This same GPS exposure is also a useful privacy check — many people don\'t realize their photos contain their exact capture location until they see it laid out clearly.\n\nFor anyone who needs to document or archive this information, the full metadata set can be copied to the clipboard as JSON or downloaded as a standalone JSON file. As with every tool in this suite, all extraction happens locally in your browser using a dedicated metadata-parsing library — your photo is never uploaded anywhere.',
        features: [
          'Reads EXIF, IPTC, XMP, ICC color profile, and GPS metadata',
          'Displays camera make, model, lens, exposure, ISO, and focal length',
          'Shows basic file info: dimensions, format, size, and resolution',
          'GPS coordinates with a direct "View on map" link when available',
          'Copy metadata to clipboard as JSON',
          'Download full metadata as a JSON file',
          'Entirely client-side parsing — no image uploads',
        ],
        benefits: [
          'Understand exactly how and with what settings a photo was taken',
          'Quickly check whether a photo reveals its capture location',
          'Useful for photographers reviewing shooting settings',
          'Easy export for documentation or technical records',
          'No privacy risk since photos are never uploaded',
        ],
        howToUse: [
          'Upload the photo whose metadata you want to inspect',
          'Review the organized display of file info, camera details, and GPS data',
          'Click the map link if GPS coordinates are present and you want to see the location',
          'Use "Copy metadata as JSON" or "Download as JSON" to export the data',
        ],
        useCases: [
          { title: 'Photography settings review', description: 'Check the exact ISO, aperture, and shutter speed used for a favorite shot to learn from it.' },
          { title: 'Privacy auditing before sharing', description: 'Check whether a photo contains embedded GPS coordinates before posting it publicly.' },
          { title: 'Verifying image authenticity context', description: 'Review capture date, camera model, and software tags as part of basic image provenance checks.' },
          { title: 'Technical documentation', description: 'Export metadata as JSON for inclusion in photography portfolios, technical reports, or archives.' },
        ],
      },
    },
    {
      title: 'Remove EXIF Data', slug: 'remove-exif', icon: '🛡️',
      shortDescription: 'Strip all EXIF, GPS, and metadata from your photos before sharing them.',
      fullDescription: 'Protect your privacy by removing all embedded EXIF, IPTC, XMP, and GPS metadata from your photos before sharing them online. The tool re-encodes your image on a fresh canvas, which strips hidden metadata, and shows a clear before/after indicator confirming the metadata was removed.',
      keywords: ['remove exif data', 'strip metadata from photo', 'remove gps location from image', 'clean image metadata', 'privacy photo tool'],
      featured: false, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'Why should I remove EXIF data from my photos?', answer: 'EXIF data can include your exact GPS location, device model, and capture timestamp. Removing it before sharing online helps protect your privacy and avoids unintentionally revealing where a photo was taken.' },
        { question: 'How does this tool remove the metadata?', answer: 'It loads your image onto a fresh HTML canvas and re-exports it as a new file. This re-encoding process does not carry over the original EXIF, IPTC, XMP, or GPS metadata.' },
        { question: 'Will the image quality change?', answer: 'For JPG output, the tool re-encodes at a high quality setting (~92%) to keep visual changes minimal. PNG output remains fully lossless.' },
        { question: 'How do I know the metadata was actually removed?', answer: 'The tool checks your original file\'s metadata first and shows whether it contained data, then confirms the cleaned output has none, so you can verify the result directly.' },
        { question: 'Does this change my photo\'s dimensions?', answer: 'No, the output keeps the exact same width and height as your original image.' },
        { question: 'Is my photo uploaded anywhere during this process?', answer: 'No, the entire process — reading metadata and re-encoding the image — happens locally in your browser. Nothing is sent to a server.' },
        { question: 'What output format will I get?', answer: 'PNG inputs are re-encoded as PNG; all other formats (including JPG) are re-encoded as JPG at high quality.' },
        { question: 'Should I use this before posting photos on social media?', answer: 'It\'s a good practice, especially for photos taken on a smartphone, since many phones embed GPS coordinates by default unless location tagging is disabled.' },
      ],
      relatedTools: ['image-metadata-viewer', 'image-compressor'],
      seoTitle: 'Remove EXIF Data — Strip Photo Metadata & GPS Online Free | ToolifHub',
      seoDescription: 'Remove EXIF, GPS, and metadata from your photos for free before sharing online. Privacy-focused tool that re-encodes images locally in your browser.',
      seoContent: {
        overview: 'Most photos taken on a smartphone or digital camera carry far more hidden information than people realize — including, in many cases, the exact GPS coordinates of where the photo was taken. Before sharing a photo publicly online, it\'s worth stripping this data so you don\'t unintentionally reveal your location, device details, or other personal information.\n\nThe Remove EXIF Data tool addresses this directly. Instead of attempting to selectively edit metadata fields (which can be error-prone), it takes the more reliable approach of loading your image onto a brand-new canvas and re-exporting it as a fresh file. This re-encoding process naturally does not carry forward the original file\'s EXIF, IPTC, XMP, or GPS metadata, because the new file is generated from raw pixel data alone.\n\nTo give you confidence in the result, the tool first checks your original file for metadata using the same parsing technology as the Image Metadata Viewer, showing you whether the original contained data and roughly how many fields. After cleaning, you can see the size comparison and a clear confirmation that the metadata has been removed.\n\nQuality is preserved carefully during this process: JPG outputs are re-encoded at a high 92% quality setting to keep visual differences minimal, while PNG outputs remain fully lossless. As with every tool in this collection, the entire operation runs locally in your browser — your photo, and the sensitive metadata it might contain, are never transmitted to any server.',
        features: [
          'Strips EXIF, IPTC, XMP, and GPS metadata via canvas re-encoding',
          'Before/after indicator confirming metadata presence and removal',
          'High-quality JPG re-encoding (~92%) to minimize visual change',
          'Fully lossless PNG re-encoding when applicable',
          'Privacy-notice callout explaining what the tool does and why',
          'Single-click download of the cleaned file',
          'Entirely client-side — no uploads of sensitive image data',
        ],
        benefits: [
          'Protects your location privacy before sharing photos online',
          'Removes device and software fingerprinting metadata',
          'Minimal visual quality impact thanks to high-quality re-encoding',
          'Clear confirmation that metadata was actually removed',
          'No account, install, or server upload required',
        ],
        howToUse: [
          'Upload the photo you want to clean',
          'Review the before indicator showing whether metadata was detected',
          'Wait for the tool to re-encode the image on a clean canvas',
          'Check the after indicator confirming metadata removal',
          'Download the clean, metadata-free file',
        ],
        useCases: [
          { title: 'Social media privacy', description: 'Strip GPS and device metadata from vacation or home photos before posting them publicly.' },
          { title: 'Selling items online', description: 'Remove metadata from product photos in online marketplace listings to avoid revealing your address.' },
          { title: 'Journalism and whistleblowing', description: 'Remove identifying metadata from photos shared as part of sensitive reporting or documentation.' },
          { title: 'General digital hygiene', description: 'Routinely clean metadata from photos before uploading them anywhere outside your personal devices.' },
        ],
      },
    },
    {
      title: 'Image Optimizer', slug: 'image-optimizer', icon: '⚡',
      shortDescription: 'One-click image optimization for the web with smart, automatic size and quality defaults.',
      fullDescription: 'Optimize images for the web with a single click. The tool automatically picks smart compression settings based on your image\'s original size — no configuration needed — while power users can expand "Advanced settings" to fine-tune quality manually. See before/after size comparisons instantly.',
      keywords: ['image optimizer', 'optimize image for web', 'one click image compression', 'web image optimization tool', 'reduce image size for website'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How is this different from the Image Compressor?', answer: 'The Image Compressor gives you full manual control over the quality slider from the start. The Image Optimizer is designed for a faster, one-click workflow: it automatically picks smart settings based on your image\'s size, with manual controls tucked away in an optional "Advanced settings" panel.' },
        { question: 'What does "smart defaults" mean exactly?', answer: 'The tool looks at your original file size and automatically chooses an appropriate target size and quality level — larger source files get slightly more aggressive optimization, while smaller files use gentler settings to preserve quality.' },
        { question: 'Can I still control the quality manually?', answer: 'Yes, open the "Advanced settings" panel to reveal a quality slider that overrides the automatic defaults for power users who want precise control.' },
        { question: 'Will optimizing resize my image?', answer: 'The optimizer may cap very large images to a maximum dimension (1920px on the longest side) since that\'s sufficient for virtually all web use cases, which also helps reduce file size further.' },
        { question: 'Can I optimize multiple images at once?', answer: 'Yes, upload several images and click "Optimize All" to process the entire batch using the same smart or advanced settings.' },
        { question: 'Is this suitable for product photos and blog images?', answer: 'Yes, it\'s specifically designed for general web-use cases like blog images, product photos, and page assets where fast loading matters more than print-level fidelity.' },
        { question: 'Does optimization happen on a server?', answer: 'No, all optimization runs locally in your browser. Your images are never uploaded.' },
        { question: 'How much size reduction can I expect?', answer: 'Results vary by image, but it\'s common to see 50-80% size reduction on typical photographic images with minimal visible quality loss.' },
      ],
      relatedTools: ['image-compressor', 'image-resizer', 'webp-converter'],
      seoTitle: 'Image Optimizer — One-Click Web Image Optimization Free | ToolifHub',
      seoDescription: 'Optimize images for the web in one click with smart automatic compression. Advanced settings available for power users. Fast, free, browser-based.',
      seoContent: {
        overview: 'Not everyone wants to tune compression sliders manually — sometimes you just want an image that\'s ready for the web, fast. The Image Optimizer is built around that exact need: upload your image, click one prominent "Optimize" button, and get a smartly compressed result without making a single decision about quality percentages or target file sizes.\n\nBehind the scenes, the tool inspects your original file size and automatically selects an appropriate compression strategy — larger source files receive a slightly more aggressive size target and quality level, while smaller files are treated more gently to avoid unnecessary quality loss. It also caps maximum dimensions at 1920 pixels on the longest side by default, since that comfortably covers virtually every web display scenario while meaningfully reducing file size for oversized camera photos.\n\nFor users who want more control, an "Advanced settings" panel can be expanded to reveal a manual quality slider that overrides the automatic defaults. This keeps the default experience dead simple while still supporting power users who have specific quality requirements.\n\nAfter optimization, you immediately see a clear before-and-after file size comparison with the percentage reduction achieved, so you know exactly how much smaller your web-ready image has become. Batch support lets you optimize several images in one pass, each tracked with its own progress and result, all without ever uploading a single byte to a server.',
        features: [
          'One-click "Optimize" button with zero required configuration',
          'Automatic smart compression settings based on original file size',
          'Maximum dimension capping (1920px) tuned for web use',
          'Optional "Advanced settings" panel with a manual quality slider',
          'Before/after size comparison with percentage reduction',
          'Batch optimization of multiple images at once',
          'Per-file progress and individual or bulk downloads',
          'Fully client-side processing — no server uploads',
        ],
        benefits: [
          'Fastest path to web-ready images with zero decisions required',
          'Smart defaults avoid both over-compression and under-compression',
          'Power-user controls available without cluttering the default flow',
          'Significant file size savings with minimal visible quality loss',
          'Completely private — images never leave your browser',
        ],
        howToUse: [
          'Upload one or more images you want optimized for the web',
          'Click the "Optimize" button to apply smart automatic settings',
          'Optionally expand "Advanced settings" to set a manual quality level first',
          'Review the before/after size comparison for each file',
          'Download the optimized image(s) individually or all at once',
        ],
        useCases: [
          { title: 'Quick blog post image prep', description: 'Optimize a batch of article images in seconds before publishing, without manually tuning each one.' },
          { title: 'Improving page load speed', description: 'Shrink oversized hero images and banners to improve site performance scores.' },
          { title: 'Bulk product photo cleanup', description: 'Run an entire folder of e-commerce photos through one-click optimization before uploading to a storefront.' },
          { title: 'Non-technical users needing fast results', description: 'Give less technical users a simple way to make images web-ready without understanding compression settings.' },
        ],
      },
    },
  ],
};

// ─── Blogs ────────────────────────────────────────────────────────────────────

const BLOGS = [
  {
    title: '10 YouTube SEO Tips to Rank #1 in 2024',
    slug: '10-youtube-seo-tips-to-rank-number-1-in-2024',
    excerpt: 'Master YouTube SEO with these proven strategies. From keyword research to optimizing your thumbnails, these tips will help your videos rank higher and get more views.',
    content: `<h2>Introduction</h2><p>YouTube is the world's second-largest search engine, and ranking #1 for your target keywords can drive thousands of views to your channel. Here are 10 proven YouTube SEO tips for 2024.</p>

<h2>1. Research Keywords Before You Record</h2><p>Use YouTube's autocomplete, Google Trends, and keyword tools to find topics people are actively searching for. Target keywords with high search volume and low competition.</p>

<h2>2. Include Your Keyword in the Video Title</h2><p>Put your main keyword in the first half of your title. YouTube's algorithm gives more weight to keywords that appear early in the title.</p>

<h2>3. Write Detailed Descriptions</h2><p>Write at least 200–300 words in your description. Include your main keyword in the first 2–3 sentences and use it naturally throughout.</p>

<h2>4. Use Relevant Tags</h2><p>Add 5–15 tags that describe your video topic, channel, and related subjects. Start with your exact keyword phrase as the first tag.</p>

<h2>5. Create Custom Thumbnails</h2><p>Custom thumbnails can increase click-through rates by 40%+. Use high-contrast colors, readable text, and expressive faces when appropriate.</p>

<h2>6. Add Chapters with Timestamps</h2><p>Adding chapters to your videos improves watch time and allows sections of your video to appear in Google search results as featured snippets.</p>

<h2>7. Encourage Engagement</h2><p>Comments, likes, shares, and subscriptions signal to YouTube that your content is valuable. Ask viewers to engage in your video at natural points.</p>

<h2>8. Upload Consistently</h2><p>Regular uploads help YouTube understand your channel's topic and recommend your videos to the right audience. Aim for at least one video per week.</p>

<h2>9. Optimize for Watch Time</h2><p>YouTube heavily favors videos with high watch time. Hook viewers in the first 30 seconds and structure your content to keep people watching to the end.</p>

<h2>10. Use Closed Captions</h2><p>Adding accurate captions (or using YouTube's auto-generated captions and correcting errors) makes your videos accessible and gives YouTube more text to index.</p>

<h2>Conclusion</h2><p>YouTube SEO is an ongoing process. Track your analytics, see what's working, and keep optimizing. Use our YouTube Tag Generator and Title Generator tools to save time and create better-optimized content.</p>`,
    tags: ['youtube', 'seo', 'video marketing', 'content creation'],
    status: 'published', featured: true,
    seoTitle: '10 YouTube SEO Tips to Rank #1 in 2024 | ToolifHub Blog',
    seoDescription: 'Master YouTube SEO with 10 proven strategies. Learn how to rank your videos higher and get more views in 2024.',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'The Developer\'s Guide to Essential Online Tools',
    slug: 'developers-guide-to-essential-online-tools',
    excerpt: 'Discover the most essential online tools every developer should bookmark. From JSON formatters to regex testers, these tools save hours of development time.',
    content: `<h2>Why Every Developer Needs a Good Toolkit</h2><p>Modern web development involves a constant back-and-forth between different formats, encodings, and utilities. Having the right online tools can save you hours of tedious work every week.</p>

<h2>JSON Tools</h2><p>JSON is everywhere in modern web development. Our JSON Formatter helps you instantly beautify minified API responses, validate syntax, and minify JSON for production. No more manually counting brackets or fighting with indentation.</p>

<h2>Encoding & Hashing</h2><p>Base64 encoding and cryptographic hashing are fundamental tasks. Our Base64 Encoder/Decoder and Hash Generator handle these instantly in your browser — no server needed, your data stays private.</p>

<h2>UUID Generation</h2><p>Database IDs, API keys, session tokens — UUIDs are everywhere. Generate 1–20 UUID v4 values at once and copy them directly into your code or database.</p>

<h2>Code Formatters & Minifiers</h2><p>Our HTML Formatter, CSS Minifier, and JavaScript Minifier help you switch between readable development code and production-ready minified code instantly.</p>

<h2>Conclusion</h2><p>The right tools dramatically improve developer productivity. Bookmark ToolifHub's developer tools section for quick access to everything you need during your workday.</p>`,
    tags: ['developer tools', 'productivity', 'web development'],
    status: 'published', featured: false,
    seoTitle: 'The Developer\'s Guide to Essential Online Tools | ToolifHub Blog',
    seoDescription: 'Discover essential online tools for developers. JSON formatters, Base64 encoders, hash generators, and more to save development time.',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'How to Calculate BMI and What It Really Means',
    slug: 'how-to-calculate-bmi-and-what-it-means',
    excerpt: 'BMI (Body Mass Index) is a widely used health screening tool. Learn how it\'s calculated, what the numbers mean, and its limitations.',
    content: `<h2>What is BMI?</h2><p>Body Mass Index (BMI) is a value calculated from a person's weight and height. It provides a simple numeric measure that can be used to categorize people as underweight, normal weight, overweight, or obese.</p>

<h2>How is BMI Calculated?</h2><p>In metric units: BMI = weight (kg) ÷ height² (m). In imperial units: BMI = 703 × weight (lbs) ÷ height² (inches).</p>

<h2>BMI Categories</h2><p>Below 18.5 is underweight. 18.5–24.9 is normal weight. 25–29.9 is overweight. 30 and above is obese. These categories apply to adults 20 years and older.</p>

<h2>Limitations of BMI</h2><p>BMI doesn't account for muscle mass, bone density, age, or sex. Athletes often have a "high" BMI despite being very healthy, while older adults may have a "normal" BMI with dangerous levels of body fat.</p>

<h2>Using Our BMI Calculator</h2><p>Our free BMI Calculator supports both metric and imperial units and shows your healthy weight range. Remember to treat it as a screening tool, not a diagnosis.</p>`,
    tags: ['health', 'calculator', 'bmi', 'fitness'],
    status: 'published', featured: false,
    seoTitle: 'How to Calculate BMI and What It Really Means | ToolifHub Blog',
    seoDescription: 'Learn how BMI is calculated, what the categories mean, and its limitations. Use our free BMI calculator for instant results.',
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
];

// ─── Seed Function ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 ToolifHub Seed Script Starting...\n');

  console.log('Mongo URI:', MONGODB_URI);
  console.log('Database Name:', DATABASE_NAME);

  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('✅ Connected to MongoDB');
  console.log('Resolved Database Name:', mongoose.connection.db.databaseName, '\n');

  // ── 1. Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([Category.deleteMany({}), Tool.deleteMany({}), Blog.deleteMany({}), User.deleteMany({})]);
  console.log('   Done.\n');

  // ── 2. Seed admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const adminUser = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword, role: 'admin', active: true });
  console.log(`   ✅ Admin: ${ADMIN_EMAIL}\n`);

  // ── 3. Seed categories
  console.log('📂 Seeding categories...');
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const created = await Category.create(cat);
    categoryMap[cat.slug] = created._id;
    process.stdout.write(`   + ${cat.name}\n`);
  }
  console.log(`   ✅ ${CATEGORIES.length} categories created.\n`);

  // ── 4. Seed tools
  console.log('🔧 Seeding tools...');
  let toolCount = 0;
  for (const [categorySlug, tools] of Object.entries(TOOLS_BY_CATEGORY)) {
    const categoryId = categoryMap[categorySlug];
    if (!categoryId) { console.warn(`   ⚠️  Category not found: ${categorySlug}`); continue; }
    for (const tool of tools) {
      await Tool.create({ ...tool, category: categoryId });
      process.stdout.write(`   + ${tool.title}\n`);
      toolCount++;
    }
  }
  console.log(`   ✅ ${toolCount} tools created.\n`);

  // ── 5. Seed blogs
  console.log('📝 Seeding blog posts...');
  for (const blog of BLOGS) {
    await Blog.create({ ...blog, author: adminUser._id });
    console.log(`   + ${blog.title}`);
  }
  console.log(`   ✅ ${BLOGS.length} blog posts created.\n`);

  // ── Summary
  console.log('─'.repeat(50));
  console.log('🎉 Seed complete!\n');
  console.log(`   Categories : ${CATEGORIES.length}`);
  console.log(`   Tools      : ${toolCount}`);
  console.log(`   Blog posts : ${BLOGS.length}`);
  console.log(`   Admin      : ${ADMIN_EMAIL}`);
  console.log('─'.repeat(50));
  console.log('\n🚀 Ready to launch! Run: npm run dev\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  console.error(err);
  process.exit(1);
});
