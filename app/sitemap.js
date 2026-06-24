import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Blog from '@/models/Blog';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function sitemap() {
  try {
    await connectDB();

    const [tools, categories, blogs] = await Promise.all([
      Tool.find({ status: 'active' }).select('slug updatedAt').lean(),
      getVisibleCategoriesWithCounts(),
      Blog.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);

    const staticPages = [
      { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${APP_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
      { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${APP_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
      { url: `${APP_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    const toolPages = tools.map((t) => ({
      url: `${APP_URL}/tools/${t.slug}`,
      lastModified: t.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categoryPages = categories.map((c) => ({
      url: `${APP_URL}/category/${c.slug}`,
      lastModified: c.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const blogPages = blogs.map((b) => ({
      url: `${APP_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticPages, ...toolPages, ...categoryPages, ...blogPages];
  } catch (e) {
    return [{ url: APP_URL, lastModified: new Date() }];
  }
}
