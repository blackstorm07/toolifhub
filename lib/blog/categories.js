// Blog content topics — distinct from the Tool/Category model (a blog post
// about "AI" isn't the same taxonomy as the AI Tools product category), so
// this is its own small static list rather than reusing lib/categories.js.
export const BLOG_CATEGORIES = [
  { slug: 'ai', name: 'AI' },
  { slug: 'seo', name: 'SEO' },
  { slug: 'developer', name: 'Developer' },
  { slug: 'pdf', name: 'PDF' },
  { slug: 'image', name: 'Image' },
  { slug: 'text', name: 'Text' },
  { slug: 'youtube', name: 'YouTube' },
  { slug: 'programming', name: 'Programming' },
  { slug: 'productivity', name: 'Productivity' },
  { slug: 'calculators', name: 'Calculators' },
  { slug: 'security', name: 'Security' },
  { slug: 'converters', name: 'Converters' },
  { slug: 'utilities', name: 'Utilities' },
  { slug: 'marketing', name: 'Marketing' },
];

export function getBlogCategoryName(slug) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)?.name || slug;
}

export function isValidBlogCategory(slug) {
  return BLOG_CATEGORIES.some((c) => c.slug === slug);
}
