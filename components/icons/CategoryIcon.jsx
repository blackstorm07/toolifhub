import { getCategoryIcon } from '@/lib/icons/categoryIcons';

/** Renders a category's Lucide icon by slug, replacing the legacy emoji field. */
export default function CategoryIcon({ slug, className = 'w-5 h-5' }) {
  const Icon = getCategoryIcon(slug);
  return <Icon className={className} aria-hidden="true" />;
}
