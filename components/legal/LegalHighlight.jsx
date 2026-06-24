import { cn } from '@/lib/utils';

export default function LegalHighlight({ children, className }) {
  return (
    <strong className={cn('font-semibold text-foreground', className)}>
      {children}
    </strong>
  );
}
