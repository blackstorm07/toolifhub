/**
 * Additive seed: inserts the 4 new Developer Tools (Timestamp Converter, JWT
 * Decoder, Regex Tester, JSON to CSV Converter) and updates relatedTools on
 * a few existing tools (json-formatter, password-generator, qr-code-generator)
 * for cross-linking. Does NOT touch any other Category/Tool/Blog/User data.
 *
 * Run with: node scripts/seed-developer-tools-batch2.js
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

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

const NEW_TOOLS = [
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
];

const RELATED_TOOLS_UPDATES = [
  { slug: 'json-formatter', relatedTools: ['base64-encoder-decoder', 'json-to-csv-converter'] },
  { slug: 'qr-code-generator', relatedTools: ['password-generator', 'json-formatter'] },
];

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('Connected to MongoDB');

  const category = await Category.findOne({ slug: 'developer-tools' });
  if (!category) throw new Error('developer-tools category not found — run the main seed first');

  for (const tool of NEW_TOOLS) {
    const doc = await Tool.findOneAndUpdate(
      { slug: tool.slug },
      { $set: { ...tool, category: category._id } },
      { upsert: true, new: true }
    );
    console.log(`  Tool ready: ${doc.title} (${doc.slug})`);
  }

  for (const update of RELATED_TOOLS_UPDATES) {
    const doc = await Tool.findOneAndUpdate(
      { slug: update.slug },
      { $set: { relatedTools: update.relatedTools } },
      { new: true }
    );
    if (doc) console.log(`  Updated relatedTools: ${doc.slug} -> [${update.relatedTools.join(', ')}]`);
  }

  console.log('Done. No existing data was deleted.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
