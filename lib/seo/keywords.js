// Content-derived keyword generation for <meta name="keywords"> and OG/Twitter
// fallbacks. These are natural phrase variants built from the page's own
// title/category/topic — never generic filler reused across unrelated pages,
// and never repeated modifiers stacked into one phrase (no keyword stuffing).
//
// Each generator covers the full intent spread Google's guidance expects on
// a single page (15-20 terms): primary, secondary, long-tail, question-based,
// transactional, informational, brand, and intent-based variants — derived
// only from the page's own real title/description/category, so two
// unrelated pages never end up with the same list.

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

/** Pull 1-2 meaningful, non-redundant nouns out of free text (e.g. a short
 * description) to widen keyword coverage without inventing unrelated terms. */
function topicWords(text, base, count = 2) {
  return clean(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !base.includes(w))
    .slice(0, count);
}

/**
 * Tool pages: "GST Calculator" → 15-20 unique variants spanning primary,
 * secondary, long-tail, question-based, transactional, informational, brand,
 * and intent-based phrasing — all anchored to the tool's own name/category.
 */
export function generateToolKeywords({ title, shortDescription = '', categoryName = '', isIndiaOnly = false }) {
  const name = clean(title);
  if (!name) return [];
  const base = name.toLowerCase();
  const category = clean(categoryName).toLowerCase();
  const [mod1, mod2] = topicWords(shortDescription, base);

  const variants = [
    base, // primary
    `${base} online`, // secondary
    `free ${base}`, // secondary
    `${base} tool`, // secondary
    `online ${base} tool`, // secondary
    `best ${base}`, // secondary
    `${base} no sign up`, // long-tail
    `free online ${base}`, // long-tail
    `how to use ${base}`, // question-based
    `what is ${base}`, // question-based
    `try ${base} free`, // transactional
    `use ${base} online free`, // transactional
    `${base} for beginners`, // intent-based
    `${base} for professionals`, // intent-based
    `${base} guide`, // informational
    `ToolifHub ${base}`, // brand
    `${base} ToolifHub`, // brand
  ];

  if (isIndiaOnly) variants.push(`${base} india`, `${base} for indian users`);
  if (mod1) variants.push(`${base} ${mod1}`);
  if (mod2) variants.push(`${base} ${mod2} tool`);
  if (category) variants.push(`best ${category} tool`, `${category} online`);

  return dedupe(variants).slice(0, 20);
}

/**
 * Blog posts: derive from title + existing tags, plus guide/question/intent
 * variants matched to the actual topic words in the title.
 */
export function generateBlogKeywords({ title, tags = [] }) {
  const name = clean(title);
  if (!name) return dedupe(tags).slice(0, 20);
  const base = name.toLowerCase().replace(/[:|–-].*$/, '').trim();
  const shortBase = base.split(' ').length <= 6;

  const variants = [
    base,
    ...tags.map((t) => clean(t).toLowerCase()),
    `${base} guide`,
    `${base} tips`,
    `how to ${base.replace(/^how to /, '')}`,
    `best ${base}`,
    `${base} for beginners`,
    `${base} 2026`,
    `${base} explained`,
    `${base} tutorial`,
    `ToolifHub blog`,
    `free ${base} guide`,
  ];

  if (shortBase) {
    variants.push(`what is ${base}`, `why ${base} matters`, `${base} step by step`);
  }

  return dedupe(variants).slice(0, 20);
}

/**
 * Category pages: "SEO Tools" → 15-20 variants spanning primary, secondary,
 * long-tail, question-based, transactional, informational, brand, and
 * intent-based phrasing — anchored to the category's own name/description.
 */
export function generateCategoryKeywords({ name, description = '' }) {
  const catName = clean(name);
  if (!catName) return [];
  const base = catName.toLowerCase();
  const [mod1, mod2] = topicWords(description, base);

  const variants = [
    base, // primary
    `free ${base}`, // secondary
    `${base} online`, // secondary
    `best ${base}`, // secondary
    `${base} for free`, // long-tail
    `free online ${base}`, // long-tail
    `top ${base}`, // long-tail
    `what are ${base}`, // question-based
    `how to use ${base}`, // question-based
    `use ${base} online free`, // transactional
    `try ${base} free`, // transactional
    `${base} for beginners`, // intent-based
    `${base} for professionals`, // intent-based
    `${base} guide`, // informational
    `${base} list`, // informational
    `ToolifHub ${base}`, // brand
    `${base} collection`, // related
  ];

  if (mod1) variants.push(`${base} for ${mod1}`);
  if (mod2) variants.push(`${base} ${mod2}`);

  return dedupe(variants).slice(0, 20);
}
