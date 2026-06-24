import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Category from '@/models/Category';
import Breadcrumb from '@/components/tools/Breadcrumb';
import ToolFAQ from '@/components/tools/ToolFAQ';
import RelatedTools from '@/components/tools/RelatedTools';
import ShareButtons from '@/components/tools/ShareButtons';
import InContentAd from '@/components/ads/InContentAd';
import SidebarAd from '@/components/ads/SidebarAd';
import JsonLd, { buildFaqSchema, buildBreadcrumbSchema, buildWebApplicationSchema } from '@/components/seo/JsonLd';
import ToolRenderer from '@/features/tools/ToolRenderer';
import { absoluteUrl, generateSeoTitle } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const tool = await Tool.findOne({ slug, status: 'active' })
      .populate('category', 'name')
      .lean();
    if (!tool) return {};
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // seoTitle already includes "| ToolifHub" — use `absolute` so the root
    // layout's title template doesn't append it a second time.
    return {
      title: { absolute: tool.seoTitle || generateSeoTitle(tool.title) },
      description: tool.seoDescription || tool.shortDescription,
      keywords: tool.seoKeywords?.length ? tool.seoKeywords : tool.keywords,
      openGraph: {
        title: tool.title,
        description: tool.shortDescription,
        url: `${APP_URL}/tools/${slug}`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: tool.title,
        description: tool.shortDescription,
      },
      alternates: { canonical: `${APP_URL}/tools/${slug}` },
    };
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

  // Increment views
  Tool.findByIdAndUpdate(tool._id, { $inc: { views: 1 } }).exec();

  // Related tools
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

  return { tool, relatedTools };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

  const { tool, relatedTools } = data;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const toolUrl = `${APP_URL}/tools/${slug}`;

  const faqSchema = tool.faq?.length ? buildFaqSchema(tool.faq) : null;
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { label: 'Categories', href: '/categories' },
      { label: tool.category.name, href: `/category/${tool.category.slug}` },
      { label: tool.title },
    ],
    APP_URL
  );
  const webAppSchema = buildWebApplicationSchema({
    name: tool.title,
    description: tool.shortDescription,
    url: toolUrl,
    category: tool.category.name,
  });

  return (
    <>
      {faqSchema && <JsonLd data={faqSchema} />}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webAppSchema} />

      <div className="container py-12 lg:py-16">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Categories', href: '/categories' },
            { label: tool.category.name, href: `/category/${tool.category.slug}` },
            { label: tool.title },
          ]}
        />

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Tool header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-3xl flex-shrink-0">
                {tool.icon}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{tool.title}</h1>
                <p className="text-muted-foreground mt-1">{tool.shortDescription}</p>
              </div>
            </div>

            {/* The actual tool interface */}
            <ToolRenderer slug={slug} tool={tool} />

            <InContentAd />

            {/* Full description */}
            {tool.fullDescription && (
              <section className="prose prose-neutral dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold not-prose mb-4">About {tool.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: tool.fullDescription }} />
              </section>
            )}

            {/* FAQ */}
            {tool.faq?.length > 0 && <ToolFAQ faqs={tool.faq} />}

            {/* Share */}
            <div className="pt-4 border-t border-border">
              <ShareButtons url={toolUrl} title={tool.title} slug={slug} />
            </div>

            {/* Related tools */}
            <RelatedTools tools={relatedTools} />
          </div>

          {/* Sidebar ad (desktop only) */}
          <aside className="hidden lg:block w-[300px] flex-shrink-0">
            <SidebarAd />
          </aside>
        </div>
      </div>
    </>
  );
}
