import { Calendar, Clock, Eye, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumb from '@/components/tools/Breadcrumb';
import ShareButtons from '@/components/blog/ShareButtons';

function formatTagLabel(tag = '') {
  return tag.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ArticleHero({ blog, authorName, publishedAt, readingMinutes, pageUrl }) {
  return (
    <div className="border-b border-border bg-gradient-to-b from-muted/40 to-transparent">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-8 lg:pb-12">
        <Breadcrumb items={[{ label: 'Blog', href: '/blog' }, { label: blog.title }]} />

        {blog.tags?.[0] && (
          <span className="inline-flex mt-6 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full">
            {formatTagLabel(blog.tags[0])}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold mt-4 mb-4 leading-[1.15] tracking-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{blog.excerpt}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
              {authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={new Date(publishedAt).toISOString()}>{format(new Date(publishedAt), 'MMMM d, yyyy')}</time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readingMinutes} min read
            </span>
            {typeof blog.views === 'number' && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {blog.views.toLocaleString()} views
              </span>
            )}
          </div>

          <ShareButtons url={pageUrl} title={blog.title} />
        </div>
      </div>
    </div>
  );
}
