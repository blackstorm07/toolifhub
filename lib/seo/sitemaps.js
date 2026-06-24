import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Blog from '@/models/Blog';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
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

function urlEntry(loc, lastmod, changefreq, priority) {
  const lastmodTag = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '';
  const changefreqTag = changefreq ? `<changefreq>${changefreq}</changefreq>` : '';
  const priorityTag = priority !== undefined ? `<priority>${priority}</priority>` : '';
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}${changefreqTag}${priorityTag}</url>`;
}

function wrapUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`;
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
  const tools = await Tool.find({ status: 'active' }).select('slug updatedAt').lean();
  const entries = tools.map((t) =>
    urlEntry(`${SITE_URL}/tools/${t.slug}`, t.updatedAt, 'weekly', 0.8)
  );
  return wrapUrlset(entries);
}

export async function generateCategoriesSitemap() {
  await connectDB();
  const categories = await getVisibleCategoriesWithCounts();
  const entries = categories.map((c) =>
    urlEntry(`${SITE_URL}/category/${c.slug}`, c.updatedAt, 'weekly', 0.7)
  );
  return wrapUrlset(entries);
}

export async function generateBlogSitemap() {
  await connectDB();
  const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt publishedAt').lean();
  const entries = blogs.map((b) =>
    urlEntry(`${SITE_URL}/blog/${b.slug}`, b.updatedAt || b.publishedAt, 'monthly', 0.6)
  );
  return wrapUrlset(entries);
}
