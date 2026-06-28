import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ToolGrid from '@/components/tools/ToolGrid';

export default function ToolsSection({ title, subtitle, tools = [], viewAllHref, badge, badgeIcon: BadgeIcon }) {
  return (
    <section className="section">
      <div className="container">
        <div className="flex items-end justify-between mb-6">
          <div>
            {badge && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">
                {BadgeIcon && <BadgeIcon className="w-4 h-4" aria-hidden="true" />}
                {badge}
              </p>
            )}
            <h2 className="text-3xl lg:text-4xl font-bold">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <ToolGrid tools={tools} />

        {viewAllHref && (
          <div className="mt-6 sm:hidden text-center">
            <Link href={viewAllHref} className="inline-flex items-center gap-2 text-sm font-medium text-brand-500">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
