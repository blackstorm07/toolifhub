import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getPublicCategoryWithCount, getVisibleCategorySlugs } from '@/lib/categories';
import { getCategorySeoContent } from '@/lib/seo/categoryContent';
import ToolGrid from '@/components/tools/ToolGrid';
import Breadcrumb from '@/components/tools/Breadcrumb';
import CategorySeoContent from '@/components/category/CategorySeoContent';
import InContentAd from '@/components/ads/InContentAd';
import JsonLd, { buildBreadcrumbSchema, buildCollectionPageSchema, buildFaqSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const category = await getPublicCategoryWithCount(slug);
    if (!category) return {};
    const seoContent = getCategorySeoContent(slug);
    return buildPageMetadata({
      title: seoContent?.seoTitle || `${category.name} — Free Online Tools`,
      description: seoContent?.seoDescription || category.description || `Browse all free ${category.name} tools. No sign-up required.`,
      path: `/category/${slug}`,
      keywords: [category.name.toLowerCase(), 'free online tools', 'toolifhub'],
      absoluteTitle: !!seoContent?.seoTitle,
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

async function getData(slug) {
  await connectDB();
  const category = await getPublicCategoryWithCount(slug);
  if (!category) return null;
  const tools = await Tool.find({ category: category._id, status: 'active' })
    .sort({ featured: -1, views: -1 })
    .lean();
  return { category, tools };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

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

        <ToolGrid tools={tools} />
        <InContentAd />

        {seoContent && (
          <CategorySeoContent seoContent={seoContent} category={category} tools={tools} />
        )}
      </div>
    </>
  );
}
