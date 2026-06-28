/**
 * Adds a batch of new, genuinely written blog posts to an EXISTING database
 * without touching anything else. Safe to re-run: posts that already exist
 * (matched by slug) are skipped.
 *
 * Run with: node scripts/add-blog-posts-batch3.js
 * Requires .env.local to be configured with MONGODB_URI.
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

const FaqSchema = new mongoose.Schema({ question: String, answer: String }, { _id: false });
const BlogSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    content: String,
    excerpt: String,
    featuredImage: String,
    tags: [String],
    category: String,
    status: { type: String, enum: ['published', 'draft', 'scheduled'], default: 'published' },
    featured: Boolean,
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    faqs: [FaqSchema],
    seoTitle: String,
    seoDescription: String,
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const POSTS = [
  {
    title: "What Is Base64 Encoding? A Complete Beginner's Guide",
    slug: 'what-is-base64-encoding-beginners-guide',
    category: 'developer',
    tags: ['base64', 'encoding', 'developer tools'],
    featured: true,
    excerpt: 'Base64 turns binary data into plain text so it can travel safely through systems built for text. Here\'s what it actually does, when to use it, and when not to.',
    seoTitle: 'What Is Base64 Encoding? Beginner\'s Guide | ToolifHub',
    seoDescription: 'Learn what Base64 encoding is, how it works, when to use it, and common mistakes — with practical examples and a free online Base64 encoder/decoder.',
    faqs: [
      { question: 'Is Base64 encryption?', answer: 'No. Base64 is encoding, not encryption — it has no secret key and anyone can decode it instantly. Never use it to "hide" sensitive data; use real encryption (like AES) for that.' },
      { question: 'Why does Base64 output end with = signs?', answer: 'The = characters are padding. Base64 processes data in 3-byte chunks; when the final chunk has fewer than 3 bytes, = is added to keep the output length a multiple of 4.' },
      { question: 'Does Base64 make files smaller?', answer: 'The opposite — Base64 increases size by roughly 33%, since every 3 bytes of binary data become 4 bytes of text. It trades size for compatibility, not the other way around.' },
    ],
    content: `
<p>If you've ever opened a JSON API response and seen a long string of letters, numbers, and the occasional <code>=</code> at the end, you've run into Base64. It looks like a cipher, but it isn't one — it's something much simpler and more useful.</p>

<h2>The Problem Base64 Solves</h2>
<p>Computers store images, files, and binary data as raw bytes. The trouble is that a lot of systems — email, URLs, JSON, XML, older text protocols — were built to carry plain text safely, not arbitrary binary. Send raw binary through one of these channels and you risk corruption: control characters get misread, line endings get mangled, and some bytes simply aren't valid in the format at all.</p>
<p>Base64 solves this by re-representing binary data using only 64 safe, printable characters: <code>A–Z</code>, <code>a–z</code>, <code>0–9</code>, plus <code>+</code> and <code>/</code> (and <code>=</code> for padding). Any text-safe channel can carry it without modification.</p>

<h2>How It Actually Works</h2>
<p>Base64 reads input 3 bytes (24 bits) at a time and repacks those 24 bits into four 6-bit groups. Each 6-bit group (a number from 0–63) maps to one of the 64 safe characters. That's where the name comes from — 64 possible symbols per group.</p>
<p>Try it yourself with ToolifHub's <a href="/tools/base64-encoder-decoder">free Base64 Encoder &amp; Decoder</a> — paste in any text or file and see the encoded output instantly, entirely in your browser.</p>

<h2>Where You'll Actually See It</h2>
<ul>
<li><strong>Email attachments (MIME):</strong> email was designed for plain text, so attachments are Base64-encoded to survive the trip.</li>
<li><strong>Data URIs in HTML/CSS:</strong> small images embedded directly in a stylesheet via <code>data:image/png;base64,...</code> to avoid an extra HTTP request.</li>
<li><strong>JWTs (JSON Web Tokens):</strong> the header and payload segments of a JWT are Base64URL-encoded JSON.</li>
<li><strong>Basic HTTP authentication:</strong> the <code>Authorization: Basic</code> header encodes <code>username:password</code> in Base64 — note this is encoding, not protection; it must be sent over HTTPS.</li>
</ul>

<h2>Common Mistakes</h2>
<p>The most common misunderstanding is treating Base64 as a security measure. Because decoding requires no key or password, anyone who intercepts a Base64 string can read it in seconds. Developers sometimes Base64-encode an API key thinking it's "obfuscated" — it isn't, it's just reformatted.</p>
<p>The second common mistake is forgetting the size overhead: encoded data is about 33% larger than the original. For large files, this adds real bandwidth cost, which is why Base64 is best reserved for small assets and text-safe transport, not bulk file storage.</p>

<h2>Best Practices</h2>
<ul>
<li>Use Base64 to make binary data <em>transportable</em>, never to make it <em>secret</em>.</li>
<li>Prefer Base64URL (which replaces <code>+</code>/<code>/</code> with <code>-</code>/<code>_</code>) when the encoded string needs to go in a URL.</li>
<li>Don't Base64-encode large files for storage — store the binary directly and only encode at the point of transport if the channel requires it.</li>
</ul>

<h2>Conclusion</h2>
<p>Base64 is a translation layer, not a lock. Once you see it that way, a lot of API responses, email internals, and JWT structures stop looking mysterious. If you need to encode or decode something right now, ToolifHub's <a href="/tools/base64-encoder-decoder">Base64 Encoder &amp; Decoder</a> runs entirely in your browser — nothing you paste is ever sent to a server.</p>
`,
  },
  {
    title: 'Best Free AI Tools in 2026 for Writing, Detection, and Productivity',
    slug: 'best-free-ai-tools-2026',
    category: 'ai',
    tags: ['ai tools', 'productivity', 'writing'],
    featured: true,
    excerpt: 'A practical, no-fluff roundup of free AI tools worth actually using in 2026 — for humanizing AI text, detecting AI content, paraphrasing, and summarizing.',
    seoTitle: 'Best Free AI Tools in 2026 | ToolifHub',
    seoDescription: 'A practical roundup of the best free AI tools in 2026 for writing, AI detection, paraphrasing, and summarizing — what they do and when to use each one.',
    faqs: [
      { question: 'Are free AI tools as good as paid ones?', answer: 'For most everyday tasks — paraphrasing, summarizing, basic grammar fixes — free browser-based tools handle it fine. Paid tools tend to win on very long documents, fine-tuned tone control, or team collaboration features.' },
      { question: 'Can AI detectors be wrong?', answer: 'Yes. AI detectors estimate probability based on writing patterns, not certainty. Heavily edited AI text or very formulaic human writing can both produce false readings — treat results as a signal, not a verdict.' },
      { question: 'Is it safe to paste sensitive text into AI tools?', answer: 'It depends on the tool. Tools that process text entirely in your browser (no server upload) are the safest choice for anything sensitive — always check whether a tool sends your input to a server before pasting confidential content.' },
    ],
    content: `
<p>"AI tool" has become a crowded, noisy category — most "free" tools gate the real functionality behind a paywall after a few uses. This is a shortlist of free tools that actually do what they claim, with no surprise paywall.</p>

<h2>1. AI Text Humanizer</h2>
<p>Takes text that reads as stiff or obviously AI-generated and rewrites it with more natural rhythm and word choice. Useful for cleaning up a first AI draft before you publish it under your own name. Try ToolifHub's <a href="/tools/ai-text-humanizer">AI Text Humanizer</a>.</p>

<h2>2. AI Content Detector</h2>
<p>Estimates the likelihood that a passage was AI-generated. Editors and teachers use this as a first-pass signal, not a final verdict — see the FAQ below on why detector results aren't certainty. Try the <a href="/tools/ai-content-detector">AI Content Detector</a>.</p>

<h2>3. AI Paraphraser</h2>
<p>Rewrites a sentence or paragraph while preserving meaning — genuinely useful for avoiding repetition across a long document, or for rephrasing something that came out awkward on the first pass. Try the <a href="/tools/ai-paraphraser">AI Paraphraser</a>.</p>

<h2>4. AI Text Summarizer</h2>
<p>Condenses long articles, reports, or research into a short summary. Good for triaging a reading list — skim the summary, decide if the full piece is worth your time. Try the <a href="/tools/ai-text-summarizer">AI Text Summarizer</a>.</p>

<h2>5. AI Grammar Checker</h2>
<p>Catches grammar and phrasing issues beyond what a basic spell-checker flags. Works well as a final pass before publishing anything. Try the <a href="/tools/ai-grammar-checker">AI Grammar Checker</a>.</p>

<h2>How to Choose Between Them</h2>
<p>Match the tool to the actual problem: humanizer for tone, paraphraser for repetition, summarizer for triage, grammar checker for polish, detector for verification. Using the wrong tool for the job — like running a grammar checker hoping it'll rewrite tone — is the most common reason people conclude "AI tools don't work."</p>

<h2>Common Mistakes</h2>
<ul>
<li>Trusting a single AI detector score as definitive proof.</li>
<li>Running humanized text through a paraphraser again "for extra safety" — this usually degrades quality rather than improving it.</li>
<li>Pasting confidential or proprietary text into any tool without checking whether it processes locally.</li>
</ul>

<h2>Conclusion</h2>
<p>Free AI tools in 2026 are genuinely capable for everyday writing tasks — the trick is matching the right tool to the right job and treating AI output as a draft, not a final answer.</p>
`,
  },
  {
    title: 'How to Compress Images Without Losing Quality',
    slug: 'how-to-compress-images-without-losing-quality',
    category: 'image',
    tags: ['image compression', 'web performance', 'images'],
    excerpt: 'Image compression isn\'t just "make it smaller" — done right, it removes data your eye never notices. Here\'s how to do it properly.',
    seoTitle: 'How to Compress Images Without Losing Quality | ToolifHub',
    seoDescription: 'Learn how lossy and lossless image compression actually work, which format to choose, and how to compress images for the web without visible quality loss.',
    faqs: [
      { question: 'Is PNG or JPG better for compression?', answer: 'JPG compresses photos much smaller than PNG because it\'s designed for continuous-tone images. PNG is better for graphics with flat colors, text, or transparency, where JPG would introduce visible artifacts.' },
      { question: 'What quality setting should I use for JPG?', answer: 'For web use, 70-85% quality is the sweet spot — well below 100% file size with no visible difference to most viewers. Below 60%, compression artifacts (blocky patches, color banding) start becoming noticeable.' },
      { question: 'Does compressing an image twice make it worse?', answer: 'Yes, for lossy formats like JPG. Each lossy compression pass discards more data, so repeatedly saving and re-compressing the same JPG compounds quality loss. Always compress from the original, not from an already-compressed copy.' },
    ],
    content: `
<p>"Compress this image" usually means one of two very different things: throwing away pixels you won't miss (lossy), or repacking the exact same pixels more efficiently (lossless). Knowing which one you're doing changes everything about the result.</p>

<h2>Lossy vs. Lossless, in Plain Terms</h2>
<p><strong>Lossy compression</strong> (JPG, WebP at lower quality) intentionally discards information the human eye is less sensitive to — subtle color gradients, high-frequency detail — to shrink the file substantially. Done at a sane quality level, the loss is invisible. Done aggressively, you get visible blocky artifacts.</p>
<p><strong>Lossless compression</strong> (PNG, WebP lossless) re-encodes the exact same pixel data more efficiently, with zero quality loss — but the size reduction is much smaller, because there's a hard mathematical limit on how much truly random pixel data can shrink without losing information.</p>

<h2>Choosing the Right Format</h2>
<ul>
<li><strong>Photos:</strong> JPG or WebP, lossy, 70-85% quality.</li>
<li><strong>Logos, icons, screenshots with text:</strong> PNG, or WebP lossless — JPG's lossy artifacts are very visible on flat colors and sharp edges.</li>
<li><strong>Anything needing transparency:</strong> PNG or WebP (JPG has no alpha channel).</li>
</ul>

<h2>A Practical Workflow</h2>
<ol>
<li>Resize first. A 4000px photo displayed at 800px wide is carrying 5x more pixel data than it needs to — resizing before compressing has a bigger impact than compression settings alone. Try the <a href="/tools/image-resizer">Image Resizer</a>.</li>
<li>Compress from the original file, never from an already-compressed copy (see the FAQ on repeated compression).</li>
<li>Compare at 100% zoom, not the thumbnail — artifacts that are invisible scaled down can be obvious at full size.</li>
<li>If file size still isn't where you need it, drop quality in small steps (85% → 75% → 65%) rather than jumping straight to an aggressive setting.</li>
</ol>
<p>ToolifHub's <a href="/tools/image-compressor">Image Compressor</a> handles JPG, PNG, and WebP compression entirely in your browser — your photos never leave your device.</p>

<h2>Common Mistakes</h2>
<ul>
<li>Compressing a screenshot or logo as JPG and getting fuzzy edges around text — use PNG instead.</li>
<li>Re-saving the same JPG repeatedly across edits, compounding quality loss with every save.</li>
<li>Skipping resize and relying on compression alone to hit a target file size — you'll sacrifice far more visible quality than necessary.</li>
</ul>

<h2>Conclusion</h2>
<p>Good compression is a sequence of small, correct decisions — right format, right size, right quality level — not a single magic setting. Get those three right and you'll cut file size dramatically with zero visible difference.</p>
`,
  },
  {
    title: 'JSON Formatter Guide: How to Validate, Beautify, and Minify JSON',
    slug: 'json-formatter-guide-validate-beautify-minify',
    category: 'developer',
    tags: ['json', 'developer tools', 'debugging'],
    excerpt: 'A messy, unindented JSON blob is unreadable and easy to break. Here\'s how formatting, validation, and minification each solve a different problem.',
    seoTitle: 'JSON Formatter Guide: Validate, Beautify & Minify JSON | ToolifHub',
    seoDescription: 'Learn the difference between formatting, validating, and minifying JSON, common JSON syntax errors, and how to fix them with a free online JSON formatter.',
    faqs: [
      { question: 'Why does my JSON say "Unexpected token" when it looks fine?', answer: 'The most common cause is a trailing comma after the last item in an object or array — valid in JavaScript object literals, but not valid JSON. Other frequent causes are single quotes instead of double quotes, and unquoted keys.' },
      { question: 'Should I minify JSON before sending it to an API?', answer: 'For API requests, whitespace generally doesn\'t matter to the server — minifying mainly helps when you\'re optimizing payload size over a slow connection or storing many JSON documents. For debugging, always keep it beautified.' },
      { question: 'Does JSON support comments?', answer: 'No. Standard JSON has no comment syntax at all — adding // or /* */ comments will fail validation. If you need comments, you\'re probably looking for JSON5 or a config format like YAML.' },
    ],
    content: `
<p>JSON looks simple until you're staring at a single 4,000-character line with no breaks, trying to find the one missing brace. Three separate operations — formatting, validating, and minifying — solve three separate problems, and mixing them up wastes time.</p>

<h2>Formatting (Beautifying)</h2>
<p>Beautifying adds consistent indentation and line breaks so nested structure is visually obvious. It changes nothing about the data — only how it's displayed. This is what you want whenever a human needs to read the JSON.</p>

<h2>Validating</h2>
<p>Validation checks whether the text is syntactically correct JSON at all. The JSON spec is stricter than most people expect:</p>
<ul>
<li>Keys and string values must use double quotes — single quotes are invalid.</li>
<li>No trailing commas after the last item in an object or array.</li>
<li>No comments of any kind.</li>
<li>Keys must always be quoted strings, never bare identifiers.</li>
</ul>
<p>The "Unexpected token" error from most parsers is usually one of these four issues — check the line number the error reports first.</p>

<h2>Minifying</h2>
<p>Minifying strips every byte that isn't semantically necessary — whitespace, line breaks — producing the smallest possible valid representation. The data is identical; only the byte count changes. Use this when shipping JSON over a network where every byte counts, not when you need to read it.</p>

<h2>Doing All Three at Once</h2>
<p>ToolifHub's <a href="/tools/json-formatter">JSON Formatter &amp; Beautifier</a> validates as you type, beautifies with adjustable indentation, and has a one-click minify toggle — all running locally in your browser, so nothing you paste is ever uploaded anywhere.</p>

<h2>Common Mistakes</h2>
<ul>
<li>Manually deleting commas to "fix" an error without checking which comma is actually the problem — always check the reported line number.</li>
<li>Treating minified JSON as the source of truth during debugging — beautify first, debug, then minify only at the end if needed.</li>
<li>Assuming JavaScript object literal syntax (unquoted keys, trailing commas, single quotes) is valid JSON — it isn't, even though it often looks identical.</li>
</ul>

<h2>Conclusion</h2>
<p>Format for humans, validate for correctness, minify for transport — three different jobs, three different moments to use them. Mixing them up is the most common reason JSON debugging takes longer than it should.</p>
`,
  },
  {
    title: "Meta Title vs Meta Description: What's the Difference and Why It Matters",
    slug: 'meta-title-vs-meta-description',
    category: 'seo',
    tags: ['seo', 'meta tags', 'on-page seo'],
    excerpt: "They show up in the same search snippet, but a meta title and meta description do completely different jobs — confusing them costs you clicks.",
    seoTitle: 'Meta Title vs Meta Description: SEO Differences Explained | ToolifHub',
    seoDescription: 'Understand the real difference between meta title and meta description, how each affects rankings and click-through rate, and how to write both correctly.',
    faqs: [
      { question: 'Does the meta description affect Google rankings?', answer: 'Not directly — Google has confirmed the meta description is not a ranking factor. It matters indirectly: a compelling description improves click-through rate, and click-through behavior is something Google does observe over time.' },
      { question: 'How long should a meta title be?', answer: 'Keep it under roughly 60 characters (about 580 pixels). Longer titles get truncated with an ellipsis in search results, which can cut off your most important keyword or value proposition.' },
      { question: 'Does Google always show the meta description I write?', answer: 'No — Google frequently rewrites the displayed snippet using on-page content if it judges that text to better match the searcher\'s query. Writing a strong description improves the odds it gets used, but doesn\'t guarantee it.' },
    ],
    content: `
<p>Open any Google results page and you'll see a blue clickable line followed by a couple of lines of gray text. Those two pieces — title and description — are written separately, optimized for different goals, and frequently confused with each other.</p>

<h2>What the Meta Title Actually Does</h2>
<p>The meta title (technically the <code>&lt;title&gt;</code> tag) is a direct ranking signal. Google uses it to understand what the page is about, and it's the single most important piece of on-page text for matching a page to a search query. It's also the clickable blue text in results — so it has to do double duty: communicate relevance to the algorithm, and persuade a human to click.</p>

<h2>What the Meta Description Actually Does</h2>
<p>The meta description is <strong>not</strong> a ranking factor — Google has stated this directly. Its entire job is persuasion: convincing someone scanning ten blue links that your result answers their question better than the other nine. A great description increases click-through rate; a great click-through rate is something Google's algorithms do notice over time, which is why description quality matters indirectly even though it isn't a direct signal.</p>

<h2>Writing a Strong Meta Title</h2>
<ul>
<li>Put the primary keyword near the front — both because it's seen first, and because emphasis decays the further a word sits from the start.</li>
<li>Stay under ~60 characters to avoid truncation.</li>
<li>Make every page's title genuinely unique — duplicate titles across pages confuse both users and search engines about which page is the canonical answer.</li>
</ul>

<h2>Writing a Strong Meta Description</h2>
<ul>
<li>Stay within ~150-160 characters.</li>
<li>Lead with the benefit, not a restatement of the title.</li>
<li>Include the keyword naturally — Google bolds matching terms in the snippet, which draws the eye.</li>
<li>End with a reason to click: a number, a promise, or a clear answer to the implied question.</li>
</ul>
<p>ToolifHub's <a href="/tools/meta-title-generator">Meta Title Generator</a> and <a href="/tools/meta-description-generator">Meta Description Generator</a> both check character/pixel width as you type, so you can see exactly where truncation would hit before you publish. The <a href="/tools/serp-preview-tool">SERP Preview Tool</a> shows exactly how both will render in Google's results.</p>

<h2>Common Mistakes</h2>
<ul>
<li>Treating the description as a ranking lever and stuffing it with keywords — it doesn't help rankings and reads poorly to humans.</li>
<li>Writing one generic title/description and reusing it across many pages.</li>
<li>Letting the title run long and get truncated mid-keyword in search results.</li>
</ul>

<h2>Conclusion</h2>
<p>Title earns the click from the algorithm's side; description earns the click from the human's side. Optimize each for its actual job and you'll get both the ranking and the click-through rate you're after.</p>
`,
  },
  {
    title: 'Password Security 101: How to Generate and Manage Strong Passwords',
    slug: 'password-security-101-strong-passwords',
    category: 'security',
    tags: ['password security', 'security', 'privacy'],
    excerpt: "Most password advice focuses on complexity rules that don't actually stop modern attacks. Here's what genuinely makes a password hard to crack.",
    seoTitle: 'Password Security 101: Generate Strong Passwords | ToolifHub',
    seoDescription: 'Learn what actually makes a password secure, why length beats complexity, and how to generate and manage strong, unique passwords for every account.',
    faqs: [
      { question: 'Is a long password always more secure than a complex one?', answer: 'Generally yes. Length increases the number of possible combinations exponentially, while "complexity" rules (forcing symbols, numbers) often just push people toward predictable substitutions like "P@ssw0rd1" that crackers already account for.' },
      { question: 'How often should I change my passwords?', answer: 'Modern guidance (including NIST) has moved away from mandatory periodic changes for passwords that haven\'t been compromised — frequent forced changes tend to make people choose weaker, more predictable passwords. Change a password immediately if a service is breached; otherwise, a strong unique password doesn\'t need routine rotation.' },
      { question: 'Is it safe to use a password manager?', answer: 'Yes, and it\'s the single biggest practical security improvement most people can make. A reputable password manager lets you use a unique, long, random password for every account without memorizing any of them — the realistic alternative is reusing passwords, which is far riskier.' },
    ],
    content: `
<p>"Use a mix of uppercase, lowercase, numbers, and symbols" is the most repeated password advice on the internet — and it's a weaker signal of real security than most people assume.</p>

<h2>Why Length Beats Complexity</h2>
<p>Password cracking is fundamentally a math problem: how many possible combinations does an attacker have to try? Every extra character multiplies the search space; every extra allowed symbol type adds far less. A 16-character password using just lowercase letters has roughly 26^16 possible combinations — astronomically more than an 8-character password with the full character set, even though the 8-character one "looks" more complex.</p>
<p>This is why modern security guidance (including NIST's) emphasizes length over forced complexity rules. Complexity requirements often backfire — people respond predictably, swapping "a" for "@" or appending "1!" to a familiar word, patterns that cracking tools already account for.</p>

<h2>What Actually Makes a Password Strong</h2>
<ul>
<li><strong>Length:</strong> aim for 16+ characters where the service allows it.</li>
<li><strong>Randomness:</strong> a password should not be derivable from your name, birthday, or a dictionary word — true randomness beats clever patterns every time.</li>
<li><strong>Uniqueness:</strong> the single biggest real-world risk isn't a weak password being cracked — it's a password being reused across multiple sites, then leaked from one breach and tried everywhere else (called credential stuffing).</li>
</ul>

<h2>A Realistic Workflow</h2>
<ol>
<li>Use a password manager so you never have to remember individual passwords — this is what makes "a unique password for every account" actually achievable.</li>
<li>Generate passwords with a proper random generator rather than inventing them yourself — humans are bad at being random, even when trying. Try ToolifHub's <a href="/tools/password-generator">Password Generator</a>.</li>
<li>Enable two-factor authentication anywhere it's offered — it stops most account takeovers even if a password does leak.</li>
<li>Change a password immediately if the service it belongs to reports a breach; otherwise there's no need for routine rotation (see the FAQ).</li>
</ol>

<h2>Common Mistakes</h2>
<ul>
<li>Reusing the same password (or close variations of it) across multiple accounts.</li>
<li>Relying on memorable substitution patterns ("P@ssw0rd123") that cracking dictionaries already include.</li>
<li>Storing passwords in a plain text file or browser autofill without a master-password-protected manager.</li>
</ul>

<h2>Conclusion</h2>
<p>Real password security comes down to three things: long, random, and unique per account — a password manager plus a proper generator gets you all three without requiring you to memorize anything.</p>
`,
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log(`Connected to ${DATABASE_NAME}`);

  let created = 0;
  let skipped = 0;

  for (const post of POSTS) {
    const exists = await Blog.findOne({ slug: post.slug }).lean();
    if (exists) {
      console.log(`SKIP (exists): ${post.slug}`);
      skipped += 1;
      continue;
    }
    await Blog.create(post);
    console.log(`CREATED: ${post.slug}`);
    created += 1;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
