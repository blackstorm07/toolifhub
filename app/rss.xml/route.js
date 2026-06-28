import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  await connectDB();
  const posts = await Blog.find(publishedBlogFilter())
    .select('title slug excerpt publishedAt updatedAt')
    .sort({ publishedAt: -1 })
    .limit(50)
    .lean();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const date = new Date(post.publishedAt || post.updatedAt).toUTCString();
      return `<item>
<title>${escapeXml(post.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${date}</pubDate>
<description>${escapeXml(post.excerpt || '')}</description>
</item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(SITE_NAME)} Blog</title>
<link>${SITE_URL}/blog</link>
<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
<description>Tips, tutorials, and guides from the ${escapeXml(SITE_NAME)} blog.</description>
<language>en-us</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
