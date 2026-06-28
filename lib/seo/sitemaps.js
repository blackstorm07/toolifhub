import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Category from '@/models/Category';
import Blog from '@/models/Blog';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
import { worldwideOnlyMongoFilter, DEFAULT_VISIBILITY } from '@/lib/visibility';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';
import { BLOG_CATEGORIES } from '@/lib/blog/categories';
import { SITE_URL } from './constants';
import { BEST_OF_ROUTES } from './categoryContent';

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod, changefreq, priority, imageUrl) {
  const lastmodTag = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '';
  const changefreqTag = changefreq ? `<changefreq>${changefreq}</changefreq>` : '';
  const priorityTag = priority !== undefined ? `<priority>${priority}</priority>` : '';
  const imageTag = imageUrl
    ? `<image:image><image:loc>${escapeXml(imageUrl)}</image:loc></image:image>`
    : '';
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}${changefreqTag}${priorityTag}${imageTag}</url>`;
}

function wrapUrlset(entries, withImageNamespace = false) {
  const imageNs = withImageNamespace ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '';
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>${entries.join('')}</urlset>`;
}

function wrapSitemapIndex(sitemaps) {
  const entries = sitemaps
    .map(
      (s) =>
        `<sitemap><loc>${escapeXml(s.loc)}</loc><lastmod>${new Date(s.lastmod).toISOString()}</lastmod></sitemap>`
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;
}

export async function generateSitemapIndex() {
  const now = new Date();
  return wrapSitemapIndex([
    { loc: `${SITE_URL}/sitemap-static.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-tools.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-categories.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-blog.xml`, lastmod: now },
  ]);
}

export async function generateStaticSitemap() {
  const now = new Date();
  const staticPaths = [
    { path: '/', priority: 1, changefreq: 'daily' },
    { path: '/categories', priority: 0.9, changefreq: 'weekly' },
    { path: '/blog', priority: 0.7, changefreq: 'weekly' },
    { path: '/about', priority: 0.5, changefreq: 'monthly' },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
    { path: '/terms-and-conditions', priority: 0.3, changefreq: 'yearly' },
    { path: '/disclaimer', priority: 0.3, changefreq: 'yearly' },
    { path: '/cookie-policy', priority: 0.3, changefreq: 'yearly' },
    ...Object.keys(BEST_OF_ROUTES).map((route) => ({
      path: `/${route}`,
      priority: 0.85,
      changefreq: 'weekly',
    })),
  ];

  const entries = staticPaths.map((p) =>
    urlEntry(`${SITE_URL}${p.path}`, now, p.changefreq, p.priority)
  );
  return wrapUrlset(entries);
}

export async function generateToolsSitemap() {
  await connectDB();
  // A sitemap is a single, unpersonalized response — only fully worldwide
  // tools belong in it. A tool in a non-worldwide category is excluded too,
  // since category visibility overrides tool visibility.
  const restrictedCategories = await Category.find({ visibility: { $ne: DEFAULT_VISIBILITY } })
    .select('_id')
    .lean();
  const tools = await Tool.find({
    status: 'active',
    ...worldwideOnlyMongoFilter(),
    category: { $nin: restrictedCategories.map((c) => c._id) },
  })
    .select('slug title updatedAt')
    .lean();
  const entries = tools.map((t) =>
    urlEntry(
      `${SITE_URL}/tools/${t.slug}`,
      t.updatedAt,
      'weekly',
      0.8,
      `${SITE_URL}/api/og?title=${encodeURIComponent(t.title)}&subtitle=${encodeURIComponent('Free Online Tool')}`
    )
  );
  return wrapUrlset(entries, true);
}

export async function generateCategoriesSitemap() {
  await connectDB();
  // Same rule as above: only worldwide categories appear in the sitemap.
  const categories = await getVisibleCategoriesWithCounts({ extraMatch: worldwideOnlyMongoFilter() });
  const entries = categories.map((c) =>
    urlEntry(`${SITE_URL}/category/${c.slug}`, c.updatedAt, 'weekly', 0.7)
  );
  return wrapUrlset(entries);
}

export async function generateBlogSitemap() {
  await connectDB();
  const blogs = await Blog.find(publishedBlogFilter())
    .select('slug title updatedAt publishedAt featuredImage tags category')
    .lean();
  const now = new Date();

  const postEntries = blogs.map((b) =>
    urlEntry(
      `${SITE_URL}/blog/${b.slug}`,
      b.updatedAt || b.publishedAt,
      'monthly',
      0.6,
      b.featuredImage ||
        `${SITE_URL}/api/og?title=${encodeURIComponent(b.title)}&subtitle=${encodeURIComponent('ToolifHub Blog')}`
    )
  );

  // Only list category/tag pages that actually have at least one post —
  // an empty taxonomy page is thin content and shouldn't be in the sitemap.
  const usedCategories = new Set(blogs.map((b) => b.category).filter(Boolean));
  const usedTags = new Set(blogs.flatMap((b) => b.tags || []));

  const categoryEntries = BLOG_CATEGORIES.filter((c) => usedCategories.has(c.slug)).map((c) =>
    urlEntry(`${SITE_URL}/blog/category/${c.slug}`, now, 'weekly', 0.5)
  );
  const tagEntries = [...usedTags].map((tag) =>
    urlEntry(`${SITE_URL}/blog/tag/${encodeURIComponent(tag)}`, now, 'weekly', 0.4)
  );

  return wrapUrlset([...postEntries, ...categoryEntries, ...tagEntries], true);
}
