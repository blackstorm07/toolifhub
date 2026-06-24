import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Category from '@/models/Category';
import Breadcrumb from '@/components/tools/Breadcrumb';
import ToolFAQ from '@/components/tools/ToolFAQ';
import RelatedTools from '@/components/tools/RelatedTools';
import ToolSeoContent from '@/components/tools/ToolSeoContent';
import RelatedBlogs from '@/components/seo/RelatedBlogs';
import ShareButtons from '@/components/tools/ShareButtons';
import InContentAd from '@/components/ads/InContentAd';
import SidebarAd from '@/components/ads/SidebarAd';
import JsonLd, {
  buildFaqSchema,
  buildBreadcrumbSchema,
  buildSoftwareApplicationSchema,
} from '@/components/seo/JsonLd';
import ToolRenderer from '@/features/tools/ToolRenderer';
import { buildPageMetadata, buildToolTitle, buildCanonical } from '@/lib/seo/metadata';
import { generateToolSeoContent } from '@/lib/seo/toolContent';
import { getRelatedBlogsForTool } from '@/lib/seo/internalLinks';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const tool = await Tool.findOne({ slug, status: 'active' })
      .populate('category', 'name')
      .lean();
    if (!tool) return {};
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

async function getData(slug) {
  await connectDB();
  const tool = await Tool.findOne({ slug, status: 'active' })
    .populate('category', 'name slug icon')
    .lean();
  if (!tool) return null;

  Tool.findByIdAndUpdate(tool._id, { $inc: { views: 1 } }).exec();

  let relatedTools = [];
  if (tool.relatedTools?.length) {
    relatedTools = await Tool.find({ slug: { $in: tool.relatedTools }, status: 'active' })
      .select('title slug icon shortDescription category')
      .populate('category', 'name slug')
      .limit(6)
      .lean();
  } else {
    relatedTools = await Tool.find({
      category: tool.category._id,
      slug: { $ne: slug },
      status: 'active',
    })
      .select('title slug icon shortDescription category')
      .populate('category', 'name slug')
      .limit(6)
      .lean();
  }

  const relatedBlogs = await getRelatedBlogsForTool(tool);
  return { tool, relatedTools, relatedBlogs };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

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
