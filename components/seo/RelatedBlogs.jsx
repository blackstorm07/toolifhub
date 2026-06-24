import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import OptimizedImage from '@/components/seo/OptimizedImage';

export default function RelatedBlogs({ blogs = [], title = 'Related Articles' }) {
  if (!blogs.length) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-brand-500" />
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="flex flex-col rounded-2xl border border-border overflow-hidden hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all group bg-card"
          >
            <div className="relative aspect-[16/10] bg-muted overflow-hidden">
              {blog.featuredImage ? (
                <OptimizedImage
                  src={blog.featuredImage}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/40 dark:to-purple-900/40">
                  <BookOpen className="w-8 h-8 text-brand-400" />
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1 p-4">
              {blog.publishedAt && (
                <p className="text-xs text-muted-foreground mb-1.5">
                  {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                </p>
              )}
              <p className="font-semibold text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                {blog.title}
              </p>
              {blog.excerpt && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 flex-1">{blog.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
