import Link from 'next/link';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import ToolIcon from '@/components/icons/ToolIcon';

export default function ToolCard({ tool, compact = false }) {
  if (!tool) return null;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 p-5 bg-card border border-border rounded-2xl hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
            <ToolIcon slug={tool.slug} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
              {tool.title}
            </h3>
            {tool.category && (
              <span className="text-xs text-muted-foreground">{tool.category.name}</span>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
      </div>

      {!compact && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>
      )}

      <div className="flex items-center gap-3 mt-auto">
        {tool.trending && (
          <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
            <TrendingUp className="w-3 h-3" />
            Trending
          </span>
        )}
        {tool.featured && (
          <span className="flex items-center gap-1 text-xs text-brand-500 font-medium">
            <Star className="w-3 h-3" aria-hidden="true" />
            Featured
          </span>
        )}
        {tool.views > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {formatNumber(tool.views)} uses
          </span>
        )}
      </div>
    </Link>
  );
}
