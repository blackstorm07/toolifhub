import { Wrench } from 'lucide-react';
import ToolCard from './ToolCard';

export function ToolGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 border border-border rounded-2xl space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ToolGrid({ tools = [], cols = 4, compact = false }) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (!tools.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Wrench className="w-10 h-10 mx-auto mb-4" aria-hidden="true" />
        <p className="font-medium">No tools found</p>
        <p className="text-sm mt-1">Check back soon — we add new tools regularly!</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClasses[cols] || colClasses[4]} gap-4`}>
      {tools.map((tool) => (
        <ToolCard key={tool._id || tool.slug} tool={tool} compact={compact} />
      ))}
    </div>
  );
}
