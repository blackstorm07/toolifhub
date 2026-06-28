import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import JsonLd, { buildWebPageSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';
import { BLOG_CATEGORIES, isValidBlogCategory, getBlogCategoryName } from '@/lib/blog/categories';
import { generateCategoryKeywords } from '@/lib/seo/keywords';
import { mergeKeywords } from '@/lib/seo/keywordStrategy';
import BlogCard from '@/components/blog/BlogCard';
import BlogCategoryPills from '@/components/blog/BlogCategoryPills';
import BlogPagination from '@/components/blog/BlogPagination';
import { FileText } from 'lucide-react';

const PAGE_SIZE = 9;

export async function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!isValidBlogCategory(slug)) return {};
  const name = getBlogCategoryName(slug);
  const keywords = mergeKeywords(
    [`${name} blog`, `${name} articles`],
    generateCategoryKeywords({ name: `${name} Blog Posts`, description: `Articles, guides, and tutorials about ${name}.` })
  );
  return buildPageMetadata({
    title: `${name} Articles — ToolifHub Blog`,
    description: `Browse all ToolifHub blog articles about ${name}: guides, tutorials, and tips.`,
    path: `/blog/category/${slug}`,
    keywords,
  });
}

async function getCategoryPosts(slug, page) {
  await connectDB();
  const filter = publishedBlogFilter({ category: slug });
  const [total, posts] = await Promise.all([
    Blog.countDocuments(filter),
    Blog.find(filter)
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return { posts, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export default async function BlogCategoryPage({ params, searchParams }) {
  const { slug } = await params;
  if (!isValidBlogCategory(slug)) notFound();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const name = getBlogCategoryName(slug);
  const { posts, totalPages } = await getCategoryPosts(slug, page);
  const pageUrl = buildCanonical(`/blog/category/${slug}`);

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            name: `${name} Articles — ToolifHub Blog`,
            description: `Browse all ToolifHub blog articles about ${name}.`,
            url: pageUrl,
          }),
          buildBreadcrumbSchema([
            { label: 'Blog', href: '/blog' },
            { label: name, href: `/blog/category/${slug}` },
          ]),
        ]}
      />
      <div className="page">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Category</p>
          <h1 className="text-4xl font-bold">{name} Articles</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Guides, tutorials, and tips about {name.toLowerCase()} from the ToolifHub blog.
          </p>
        </div>

        <BlogCategoryPills activeSlug={slug} />

        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-4" aria-hidden="true" />
            <p className="font-medium text-lg">No articles in this category yet</p>
            <p className="text-sm mt-2">Check back soon — we&apos;re publishing regularly.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
            <BlogPagination currentPage={page} totalPages={totalPages} basePath={`/blog/category/${slug}`} />
          </>
        )}
      </div>
    </>
  );
}
