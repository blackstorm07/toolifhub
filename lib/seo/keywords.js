// Content-derived keyword generation for <meta name="keywords"> and OG/Twitter
// fallbacks. These are natural phrase variants built from the page's own
// title/category/topic — never generic filler reused across unrelated pages,
// and never repeated modifiers stacked into one phrase (no keyword stuffing).

function clean(str = '') {
  return String(str).trim();
}

function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = item.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}

/**
 * Tool pages: "GST Calculator" → gst calculator, gst calculator online,
 * free gst calculator, gst calculator india (only if relevant), gst tool, etc.
 * Capped to keep it tight and on-topic — no unrelated category stuffing.
 */
export function generateToolKeywords({ title, shortDescription = '', categoryName = '', isIndiaOnly = false }) {
  const name = clean(title);
  if (!name) return [];
  const base = name.toLowerCase();

  const variants = [
    base,
    `${base} online`,
    `free ${base}`,
    `${base} tool`,
    `online ${base} tool`,
  ];

  if (isIndiaOnly) variants.push(`${base} india`);

  // Pull one or two meaningful nouns out of the short description (e.g. "tax",
  // "converter", "generator") to widen coverage without inventing unrelated terms.
  const descWords = clean(shortDescription)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !base.includes(w));
  const descModifier = descWords[0];
  if (descModifier) variants.push(`${base} ${descModifier}`);

  if (categoryName) variants.push(`best ${clean(categoryName).toLowerCase()} tool`);

  return dedupe(variants).slice(0, 8);
}

/**
 * Blog posts: derive from title + existing tags, plus a "guide"/"tips" variant
 * matched to the actual topic words in the title (not a fixed suffix list).
 */
export function generateBlogKeywords({ title, tags = [] }) {
  const name = clean(title);
  if (!name) return dedupe(tags).slice(0, 8);
  const base = name.toLowerCase().replace(/[:|–-].*$/, '').trim();

  const variants = [base, ...tags.map((t) => clean(t).toLowerCase())];
  if (base.split(' ').length <= 5) {
    variants.push(`${base} guide`);
  }

  return dedupe(variants).slice(0, 8);
}

/**
 * Category pages: "SEO Tools" → seo tools, free seo tools online, best seo
 * tools, seo tools for [use case derived from description].
 */
export function generateCategoryKeywords({ name, description = '' }) {
  const catName = clean(name);
  if (!catName) return [];
  const base = catName.toLowerCase();

  const variants = [base, `free ${base}`, `${base} online`, `best ${base}`];

  const descWords = clean(description)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !base.includes(w));
  if (descWords[0]) variants.push(`${base} for ${descWords[0]}`);

  return dedupe(variants).slice(0, 8);
}
