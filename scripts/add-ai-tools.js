/**
 * Adds the new Gemini-powered AI Tools batch to an EXISTING database without
 * touching anything else — like scripts/add-seo-tools.js, this does not
 * delete any data. Safe to re-run: tools that already exist (matched by
 * slug) are skipped.
 *
 * Run with: node scripts/add-ai-tools.js
 * Requires .env.local to be configured with MONGODB_URI.
 */

require('dotenv').config({ path: '.env' });
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
  icon: String, featured: Boolean, trending: Boolean, analyticsEnabled: Boolean,
  status: { type: String, enum: ['active', 'inactive', 'coming-soon'], default: 'active' },
  faq: [{ question: String, answer: String }],
  relatedTools: [String],
  seoTitle: String, seoDescription: String, seoKeywords: [String],
  views: { type: Number, default: 0 }, usageCount: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);

const AI_TOOLS = [
  {
    title: 'AI Text Humanizer', slug: 'ai-text-humanizer', icon: '🤖',
    shortDescription: 'Rewrite AI-generated text so it sounds natural and human while preserving meaning.',
    fullDescription: 'Paste any AI-generated text and our Gemini-powered humanizer rewrites it to sound natural and human, with adjustable strength (light, medium, strong) and options to preserve formatting, preserve meaning, and improve readability.',
    keywords: ['ai humanizer', 'humanize ai text', 'make ai text sound human', 'ai text rewriter'],
    featured: true, trending: true, status: 'active', analyticsEnabled: true,
    faq: [
      { question: 'Does humanizing change the meaning of my text?', answer: 'No — with "Preserve meaning" enabled, the tool rewrites phrasing and structure while keeping your original intent intact.' },
      { question: 'What does humanization "strength" control?', answer: 'Light makes subtle wording changes, medium rewrites more noticeably while staying safe, and strong restructures sentences significantly for maximum naturalness.' },
    ],
    relatedTools: ['ai-content-detector', 'ai-paraphraser'],
    seoTitle: 'AI Humanizer — Make AI Text Sound Human | ToolifHub',
    seoDescription: 'Free AI humanizer tool. Rewrite AI-generated text to sound natural and human while preserving meaning, powered by Google Gemini.',
  },
  {
    title: 'AI Content Detector', slug: 'ai-content-detector', icon: '🔍',
    shortDescription: 'Estimate whether text was written by AI or a human.',
    fullDescription: 'Paste any text to get an AI-generated probability estimate, human probability estimate, a confidence level, and highlighted sections that most resemble AI-generated patterns. Powered by Google Gemini.',
    keywords: ['ai detector', 'ai content detector', 'chatgpt detector', 'ai text checker'],
    featured: true, trending: true, status: 'active', analyticsEnabled: true,
    faq: [
      { question: 'How accurate is this AI detector?', answer: 'This tool provides an AI-generated estimate based on language patterns. It should not be treated as definitive proof that text is or isn\'t AI-generated.' },
      { question: 'Can this tool be wrong?', answer: 'Yes — AI detection is inherently probabilistic. Heavily edited AI text or unusual human writing styles can both produce inaccurate results.' },
    ],
    relatedTools: ['ai-text-humanizer', 'ai-grammar-checker'],
    seoTitle: 'AI Content Detector — Check if Text is AI-Generated | ToolifHub',
    seoDescription: 'Free AI content detector. Estimate the probability that text was AI-generated, with confidence level and highlighted sections.',
  },
  {
    title: 'AI Paraphraser', slug: 'ai-paraphraser', icon: '🔄',
    shortDescription: 'Rephrase text in standard, fluency, formal, academic, creative, or simple modes.',
    fullDescription: 'Rewrite any text in six different modes — Standard, Fluency, Formal, Academic, Creative, or Simple — with options to preserve meaning, shorten, expand, or improve readability. Powered by Google Gemini.',
    keywords: ['ai paraphraser', 'paraphrasing tool', 'rephrase text', 'sentence rephraser'],
    featured: true, trending: false, status: 'active', analyticsEnabled: true,
    faq: [
      { question: 'What\'s the difference between the paraphrasing modes?', answer: 'Standard balances clarity, Fluency maximizes natural flow, Formal/Academic use more professional or scholarly language, Creative adds vivid phrasing, and Simple uses short, easy words.' },
    ],
    relatedTools: ['ai-text-humanizer', 'ai-text-summarizer'],
    seoTitle: 'AI Paraphraser — Free Paraphrasing Tool | ToolifHub',
    seoDescription: 'Free AI paraphrasing tool with 6 modes: Standard, Fluency, Formal, Academic, Creative, and Simple. Powered by Google Gemini.',
  },
  {
    title: 'AI Text Summarizer', slug: 'ai-text-summarizer', icon: '📄',
    shortDescription: 'Generate bullet, short, detailed, executive, or key-takeaway summaries.',
    fullDescription: 'Paste any long text and generate a concise summary in your preferred style — Bullet Summary, Short Summary, Detailed Summary, Executive Summary, or Key Takeaways — with adjustable length. Powered by Google Gemini.',
    keywords: ['ai summarizer', 'text summarizer', 'article summarizer', 'summary generator'],
    featured: true, trending: false, status: 'active', analyticsEnabled: true,
    faq: [
      { question: 'What summary modes are available?', answer: 'Bullet Summary, Short Summary, Detailed Summary, Executive Summary, and Key Takeaways — each formatted for a different use case.' },
    ],
    relatedTools: ['ai-paraphraser', 'ai-grammar-checker'],
    seoTitle: 'AI Text Summarizer — Free Summary Generator | ToolifHub',
    seoDescription: 'Free AI text summarizer. Generate bullet, short, detailed, executive, or key-takeaway summaries from any text.',
  },
  {
    title: 'AI Grammar Checker', slug: 'ai-grammar-checker', icon: '✅',
    shortDescription: 'Detect and correct grammar, spelling, punctuation, and sentence structure issues.',
    fullDescription: 'Check any text for grammar, spelling, punctuation, word-choice, readability, and sentence-structure issues. Get a fully corrected version plus a detailed list of every correction with an explanation. Powered by Google Gemini.',
    keywords: ['ai grammar checker', 'grammar checker', 'spelling checker', 'sentence corrector'],
    featured: true, trending: false, status: 'active', analyticsEnabled: true,
    faq: [
      { question: 'What kinds of errors does this grammar checker catch?', answer: 'Grammar, spelling, punctuation, word choice, readability, and sentence structure issues — each correction comes with a short explanation.' },
    ],
    relatedTools: ['ai-paraphraser', 'ai-content-detector'],
    seoTitle: 'AI Grammar Checker — Free Grammar & Spelling Checker | ToolifHub',
    seoDescription: 'Free AI grammar checker. Detect and correct grammar, spelling, punctuation, and sentence structure issues instantly.',
  },
];

async function run() {
  console.log('🌱 Adding AI Tools batch (non-destructive)...\n');
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('✅ Connected to MongoDB:', mongoose.connection.db.databaseName, '\n');

  let category = await Category.findOne({ slug: 'text-tools' });
  if (!category) {
    category = await Category.create({
      name: 'Text Tools', slug: 'text-tools', icon: '📝',
      description: 'Manipulate and analyze text with word counters, case converters, Lorem ipsum generators, and text transformers.',
      featured: true, order: 4,
    });
    console.log('   + Created "Text Tools" category (it didn\'t exist)\n');
  } else {
    console.log('   Using existing "Text Tools" category\n');
  }

  let created = 0, skipped = 0;
  for (const tool of AI_TOOLS) {
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
