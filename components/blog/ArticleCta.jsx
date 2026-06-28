import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ToolIcon from '@/components/icons/ToolIcon';

/** Soft call-to-action pointing at the most relevant ToolifHub tool for this
 * article — falls back to nothing if no related tool was found. */
export default function ArticleCta({ tool }) {
  if (!tool) return null;

  return (
    <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 border border-brand-100 dark:border-brand-900">
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-background flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
        <ToolIcon slug={tool.slug} className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Try {tool.title} free on ToolifHub</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tool.shortDescription}</p>
      </div>
      <Link
        href={`/tools/${tool.slug}`}
        className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
      >
        Try Now <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
