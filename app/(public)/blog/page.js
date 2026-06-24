import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import OptimizedImage from '@/components/seo/OptimizedImage';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { calculateReadingTime, formatReadingTime } from '@/lib/seo/readingTime';
import { format } from 'date-fns';

export const metadata = buildPageMetadata({
  title: 'Blog — Tips, Tutorials & Tools',
  description: 'Read our latest articles on productivity, SEO, YouTube growth, AI tools, and online utilities.',
  path: '/blog',
  keywords: ['blog', 'seo tips', 'youtube growth', 'productivity', 'ai tools'],
});

async function getBlogs() {
  try {
    await connectDB();
    return Blog.find({ status: 'published' })
      .select('-content')
      .sort({ publishedAt: -1 })
      .lean();
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="page">
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Tips & Tutorials</p>
        <h1 className="text-4xl font-bold">The ToolifHub Blog</h1>
        <p className="text-muted-foreground mt-3 text-lg">Productivity tips, SEO tutorials, developer guides and more.</p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">📝</p>
          <p className="font-medium text-lg">No posts yet</p>
          <p className="text-sm mt-2">Check back soon — great content is coming!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => {
            const readingTime = blog.excerpt ? calculateReadingTime(blog.excerpt) : { minutes: 5 };
            return (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug}`}
                className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {blog.featuredImage ? (
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <OptimizedImage
                      src={blog.featuredImage}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {blog.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-bold text-lg leading-tight mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{blog.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(blog.publishedAt || blog.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatReadingTime(readingTime.minutes)}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
