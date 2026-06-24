import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getPublicCategoryWithCount, getVisibleCategorySlugs } from '@/lib/categories';
import ToolGrid from '@/components/tools/ToolGrid';
import Breadcrumb from '@/components/tools/Breadcrumb';
import InContentAd from '@/components/ads/InContentAd';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const category = await getPublicCategoryWithCount(slug);
    if (!category) return {};
    return {
      title: `${category.name} — Free Online Tools`,
      description: category.description || `Browse all free ${category.name} tools. No sign-up required.`,
      openGraph: { title: category.name, description: category.description },
    };
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
  // Returns null for hidden categories AND for categories with 0 active
  // tools, so an empty category page is never reachable even by direct URL.
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

  return (
    <div className="container py-12 lg:py-16">
      <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, { label: category.name }]} />

      <div className="mt-8 mb-10">
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
          <p className="text-muted-foreground text-lg max-w-2xl">{category.description}</p>
        )}
      </div>

      <ToolGrid tools={tools} />
      <InContentAd />
    </div>
  );
}
