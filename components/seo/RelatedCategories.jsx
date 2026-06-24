import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export default function RelatedCategories({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-brand-500" />
        Related Categories
      </h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-muted/50 transition-all text-sm font-medium"
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
