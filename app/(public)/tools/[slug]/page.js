import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Breadcrumb from '@/components/tools/Breadcrumb';
import ToolFAQ from '@/components/tools/ToolFAQ';
import RelatedTools from '@/components/tools/RelatedTools';
import ToolSeoContent from '@/components/tools/ToolSeoContent';
import RelatedBlogs from '@/components/seo/RelatedBlogs';
import ShareButtons from '@/components/tools/ShareButtons';
import InContentAd from '@/components/ads/InContentAd';
import SidebarAd from '@/components/ads/SidebarAd';
import VisibilityFilterTracker from '@/components/tools/VisibilityFilterTracker';
import JsonLd, {
  buildFaqSchema,
  buildBreadcrumbSchema,
  buildSoftwareApplicationSchema,
} from '@/components/seo/JsonLd';
import ToolRenderer from '@/features/tools/ToolRenderer';
import { buildPageMetadata, buildToolTitle, buildCanonical } from '@/lib/seo/metadata';
import { generateToolSeoContent } from '@/lib/seo/toolContent';
import { getRelatedBlogsForTool } from '@/lib/seo/internalLinks';
import { getRequestCountry } from '@/lib/geo';
import { canViewTool, visibilityMongoFilter } from '@/lib/visibility';

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
    return buildPageMetadata({
      title,
      description: tool.seoDescription || tool.shortDescription,
      path: `/tools/${slug}`,
      keywords: tool.seoKeywords?.length ? tool.seoKeywords : tool.keywords,
      absoluteTitle: true,
    });
  } catch {
    return {};
  }
}

async function getData(slug, country) {
  await connectDB();
  const tool = await Tool.findOne({ slug, status: 'active' })
    .populate('category', 'name slug icon visibility')
    .lean();
  if (!tool) return { status: 'not-found' };

  if (!canViewTool(tool, tool.category, country)) {
    return { status: 'geo-blocked', tool };
  }

  Tool.findByIdAndUpdate(tool._id, { $inc: { views: 1 } }).exec();

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
  relatedTools = relatedTools.filter((t) => canViewTool(t, t.category, country));

  const relatedBlogs = await getRelatedBlogsForTool(tool);
  return { status: 'ok', tool, relatedTools, relatedBlogs };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const country = await getRequestCountry();
  const data = await getData(slug, country);

  if (data.status === 'not-found') notFound();

  if (data.status === 'geo-blocked') {
    return (
      <div className="page">
        <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, { label: data.tool.title }]} />
        <div className="mt-10 text-center max-w-md mx-auto py-12">
          <div className="text-5xl mb-4">{data.tool.icon}</div>
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
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-3xl flex-shrink-0">
                {tool.icon}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{tool.title}</h1>
                <p className="text-muted-foreground mt-1">{tool.shortDescription}</p>
              </div>
            </div>

            <ToolRenderer slug={slug} tool={tool} />

            <InContentAd />

            <ToolSeoContent tool={tool} categoryName={tool.category.name} />

            {tool.faq?.length > 0 && <ToolFAQ faqs={tool.faq} />}

            <div className="pt-4 border-t border-border">
              <ShareButtons url={toolUrl} title={tool.title} slug={slug} />
            </div>

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
