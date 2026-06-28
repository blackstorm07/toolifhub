import Link from 'next/link';
import { ArrowRight, Calendar, Clock, FileText } from 'lucide-react';
import OptimizedImage from '@/components/seo/OptimizedImage';
import { calculateReadingTime, formatReadingTime } from '@/lib/seo/readingTime';
import { getBlogCategoryName } from '@/lib/blog/categories';
import { format } from 'date-fns';

export default function BlogCard({ blog }) {
  const readingTime = blog.excerpt ? calculateReadingTime(blog.excerpt) : { minutes: 5 };

  return (
    <Link
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
          <FileText className="w-10 h-10 text-brand-400" aria-hidden="true" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.category && (
            <span className="text-xs font-medium text-white bg-brand-500 px-2.5 py-1 rounded-full">
              {getBlogCategoryName(blog.category)}
            </span>
          )}
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
}
