import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Category from '@/models/Category';
import { BEST_OF_ROUTES, getCategorySeoContent } from '@/lib/seo/categoryContent';
import ToolGrid from '@/components/tools/ToolGrid';
import Breadcrumb from '@/components/tools/Breadcrumb';
import CategorySeoContent from '@/components/category/CategorySeoContent';
import CategoryBannerAd from '@/components/ads/CategoryBannerAd';
import JsonLd, { buildBreadcrumbSchema, buildCollectionPageSchema, buildFaqSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import { getRequestCountry } from '@/lib/geo';
import { canViewCategory, visibilityMongoFilter } from '@/lib/visibility';

async function getLandingData(categorySlug, country) {
  await connectDB();
  const category = await Category.findOne({ slug: categorySlug, visible: true }).lean();
  if (!category || !canViewCategory(category, country)) return null;
  const tools = await Tool.find({ category: category._id, status: 'active', ...visibilityMongoFilter(country) })
    .sort({ featured: -1, views: -1 })
    .lean();
  if (!tools.length) return null;
  return { category, tools };
}

export async function generateBestOfMetadata(routeSlug) {
  const categorySlug = BEST_OF_ROUTES[routeSlug];
  if (!categorySlug) return {};
  const seoContent = getCategorySeoContent(categorySlug);
  if (!seoContent) return {};
  return buildPageMetadata({
    title: seoContent.seoTitle,
    description: seoContent.seoDescription,
    path: `/${routeSlug}`,
    keywords: [categorySlug.replace('-', ' '), 'best tools', 'free tools', 'toolifhub'],
    absoluteTitle: true,
  });
}

export default async function BestOfPage({ routeSlug }) {
  const categorySlug = BEST_OF_ROUTES[routeSlug];
  if (!categorySlug) notFound();

  const country = await getRequestCountry();
  const data = await getLandingData(categorySlug, country);
  if (!data) notFound();

  const { category, tools } = data;
  const seoContent = getCategorySeoContent(categorySlug);
  const pageUrl = buildCanonical(`/${routeSlug}`);

  const schemas = [
    buildBreadcrumbSchema([
      { label: 'Categories', href: '/categories' },
      { label: category.name, href: `/category/${categorySlug}` },
      { label: `Best ${category.name}`, href: `/${routeSlug}` },
    ]),
    buildCollectionPageSchema({
      name: seoContent?.seoTitle || `Best ${category.name}`,
      description: seoContent?.seoDescription,
      url: pageUrl,
      items: tools.map((t) => ({ name: t.title, url: buildCanonical(`/tools/${t.slug}`) })),
    }),
  ];
  const faqSchema = seoContent?.faq ? buildFaqSchema(seoContent.faq) : null;
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <JsonLd data={schemas} />

      <div className="page">
        <Breadcrumb
          items={[
            { label: 'Categories', href: '/categories' },
            { label: category.name, href: `/category/${categorySlug}` },
            { label: `Best ${category.name}` },
          ]}
        />

        <div className="mt-6 mb-6">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Curated Guide</p>
          <h1 className="text-3xl lg:text-4xl font-bold">
            {seoContent?.seoTitle?.split('—')[0]?.trim() || `Best ${category.name}`}
          </h1>
          <p className="text-muted-foreground text-lg mt-3 max-w-3xl">
            {seoContent?.intro || category.description}
          </p>
        </div>

        <CategoryBannerAd />

        <ToolGrid tools={tools} />

        {seoContent && (
          <CategorySeoContent seoContent={seoContent} category={category} tools={tools} />
        )}
      </div>
    </>
  );
}
