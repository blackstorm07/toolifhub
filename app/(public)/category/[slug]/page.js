import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getCategoryVisibilityStatus, getVisibleCategorySlugs } from '@/lib/categories';
import { getCategorySeoContent } from '@/lib/seo/categoryContent';
import { getRequestCountry } from '@/lib/geo';
import { visibilityMongoFilter } from '@/lib/visibility';
import ToolGrid from '@/components/tools/ToolGrid';
import Breadcrumb from '@/components/tools/Breadcrumb';
import CategorySeoContent from '@/components/category/CategorySeoContent';
import CategoryBannerAd from '@/components/ads/CategoryBannerAd';
import VisibilityFilterTracker from '@/components/tools/VisibilityFilterTracker';
import JsonLd, { buildBreadcrumbSchema, buildCollectionPageSchema, buildFaqSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import { generateCategoryKeywords } from '@/lib/seo/keywords';
import { getCategoryKeywordOverride, mergeKeywords } from '@/lib/seo/keywordStrategy';
import { serializeDoc } from '@/lib/serialize';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const country = await getRequestCountry();
    const status = await getCategoryVisibilityStatus(slug, country);
    if (status.status !== 'ok') return {};
    const category = status.category;
    const seoContent = getCategorySeoContent(slug);
    const keywords = mergeKeywords(
      getCategoryKeywordOverride(slug),
      generateCategoryKeywords({ name: category.name, description: category.description })
    );
    return buildPageMetadata({
      title: seoContent?.seoTitle || `${category.name} — Free Online Tools`,
      description: seoContent?.seoDescription || category.description || `Browse all free ${category.name} tools. No sign-up required.`,
      path: `/category/${slug}`,
      keywords,
      absoluteTitle: !!seoContent?.seoTitle,
      ogImage: `${buildCanonical('/api/og')}?title=${encodeURIComponent(category.name)}&subtitle=${encodeURIComponent('Free Online Tools')}`,
      ...(category.visibility === 'india_only'
        ? { languages: { 'en-IN': buildCanonical(`/category/${slug}`) } }
        : {}),
    });
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const slugs = await getVisibleCategorySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

async function getData(slug, country) {
  await connectDB();
  const status = await getCategoryVisibilityStatus(slug, country);
  if (status.status !== 'ok') return { status: status.status, category: status.category || null };

  const category = status.category;
  const tools = await Tool.find({ category: category._id, status: 'active', ...visibilityMongoFilter(country) })
    .sort({ featured: -1, views: -1 })
    .lean();
  return { status: 'ok', category: serializeDoc(category), tools: serializeDoc(tools) };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const country = await getRequestCountry();
  const data = await getData(slug, country);

  if (data.status === 'not-found') notFound();

  if (data.status === 'geo-blocked') {
    return (
      <div className="page">
        <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, { label: data.category.name }]} />
        <div className="mt-10 text-center max-w-md mx-auto py-12">
          <div className="text-5xl mb-4">{data.category.icon}</div>
          <h1 className="text-2xl font-bold mb-2">{data.category.name} isn&apos;t available in your region</h1>
          <p className="text-muted-foreground">This category is only available to visitors in India.</p>
        </div>
        <VisibilityFilterTracker
          type="category"
          category={data.category.slug}
          visibility={data.category.visibility}
          country={country}
        />
      </div>
    );
  }

  const { category, tools } = data;
  const seoContent = getCategorySeoContent(slug);
  const pageUrl = buildCanonical(`/category/${slug}`);

  const schemas = [
    buildBreadcrumbSchema([
      { label: 'Categories', href: '/categories' },
      { label: category.name, href: `/category/${slug}` },
    ]),
    buildCollectionPageSchema({
      name: category.name,
      description: category.description || seoContent?.intro,
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
        <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, { label: category.name }]} />

        <div className="mt-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-3xl">
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground mt-1">{tools.length} tools available</p>
            </div>
          </div>
          {category.description && (
            <p className="text-muted-foreground text-lg max-w-3xl">{category.description}</p>
          )}
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
