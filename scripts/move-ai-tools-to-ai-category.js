/**
 * Moves the existing AI-powered tools out of "Text Tools" and into a
 * dedicated "AI Tools" category. Non-destructive: creates the category only
 * if it doesn't already exist, and only updates the `category` field on the
 * affected tools — slugs, ids, content, SEO fields, and analytics are left
 * untouched. Safe to re-run.
 *
 * Run with: node scripts/move-ai-tools-to-ai-category.js
 * Requires .env (or .env.local) to be configured with MONGODB_URI.
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
}, { timestamps: true, strict: false });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);

const AI_TOOL_SLUGS = [
  'ai-text-humanizer',
  'ai-content-detector',
  'ai-paraphraser',
  'ai-text-summarizer',
  'ai-grammar-checker',
];

async function run() {
  console.log('🌱 Moving AI tools into the "AI Tools" category (non-destructive)...\n');
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('✅ Connected to MongoDB:', mongoose.connection.db.databaseName, '\n');

  let aiCategory = await Category.findOne({ slug: 'ai-tools' });
  if (!aiCategory) {
    aiCategory = await Category.create({
      name: 'AI Tools', slug: 'ai-tools', icon: '🤖',
      description: 'Boost your productivity with free AI-powered tools. Humanize AI text, detect AI-generated content, summarize articles, paraphrase text, check grammar, and more—all in one place.',
      featured: true, order: 11,
    });
    console.log('   + Created "AI Tools" category\n');
  } else {
    console.log('   Using existing "AI Tools" category\n');
  }

  // Also catch any other tool whose slug starts with "ai-" that isn't in the
  // explicit list above, so future AI tools aren't missed.
  const extraAiTools = await Tool.find({
    slug: { $regex: /^ai-/, $nin: AI_TOOL_SLUGS },
  }).select('slug');
  const allSlugs = [...AI_TOOL_SLUGS, ...extraAiTools.map((t) => t.slug)];

  let moved = 0, alreadyThere = 0, missing = 0;
  for (const slug of allSlugs) {
    const tool = await Tool.findOne({ slug });
    if (!tool) {
      console.log(`   ! Not found (skipped): ${slug}`);
      missing++;
      continue;
    }
    if (tool.category && tool.category.toString() === aiCategory._id.toString()) {
      console.log(`   ~ Already in AI Tools: ${slug}`);
      alreadyThere++;
      continue;
    }
    tool.category = aiCategory._id;
    await tool.save();
    console.log(`   + Moved: ${slug}`);
    moved++;
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`🎉 Done. ${moved} tool(s) moved, ${alreadyThere} already in place, ${missing} not found.`);
  console.log('─'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
