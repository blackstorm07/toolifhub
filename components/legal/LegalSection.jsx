import { cn } from '@/lib/utils';

export default function LegalSection({
  id,
  title,
  icon: Icon,
  description,
  children,
  className,
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        'scroll-mt-28 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-4 mb-5">
        {Icon && (
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"
            aria-hidden="true"
          >
            <Icon className="w-5 h-5 text-brand-500" />
          </div>
        )}
        <div className="min-w-0">
          <h2
            id={`${id}-heading`}
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="legal-prose space-y-4 text-[15px] sm:text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
