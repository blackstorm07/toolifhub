import { Badge } from '@/components/ui/badge';
import { CalendarDays, ShieldCheck } from 'lucide-react';

export default function LegalHero({ title, lastUpdated, description, badge, icon: Icon = ShieldCheck }) {
  return (
    <header className="text-center mb-10 lg:mb-12">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 mb-5">
        <Icon className="w-7 h-7 text-brand-500" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
        {badge || 'Legal'}
      </p>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
        {title}
      </h1>
      {lastUpdated && (
        <Badge
          variant="secondary"
          className="mb-5 px-3 py-1 text-xs font-medium gap-1.5"
        >
          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          Last updated: {lastUpdated}
        </Badge>
      )}
      {description && (
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </header>
  );
}
