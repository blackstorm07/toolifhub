import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
import { ArrowRight } from 'lucide-react';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import JsonLd, { buildWebPageSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import CategoryIcon from '@/components/icons/CategoryIcon';

export const metadata = buildPageMetadata({
  title: 'All Tool Categories',
  description: 'Browse all 50+ free online tools organized by category — YouTube, SEO, Developer, Text, Image, Calculator tools and more.',
  path: '/categories',
  keywords: [
    'tool categories', 'free online tools', 'youtube tools', 'seo tools', 'all tool categories',
    'browse online tools', 'developer tools', 'ai tools', 'image tools', 'pdf tools',
    'text tools', 'calculator tools', 'color tools', 'government tools', 'utility tools',
    'free tools by category', 'best online tool categories', 'where to find free tools',
    'toolifhub categories', 'ToolifHub',
  ],
});

async function getCategories() {
  try {
    await connectDB();
    return await getVisibleCategoriesWithCounts();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
    <JsonLd
      data={[
        buildWebPageSchema({
          name: 'All Tool Categories',
          description: 'Browse all 50+ free online tools organized by category — YouTube, SEO, Developer, Text, Image, Calculator tools and more.',
          url: buildCanonical('/categories'),
        }),
        buildBreadcrumbSchema([{ label: 'Categories', href: '/categories' }]),
      ]}
    />
    <div className="page">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3">All Tool Categories</h1>
        <p className="text-muted-foreground text-lg">
          {categories.length} categories · Browse and find the perfect tool for your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            className="group flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <CategoryIcon slug={cat.slug} className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {cat.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
              <p className="text-sm font-medium text-brand-500 mt-3 flex items-center gap-1">
                {cat.toolCount} tools
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
