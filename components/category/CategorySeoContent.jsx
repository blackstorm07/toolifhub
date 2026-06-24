import Link from 'next/link';
import ToolFAQ from '@/components/tools/ToolFAQ';
import RelatedCategories from '@/components/seo/RelatedCategories';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

async function getRelatedCategories(slugs = []) {
  if (!slugs.length) return [];
  try {
    await connectDB();
    return Category.find({ slug: { $in: slugs }, visible: true })
      .select('name slug icon')
      .lean();
  } catch {
    return [];
  }
}

export default async function CategorySeoContent({ seoContent, category, tools = [] }) {
  if (!seoContent) return null;

  const relatedCategories = await getRelatedCategories(seoContent.relatedCategories || []);

  return (
    <div className="space-y-8 mt-8">
      {/* Long-form intro */}
      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold not-prose mb-4">About {category.name}</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">{seoContent.intro}</p>
      </section>

      {/* Benefits grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Why Use ToolifHub {category.name}?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seoContent.benefits.map((b, i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content sections */}
      {seoContent.sections.map((section, i) => (
        <section key={i} className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold not-prose mb-4">{section.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: section.content }} />
        </section>
      ))}

      {/* Tool listings with internal links */}
      {tools.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">All {category.name} on ToolifHub</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {tool.title}
                </Link>
                <span className="text-xs text-muted-foreground ml-2">— {tool.shortDescription}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {seoContent.faq?.length > 0 && <ToolFAQ faqs={seoContent.faq} />}

      {/* Related categories */}
      <RelatedCategories categories={relatedCategories} />

      {/* Best-of programmatic link */}
      <section className="p-5 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
        <p className="text-sm text-muted-foreground">
          Looking for curated recommendations? Check out our{' '}
          <Link href={`/best-${category.slug}`} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
            Best {category.name} guide
          </Link>{' '}
          for expert picks and detailed comparisons.
        </p>
      </section>
    </div>
  );
}
