import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Blog from '@/models/Blog';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ToolsSection from '@/components/home/ToolsSection';
import BlogPreview from '@/components/home/BlogPreview';
import Newsletter from '@/components/home/Newsletter';
import HeaderAd from '@/components/ads/HeaderAd';
import FooterAd from '@/components/ads/FooterAd';
import JsonLd, { buildOrganizationSchema, buildWebSiteSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { SITE_NAME } from '@/lib/seo/constants';

export const metadata = buildPageMetadata({
  title: `${SITE_NAME} — One Hub. Unlimited Tools.`,
  description:
    'Free online tools for YouTube, SEO, developers, AI, productivity and more. 500+ tools — no sign-up required.',
  path: '/',
  keywords: ['free online tools', 'youtube tools', 'seo tools', 'developer tools', 'ai tools'],
  absoluteTitle: true,
});

async function getData() {
  try {
    await connectDB();
    const [categoriesWithCounts, featuredTools, trendingTools, recentTools, blogs] = await Promise.all([
      getVisibleCategoriesWithCounts({ featuredOnly: true, limit: 10 }),
      Tool.find({ featured: true, status: 'active' })
        .populate('category', 'name slug')
        .sort({ views: -1 })
        .limit(8)
        .lean(),
      Tool.find({ trending: true, status: 'active' })
        .populate('category', 'name slug')
        .sort({ views: -1 })
        .limit(8)
        .lean(),
      Tool.find({ status: 'active' })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Blog.find({ status: 'published' })
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),
    ]);

    return { categories: categoriesWithCounts, featuredTools, trendingTools, recentTools, blogs };
  } catch (e) {
    console.error('Home page data error:', e);
    return { categories: [], featuredTools: [], trendingTools: [], recentTools: [], blogs: [] };
  }
}

export default async function HomePage() {
  const { categories, featuredTools, trendingTools, recentTools, blogs } = await getData();

  return (
    <>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />

      <Hero />
      <HeaderAd />
      <FeaturedCategories categories={categories} />
      {featuredTools.length > 0 && (
        <ToolsSection title="Featured Tools" badge="Editor's Pick" tools={featuredTools} viewAllHref="/categories" />
      )}
      {trendingTools.length > 0 && (
        <ToolsSection title="Trending Now" badge="🔥 Hot" subtitle="Most used tools this week" tools={trendingTools} viewAllHref="/categories" />
      )}
      {recentTools.length > 0 && (
        <ToolsSection title="Recently Added" badge="New" tools={recentTools} viewAllHref="/categories" />
      )}
      <BlogPreview blogs={blogs} />
      <Newsletter />
      <FooterAd />
    </>
  );
}
