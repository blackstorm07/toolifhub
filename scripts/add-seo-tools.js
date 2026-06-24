/**
 * Adds the new SEO Tools batch to an EXISTING database without touching
 * anything else — unlike scripts/seed.js, this does not delete any data.
 * Safe to re-run: tools that already exist (matched by slug) are skipped.
 *
 * Run with: node scripts/add-seo-tools.js
 * Requires .env.local to be configured with MONGODB_URI.
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';

if (!MONGODB_URI) { console.error('❌ MONGODB_URI is not set in .env.local'); process.exit(1); }

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

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);

// Keep this list in sync with TOOLS_BY_CATEGORY['seo-tools'] in scripts/seed.js
const SEO_TOOLS = [
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
];

async function run() {
  console.log('🌱 Adding SEO Tools batch (non-destructive)...\n');
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('✅ Connected to MongoDB:', mongoose.connection.db.databaseName, '\n');

  let category = await Category.findOne({ slug: 'seo-tools' });
  if (!category) {
    category = await Category.create({
      name: 'SEO Tools', slug: 'seo-tools', icon: '🔍',
      description: 'Optimize your website for search engines with keyword research, meta tag generators, and SERP analyzers.',
      featured: true, order: 2,
    });
    console.log('   + Created "SEO Tools" category (it didn\'t exist)\n');
  } else {
    console.log('   Using existing "SEO Tools" category\n');
  }

  let created = 0, skipped = 0;
  for (const tool of SEO_TOOLS) {
    const exists = await Tool.findOne({ slug: tool.slug });
    if (exists) {
      console.log(`   ~ Skipped (already exists): ${tool.title}`);
      skipped++;
      continue;
    }
    await Tool.create({ ...tool, category: category._id });
    console.log(`   + Added: ${tool.title}`);
    created++;
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`🎉 Done. ${created} tool(s) added, ${skipped} already existed and were left untouched.`);
  console.log('─'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
