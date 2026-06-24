import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function NavTile({ item, direction }) {
  if (!item) return <div className="hidden sm:block flex-1" />;

  return (
    <Link
      href={`/blog/${item.slug}`}
      className={`group flex-1 flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-muted/50 transition-all ${
        direction === 'next' ? 'sm:text-right sm:flex-row-reverse' : ''
      }`}
    >
      {direction === 'prev' ? (
        <ArrowLeft className="w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-brand-500 group-hover:-translate-x-0.5 transition-all" />
      ) : (
        <ArrowRight className="w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{direction === 'prev' ? 'Previous' : 'Next'}</p>
        <p className="font-medium text-sm line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {item.title}
        </p>
      </div>
    </Link>
  );
}

export default function ArticleNav({ prev, next }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <NavTile item={prev} direction="prev" />
        <NavTile item={next} direction="next" />
      </div>
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>
    </div>
  );
}
