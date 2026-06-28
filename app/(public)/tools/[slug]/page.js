import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Breadcrumb from '@/components/tools/Breadcrumb';
import ToolFAQ from '@/components/tools/ToolFAQ';
import RelatedTools from '@/components/tools/RelatedTools';
import ToolSeoContent from '@/components/tools/ToolSeoContent';
import RelatedBlogs from '@/components/seo/RelatedBlogs';
import ShareButtons from '@/components/tools/ShareButtons';
import ToolTopAd from '@/components/ads/ToolTopAd';
import ToolMiddleAd from '@/components/ads/ToolMiddleAd';
import ToolBottomAd from '@/components/ads/ToolBottomAd';
import SidebarAd from '@/components/ads/SidebarAd';
import VisibilityFilterTracker from '@/components/tools/VisibilityFilterTracker';
import JsonLd, {
  buildFaqSchema,
  buildBreadcrumbSchema,
  buildSoftwareApplicationSchema,
} from '@/components/seo/JsonLd';
import ToolRenderer from '@/features/tools/ToolRenderer';
import ToolIcon from '@/components/icons/ToolIcon';
import { buildPageMetadata, buildToolTitle, buildCanonical } from '@/lib/seo/metadata';
import { generateToolSeoContent } from '@/lib/seo/toolContent';
import { generateToolKeywords } from '@/lib/seo/keywords';
import { getToolKeywordOverride, mergeKeywords } from '@/lib/seo/keywordStrategy';
import { getRelatedBlogsForTool } from '@/lib/seo/internalLinks';
import { getRequestCountry } from '@/lib/geo';
import { canViewTool, visibilityMongoFilter, isIndiaUser } from '@/lib/visibility';
import { serializeDoc } from '@/lib/serialize';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const country = await getRequestCountry();
    const tool = await Tool.findOne({ slug, status: 'active' })
      .populate('category', 'name visibility')
      .lean();
    if (!tool || !canViewTool(tool, tool.category, country)) return {};
    const title = tool.seoTitle || buildToolTitle(tool.title);
    const generatedKeywords = generateToolKeywords({
      title: tool.title,
      shortDescription: tool.shortDescription,
      categoryName: tool.category?.name,
      isIndiaOnly: tool.visibility === 'india_only',
    });
    const keywords = mergeKeywords(
      getToolKeywordOverride(slug),
      [...(tool.seoKeywords?.length ? tool.seoKeywords : tool.keywords || []), ...generatedKeywords]
    );
    return buildPageMetadata({
      title,
      description: tool.seoDescription || tool.shortDescription,
      path: `/tools/${slug}`,
      keywords,
      absoluteTitle: true,
      ogImage: `${buildCanonical('/api/og')}?title=${encodeURIComponent(tool.title)}&subtitle=${encodeURIComponent('Free Online Tool')}`,
      ...(tool.visibility === 'india_only' ? { languages: { 'en-IN': buildCanonical(`/tools/${slug}`) } } : {}),
    });
  } catch {
    return {};
  }
}

// Cached per visibility bucket (IN vs everyone else — only two buckets
// exist, see lib/visibility.js) so the Mongo round trip is off the critical
// path on cache hits. The view-increment write is intentionally kept out of
// this cached function (see getData below) so it still fires every request.
const getCachedToolData = unstable_cache(
  async (slug, bucket) => fetchToolData(slug, bucket),
  ['tool-data'],
  { revalidate: 120, tags: ['tools'] }
);

async function fetchToolData(slug, country) {
  await connectDB();
  let tool = await Tool.findOne({ slug, status: 'active' })
    .populate('category', 'name slug icon visibility')
    .lean();
  if (!tool) return { status: 'not-found' };
  tool = serializeDoc(tool);

  if (!canViewTool(tool, tool.category, country)) {
    return { status: 'geo-blocked', tool };
  }

  const countryFilter = visibilityMongoFilter(country);
  let relatedTools = [];
  if (tool.relatedTools?.length) {
    relatedTools = await Tool.find({ slug: { $in: tool.relatedTools }, status: 'active', ...countryFilter })
      .select('title slug icon shortDescription category')
      .populate('category', 'name slug visibility')
      .limit(6)
      .lean();
  } else {
    relatedTools = await Tool.find({
      category: tool.category._id,
      slug: { $ne: slug },
      status: 'active',
      ...countryFilter,
    })
      .select('title slug icon shortDescription category')
      .populate('category', 'name slug visibility')
      .limit(6)
      .lean();
  }
  // Belt-and-suspenders: relatedTools can reference a different category than
  // the current tool, so re-check category-level visibility in JS too.
  relatedTools = relatedTools.filter((t) => canViewTool(t, t.category, country)).map(serializeDoc);

  const relatedBlogs = serializeDoc(await getRelatedBlogsForTool(tool));
  return { status: 'ok', tool, relatedTools, relatedBlogs };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const country = await getRequestCountry();
  const bucket = isIndiaUser(country) ? 'IN' : 'WORLD';
  const data = await getCachedToolData(slug, bucket);

  if (data.status === 'not-found') notFound();

  if (data.status === 'ok') {
    await connectDB();
    Tool.findByIdAndUpdate(data.tool._id, { $inc: { views: 1 } }).exec();
  }

  if (data.status === 'geo-blocked') {
    return (
      <div className="page">
        <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, { label: data.tool.title }]} />
        <div className="mt-10 text-center max-w-md mx-auto py-12">
          <div className="flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
            <ToolIcon slug={data.tool.slug} className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{data.tool.title} isn&apos;t available in your region</h1>
          <p className="text-muted-foreground">This tool is only available to visitors in India.</p>
        </div>
        <VisibilityFilterTracker
          type="tool"
          category={data.tool.category?.slug}
          tool={data.tool.slug}
          visibility={data.tool.visibility}
          country={country}
        />
      </div>
    );
  }

  const { tool, relatedTools, relatedBlogs } = data;
  const toolUrl = buildCanonical(`/tools/${slug}`);
  const seoContent = generateToolSeoContent(tool, tool.category?.name);
  const faqs = tool.faq?.length ? tool.faq : seoContent.faq;

  const schemas = [
    buildBreadcrumbSchema(
      [
        { label: 'Categories', href: '/categories' },
        { label: tool.category.name, href: `/category/${tool.category.slug}` },
        { label: tool.title, href: `/tools/${slug}` },
      ]
    ),
    buildSoftwareApplicationSchema({
      name: tool.title,
      description: tool.shortDescription,
      url: toolUrl,
      category: tool.category.name,
    }),
  ];
  const faqSchema = buildFaqSchema(faqs);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <JsonLd data={schemas} />

      <div className="page">
        <Breadcrumb
          items={[
            { label: 'Categories', href: '/categories' },
            { label: tool.category.name, href: `/category/${tool.category.slug}` },
            { label: tool.title },
          ]}
        />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                <ToolIcon slug={tool.slug} className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{tool.title}</h1>
                <p className="text-muted-foreground mt-1">{tool.shortDescription}</p>
              </div>
            </div>

            <ToolTopAd />

            <ToolRenderer slug={slug} tool={tool} />

            <ToolMiddleAd />

            <ToolSeoContent tool={tool} categoryName={tool.category.name} />

            {tool.faq?.length > 0 && <ToolFAQ faqs={tool.faq} />}

            <div className="pt-4 border-t border-border">
              <ShareButtons url={toolUrl} title={tool.title} slug={slug} />
            </div>

            <ToolBottomAd />

            <RelatedTools tools={relatedTools} />
            <RelatedBlogs blogs={relatedBlogs} />
          </div>

          <aside className="hidden lg:block w-[300px] flex-shrink-0">
            <SidebarAd />
          </aside>
        </div>
      </div>
    </>
  );
}
