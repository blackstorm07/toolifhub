import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { FileText, Flame, Star } from 'lucide-react';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import JsonLd, { buildWebPageSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';
import BlogCard from '@/components/blog/BlogCard';
import BlogCategoryPills from '@/components/blog/BlogCategoryPills';
import BlogSearchForm from '@/components/blog/BlogSearchForm';
import BlogPagination from '@/components/blog/BlogPagination';

const PAGE_SIZE = 9;

export const metadata = buildPageMetadata({
  title: 'Blog — Tips, Tutorials & Tools',
  description: 'Read our latest articles on productivity, SEO, YouTube growth, AI tools, and online utilities.',
  path: '/blog',
  keywords: [
    'blog', 'seo tips', 'youtube growth', 'productivity', 'ai tools', 'toolifhub blog',
    'free online tools blog', 'developer tutorials', 'seo guides', 'youtube optimization tips',
    'ai writing tips', 'productivity hacks', 'how to use online tools', 'tool tutorials',
    'digital marketing tips', 'content creation tips', 'tech blog free tools',
    'online tools guide', 'best free tools blog', 'ToolifHub',
  ],
});

async function getBlogPageData(page) {
  try {
    await connectDB();
    const filter = publishedBlogFilter();
    const [featured, popular, total, latest] = await Promise.all([
      Blog.find(publishedBlogFilter({ featured: true }))
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),
      Blog.find(filter).select('-content').sort({ views: -1 }).limit(5).lean(),
      Blog.countDocuments(filter),
      Blog.find(filter)
        .select('-content')
        .sort({ publishedAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
    ]);
    return { featured, popular, latest, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
  } catch {
    return { featured: [], popular: [], latest: [], totalPages: 1 };
  }
}

export default async function BlogPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const { featured, popular, latest, totalPages } = await getBlogPageData(page);
  const hasAnyPosts = featured.length > 0 || latest.length > 0;

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            name: 'Blog — Tips, Tutorials & Tools',
            description: 'Read our latest articles on productivity, SEO, YouTube growth, AI tools, and online utilities.',
            url: buildCanonical('/blog'),
          }),
          buildBreadcrumbSchema([{ label: 'Blog', href: '/blog' }]),
        ]}
      />
      <div className="page">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Tips & Tutorials</p>
          <h1 className="text-4xl font-bold">The ToolifHub Blog</h1>
          <p className="text-muted-foreground mt-3 text-lg">Productivity tips, SEO tutorials, developer guides and more.</p>
        </div>

        <BlogSearchForm />
        <BlogCategoryPills />

        {!hasAnyPosts ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-4" aria-hidden="true" />
            <p className="font-medium text-lg">No posts yet</p>
            <p className="text-sm mt-2">Check back soon — great content is coming!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
            <div className="space-y-12">
              {page === 1 && featured.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                    <Star className="w-5 h-5 text-brand-500" aria-hidden="true" /> Featured Articles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-lg font-bold mb-4">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latest.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
                </div>
                <BlogPagination currentPage={page} totalPages={totalPages} basePath="/blog" />
              </section>
            </div>

            <aside className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" /> Popular Posts
              </h2>
              <div className="space-y-3">
                {popular.map((blog, i) => (
                  <a key={blog._id} href={`/blog/${blog.slug}`} className="flex gap-3 group">
                    <span className="text-2xl font-bold text-muted-foreground/40 w-6 flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {blog.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{blog.views || 0} views</p>
                    </div>
                  </a>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
