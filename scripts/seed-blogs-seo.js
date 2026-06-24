/**
 * Seeds SEO blog posts for ToolifHub (non-destructive).
 * Run: node scripts/seed-blogs-seo.js
 * Requires .env.local with MONGODB_URI and an existing admin user.
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({ name: String, email: String, role: String });
const BlogSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true }, content: String, excerpt: String,
  featuredImage: String, author: mongoose.Schema.Types.ObjectId, tags: [String],
  status: String, featured: Boolean, seoTitle: String, seoDescription: String, publishedAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const BLOGS = [
  {
    title: 'Best AI Tools in 2026: Complete Guide for Every Workflow',
    slug: 'best-ai-tools-in-2026',
    excerpt: 'A comprehensive guide to the best free AI tools in 2026 — writing, coding, SEO, productivity, and more. Discover curated picks on ToolifHub.',
    tags: ['ai tools', 'artificial intelligence', 'productivity', 'software'],
    featured: true,
    seoTitle: 'Best AI Tools in 2026 — Complete Guide | ToolifHub',
    seoDescription: 'Discover the best AI tools in 2026 for writing, coding, marketing, and productivity. Free curated guide with internal links to ToolifHub tools.',
    content: `<p>Artificial intelligence has become essential for modern work. From content creation to code generation, AI tools help professionals accomplish more in less time. This guide covers the best AI tools available on <a href="/best-ai-tools">ToolifHub</a> and how to choose the right ones for your workflow.</p>
<h2>Why AI Tools Matter in 2026</h2>
<p>Businesses, creators, and developers rely on AI to automate repetitive tasks, generate ideas, and improve output quality. The challenge is not a lack of tools — it is finding reliable, free options that deliver real value.</p>
<h2>Top AI Tool Categories</h2>
<ul>
<li><strong>Writing & Content</strong> — Generate blog posts, social captions, and marketing copy</li>
<li><strong>Code & Development</strong> — Format, debug, and optimize code faster</li>
<li><strong>SEO & Marketing</strong> — Use our <a href="/category/seo-tools">SEO tools</a> for keyword research and meta tag generation</li>
<li><strong>Productivity</strong> — Automate workflows with <a href="/best-productivity-tools">productivity tools</a></li>
</ul>
<h2>How to Choose the Right AI Tool</h2>
<p>Evaluate tools based on ease of use, privacy, speed, and integration with your existing workflow. ToolifHub lets you try multiple AI utilities instantly without sign-up.</p>
<h2>Getting Started</h2>
<p>Browse our <a href="/category/ai-tools">AI Tools category</a> or read our <a href="/blog/best-seo-tools-for-marketers">SEO tools guide</a> for marketers. Start with one tool, master it, then expand your toolkit.</p>
<h2>Conclusion</h2>
<p>The best AI strategy combines multiple specialized tools. ToolifHub centralizes discovery so you spend less time searching and more time creating.</p>`,
  },
  {
    title: 'Best SEO Tools for Marketers: Free Tools That Actually Work',
    slug: 'best-seo-tools-for-marketers',
    excerpt: 'The best free SEO tools for digital marketers — keyword research, meta tags, SERP preview, and technical SEO. All available on ToolifHub.',
    tags: ['seo', 'marketing', 'keyword research', 'search engine optimization'],
    featured: true,
    seoTitle: 'Best SEO Tools for Marketers — Free Guide | ToolifHub',
    seoDescription: 'Discover the best free SEO tools for marketers. Keyword research, meta tag generators, SERP preview, and more on ToolifHub.',
    content: `<p>Search engine optimization drives sustainable organic traffic. This guide highlights the best free <a href="/best-seo-tools">SEO tools on ToolifHub</a> that marketers use daily for on-page optimization, keyword research, and content strategy.</p>
<h2>Essential SEO Tools for Every Marketer</h2>
<ul>
<li><a href="/tools/meta-title-generator">Meta Title Generator</a> — Create optimized title tags under 60 characters</li>
<li><a href="/tools/meta-description-generator">Meta Description Generator</a> — Write compelling descriptions that improve CTR</li>
<li><a href="/tools/serp-preview-tool">SERP Preview Tool</a> — Preview Google snippets before publishing</li>
<li><a href="/tools/keyword-density-checker">Keyword Density Checker</a> — Avoid over-optimization</li>
<li><a href="/tools/open-graph-tag-generator">Open Graph Generator</a> — Optimize social sharing previews</li>
</ul>
<h2>SEO Workflow for Content Teams</h2>
<p>Start with keyword research using our <a href="/tools/keyword-suggestion-tool">Keyword Suggestion Tool</a>. Generate meta tags, preview SERP appearance, then publish. Use <a href="/category/seo-tools">all SEO tools</a> together for a complete workflow.</p>
<h2>On-Page SEO Best Practices</h2>
<p>Place primary keywords near the beginning of titles. Keep descriptions under 160 characters. Use proper heading hierarchy and internal links between related pages and tools.</p>
<h2>Conclusion</h2>
<p>Professional SEO does not require expensive subscriptions. ToolifHub provides marketer-grade SEO utilities for free. Explore our <a href="/blog/best-ai-tools-in-2026">AI tools guide</a> to combine AI with SEO for faster content production.</p>`,
  },
  {
    title: 'Top Developer Tools Every Programmer Should Use',
    slug: 'top-developer-tools-every-programmer-should-use',
    excerpt: 'Essential free developer tools for JSON formatting, Base64 encoding, UUID generation, hashing, and code minification on ToolifHub.',
    tags: ['developer', 'programming', 'code', 'javascript'],
    featured: false,
    seoTitle: 'Top Developer Tools Every Programmer Should Use | ToolifHub',
    seoDescription: 'Free developer tools for JSON, Base64, UUID, hashing, and minification. Essential utilities every programmer should bookmark on ToolifHub.',
    content: `<p>Developers constantly need quick utilities for data formatting, encoding, and generation. Bookmark these essential <a href="/best-developer-tools">developer tools on ToolifHub</a> for instant access during coding sessions.</p>
<h2>Must-Have Developer Tools</h2>
<ul>
<li><a href="/tools/json-formatter">JSON Formatter</a> — Beautify and validate API responses</li>
<li><a href="/tools/base64-tool">Base64 Encoder/Decoder</a> — Encode data for APIs and transfers</li>
<li><a href="/tools/uuid-generator">UUID Generator</a> — Create unique identifiers for databases</li>
<li><a href="/tools/hash-generator">Hash Generator</a> — MD5, SHA-256 for integrity checks</li>
<li><a href="/tools/js-minifier">JS Minifier</a> — Compress JavaScript for production</li>
<li><a href="/tools/css-minifier">CSS Minifier</a> — Reduce stylesheet file sizes</li>
</ul>
<h2>When to Use Browser-Based Dev Tools</h2>
<p>Browser tools excel for quick one-off tasks, pair programming, and machines where you cannot install CLI utilities. They complement your IDE without replacing it.</p>
<h2>Privacy and Security</h2>
<p>Most ToolifHub developer tools process data locally in your browser. Never paste production secrets into any online tool without understanding its data handling.</p>
<h2>Explore More</h2>
<p>Browse all <a href="/category/developer-tools">developer tools</a> or check our <a href="/blog/best-seo-tools-for-marketers">SEO tools for marketers</a> if you build content-focused applications.</p>`,
  },
  {
    title: 'Best Free Productivity Tools to Work Smarter in 2026',
    slug: 'best-free-productivity-tools-2026',
    excerpt: 'Discover the best free productivity tools for task management, focus, writing, and workflow automation on ToolifHub.',
    tags: ['productivity', 'workflow', 'efficiency', 'focus'],
    featured: false,
    seoTitle: 'Best Free Productivity Tools in 2026 | ToolifHub',
    seoDescription: 'Free productivity tools for focus, writing, calculations, and workflow automation. Work smarter with ToolifHub productivity utilities.',
    content: `<p>Productivity is about eliminating friction. ToolifHub offers free <a href="/best-productivity-tools">productivity tools</a> that help you accomplish more without expensive app subscriptions.</p>
<h2>Productivity Tools by Use Case</h2>
<ul>
<li><strong>Writing</strong> — <a href="/tools/word-counter">Word Counter</a>, <a href="/tools/case-converter">Case Converter</a>, <a href="/tools/lorem-ipsum-generator">Lorem Ipsum Generator</a></li>
<li><strong>Calculations</strong> — <a href="/category/calculators">Calculators</a> for EMI, BMI, GST, and percentages</li>
<li><strong>Text Processing</strong> — <a href="/category/text-tools">Text tools</a> for formatting and transformation</li>
<li><strong>AI Assistance</strong> — Combine with <a href="/category/ai-tools">AI tools</a> for automated workflows</li>
</ul>
<h2>Building Your Productivity Stack</h2>
<p>Start with text and calculation tools for daily tasks. Add AI tools for content generation. Use YouTube and SEO tools if you create content for audiences.</p>
<h2>Remote Work Productivity</h2>
<p>Distributed teams benefit from shareable browser tools — send a link to a teammate for consistent formatting and calculations across the team.</p>
<h2>Conclusion</h2>
<p>Explore our full <a href="/category/productivity-tools">productivity category</a> and read <a href="/blog/how-ai-tools-improve-business-growth">how AI tools improve business growth</a> for strategic insights.</p>`,
  },
  {
    title: 'How AI Tools Improve Business Growth in 2026',
    slug: 'how-ai-tools-improve-business-growth',
    excerpt: 'Learn how AI tools drive business growth through automation, cost reduction, and faster decision-making. Practical strategies with ToolifHub.',
    tags: ['ai tools', 'business growth', 'automation', 'productivity'],
    featured: true,
    seoTitle: 'How AI Tools Improve Business Growth — 2026 Guide | ToolifHub',
    seoDescription: 'Discover how AI tools improve business growth through automation, efficiency, and smarter workflows. Practical guide with ToolifHub tool recommendations.',
    content: `<p>Businesses that adopt AI tools gain measurable advantages in speed, cost efficiency, and output quality. This guide explains how to leverage <a href="/best-ai-tools">AI tools on ToolifHub</a> for sustainable business growth.</p>
<h2>AI Drives Growth Through Automation</h2>
<p>Repetitive tasks consume 30-40% of knowledge workers' time. AI tools automate content drafting, data formatting, SEO optimization, and code generation — freeing teams for high-value strategic work.</p>
<h2>Cost Reduction Without Quality Loss</h2>
<p>Free tools on ToolifHub replace paid subscriptions for many common tasks. Use our <a href="/category/seo-tools">SEO tools</a> instead of $99/month platforms for on-page optimization. Use <a href="/category/developer-tools">developer tools</a> instead of IDE plugin subscriptions.</p>
<h2>Faster Time to Market</h2>
<p>Startups and small businesses use AI writing tools and meta tag generators to launch marketing pages faster. YouTube creators use <a href="/best-youtube-tools">YouTube tools</a> to optimize metadata and grow channels organically.</p>
<h2>Practical Implementation Steps</h2>
<ol>
<li>Audit repetitive tasks in your workflow</li>
<li>Match tasks to ToolifHub tool categories</li>
<li>Train your team on 2-3 core tools first</li>
<li>Measure time saved and reinvest in growth activities</li>
<li>Scale to additional tools as needs evolve</li>
</ol>
<h2>Combining AI with SEO for Growth</h2>
<p>AI-generated content still needs SEO optimization. Use our <a href="/blog/best-seo-tools-for-marketers">SEO tools guide</a> alongside AI writing tools for content that ranks and converts.</p>
<h2>Conclusion</h2>
<p>AI tools are not a luxury — they are a competitive necessity in 2026. ToolifHub provides the free infrastructure to start your AI-powered growth strategy today.</p>`,
  },
];

async function run() {
  console.log('🌱 Seeding SEO blog posts...\n');
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌ No admin user found. Run npm run seed first.');
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const blog of BLOGS) {
    const exists = await Blog.findOne({ slug: blog.slug });
    if (exists) {
      console.log(`~ Skipped: ${blog.slug}`);
      skipped++;
      continue;
    }
    await Blog.create({
      ...blog,
      author: admin._id,
      status: 'published',
      publishedAt: new Date(),
    });
    console.log(`+ Created: ${blog.title}`);
    created++;
  }

  console.log(`\n✅ Done. Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
