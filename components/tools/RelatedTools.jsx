import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ToolIcon from '@/components/icons/ToolIcon';

export default function RelatedTools({ tools = [] }) {
  if (!tools.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Related Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-muted/50 transition-all group"
          >
            <ToolIcon slug={tool.slug} className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                {tool.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">{tool.shortDescription}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
