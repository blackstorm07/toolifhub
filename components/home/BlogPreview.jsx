import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock, FileText } from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';

function BlogCard({ blog }) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {blog.featuredImage ? (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <FileText className="w-10 h-10 text-brand-400" aria-hidden="true" />
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

        <h3 className="font-bold text-lg leading-tight mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {blog.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {getTimeAgo(blog.publishedAt || blog.createdAt)}
          </span>
          <ArrowRight className="w-4 h-4 ml-auto group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}

export default function BlogPreview({ blogs = [] }) {
  if (!blogs.length) return null;

  return (
    <section className="section bg-muted/30">
      <div className="container">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Tips & Tutorials</p>
            <h2 className="text-3xl lg:text-4xl font-bold">From the Blog</h2>
          </div>
          <Link href="/blog" className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Read all posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-brand-500">
            Read all posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
