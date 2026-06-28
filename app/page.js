import dynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Blog from '@/models/Blog';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
import { getRequestCountry } from '@/lib/geo';
import { canViewTool, visibilityMongoFilter, isIndiaUser } from '@/lib/visibility';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';
import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ToolsSection from '@/components/home/ToolsSection';
import BlogPreview from '@/components/home/BlogPreview';

// Below-the-fold form with its own client JS — content is still
// server-rendered (ssr: true) for SEO/no layout shift, but its JS chunk is
// split out of the main bundle instead of shipping on the critical path.
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), { ssr: true });
import HomepageContentAd from '@/components/ads/HomepageContentAd';
import { Award, Flame, Sparkles } from 'lucide-react';
import JsonLd, { buildOrganizationSchema, buildWebSiteSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { SITE_NAME } from '@/lib/seo/constants';
import { serializeDoc } from '@/lib/serialize';
import { HOMEPAGE_KEYWORDS } from '@/lib/seo/keywordStrategy';

export const metadata = buildPageMetadata({
  title: `${SITE_NAME} — One Hub. Unlimited Tools.`,
  description:
    'Free online tools for YouTube, SEO, developers, AI, productivity and more. 50+ tools — no sign-up required.',
  path: '/',
  keywords: HOMEPAGE_KEYWORDS,
  absoluteTitle: true,
});

// Only two visibility buckets exist (India vs everyone else — see
// lib/visibility.js), so the expensive DB reads are cached per-bucket
// instead of per-request. This removes the Mongo round trip from the
// critical path on cache hits, which is the dominant factor in TTFB/LCP
// since every page previously called headers() (via getRequestCountry)
// and re-queried on every single request.
const getCachedHomeData = unstable_cache(
  async (bucket) => fetchHomeData(bucket),
  ['home-data'],
  { revalidate: 120, tags: ['home'] }
);

async function fetchHomeData(country) {
  try {
    await connectDB();
    const countryFilter = visibilityMongoFilter(country);
    // Over-fetch since some results get dropped by the category-override
    // check (a worldwide tool inside an india_only category) that can't be
    // expressed in the Mongo filter alone, then trim back to the page limit.
    const [categoriesWithCounts, featuredToolsRaw, trendingToolsRaw, recentToolsRaw, blogs] = await Promise.all([
      getVisibleCategoriesWithCounts({ featuredOnly: true, limit: 10, country }),
      Tool.find({ featured: true, status: 'active', ...countryFilter })
        .populate('category', 'name slug visibility')
        .sort({ views: -1 })
        .limit(16)
        .lean(),
      Tool.find({ trending: true, status: 'active', ...countryFilter })
        .populate('category', 'name slug visibility')
        .sort({ views: -1 })
        .limit(16)
        .lean(),
      Tool.find({ status: 'active', ...countryFilter })
        .populate('category', 'name slug visibility')
        .sort({ createdAt: -1 })
        .limit(16)
        .lean(),
      Blog.find(publishedBlogFilter())
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),
    ]);

    const featuredTools = featuredToolsRaw.filter((t) => canViewTool(t, t.category, country)).slice(0, 8);
    const trendingTools = trendingToolsRaw.filter((t) => canViewTool(t, t.category, country)).slice(0, 8);
    const recentTools = recentToolsRaw.filter((t) => canViewTool(t, t.category, country)).slice(0, 8);

    return {
      categories: serializeDoc(categoriesWithCounts),
      featuredTools: serializeDoc(featuredTools),
      trendingTools: serializeDoc(trendingTools),
      recentTools: serializeDoc(recentTools),
      blogs: serializeDoc(blogs),
    };
  } catch (e) {
    console.error('Home page data error:', e);
    return { categories: [], featuredTools: [], trendingTools: [], recentTools: [], blogs: [] };
  }
}

export default async function HomePage() {
  const country = await getRequestCountry();
  const bucket = isIndiaUser(country) ? 'IN' : 'WORLD';
  const { categories, featuredTools, trendingTools, recentTools, blogs } = await getCachedHomeData(bucket);

  return (
    <>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />

      <Hero />
      <HomepageContentAd />
      <FeaturedCategories categories={categories} />
      {featuredTools.length > 0 && (
        <ToolsSection title="Featured Tools" badge="Editor's Pick" badgeIcon={Award} tools={featuredTools} viewAllHref="/categories" />
      )}
      {trendingTools.length > 0 && (
        <ToolsSection title="Trending Now" badge="Hot" badgeIcon={Flame} subtitle="Most used tools this week" tools={trendingTools} viewAllHref="/categories" />
      )}
      {recentTools.length > 0 && (
        <ToolsSection title="Recently Added" badge="New" badgeIcon={Sparkles} tools={recentTools} viewAllHref="/categories" />
      )}
      <BlogPreview blogs={blogs} />
      <Newsletter />
    </>
  );
}
