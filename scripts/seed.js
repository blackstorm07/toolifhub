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
  { name: 'AI Tools', slug: 'ai-tools', icon: '🤖', description: 'AI-powered writing, image, code, and productivity tools to supercharge your workflow.', featured: true, order: 11 },
  { name: 'Social Media Tools', slug: 'social-media-tools', icon: '📱', description: 'Hashtag generators, bio writers, and engagement tools for Instagram, Twitter, TikTok, and more.', featured: false, order: 12 },
  { name: 'Utility Tools', slug: 'utility-tools', icon: '🛠️', description: 'Handy everyday tools — QR code generators, barcode creators, countdown timers, and miscellaneous utilities.', featured: false, order: 13 },
  { name: 'Productivity Tools', slug: 'productivity-tools', icon: '⚡', description: 'Boost your productivity with note organizers, Pomodoro timers, to-do list generators, and focus tools.', featured: false, order: 14 },
  { name: 'Random Generators', slug: 'random-generators', icon: '🎲', description: 'Generate random names, numbers, passwords, colors, quotes, and more with a single click.', featured: false, order: 15 },
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
      relatedTools: ['base64-encoder-decoder', 'hash-generator'],
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
      shortDescription: 'Pick colors and convert between HEX, RGB, HSL, and HSV formats.',
      fullDescription: 'Pick any color and instantly convert it between HEX, RGB, HSL, and HSV formats. View color variations, complementary colors, and copy any format with one click.',
      keywords: ['color picker', 'color converter', 'hex to rgb', 'rgb to hex', 'hsl converter', 'color code'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What is the difference between HEX and RGB?', answer: 'HEX is a 6-character hexadecimal representation (e.g., #FF5733) used in CSS and HTML. RGB specifies the red, green, and blue components as numbers 0-255 (e.g., rgb(255, 87, 51)).' },
      ],
      relatedTools: [],
      seoTitle: 'Color Picker & Converter — HEX, RGB, HSL Converter | ToolifHub',
      seoDescription: 'Pick colors and convert between HEX, RGB, HSL, and HSV color formats. Free online color picker and converter.',
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
      title: 'Random Name Generator', slug: 'random-name-generator', icon: '👤',
      shortDescription: 'Generate random first names, last names, and full names.',
      fullDescription: 'Generate random names for characters, usernames, test data, or creative writing. Choose from male, female, or gender-neutral names. Generate multiple names at once.',
      keywords: ['random name generator', 'name generator', 'character name generator', 'fake name generator', 'username generator'],
      featured: false, trending: false, status: 'active',
      faq: [
        { question: 'What are random name generators used for?', answer: 'Random name generators are used for creating characters in fiction writing, generating test data for databases, creating usernames, naming projects, or any situation where you need a placeholder name.' },
      ],
      relatedTools: ['uuid-generator'],
      seoTitle: 'Random Name Generator — Generate Random Names Online | ToolifHub',
      seoDescription: 'Generate random first names, last names, and full names for characters, testing, and creative projects.',
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
      relatedTools: [],
      seoTitle: 'QR Code Generator — Create Free QR Codes Online | ToolifHub',
      seoDescription: 'Generate free QR codes for URLs, text, contacts, and more. Download as PNG or SVG. No registration required.',
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
