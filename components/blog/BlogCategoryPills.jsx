import Link from 'next/link';
import { BLOG_CATEGORIES } from '@/lib/blog/categories';

export default function BlogCategoryPills({ activeSlug }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link
        href="/blog"
        className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
          !activeSlug ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted text-muted-foreground'
        }`}
      >
        All
      </Link>
      {BLOG_CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/blog/category/${cat.slug}`}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
            activeSlug === cat.slug ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted text-muted-foreground'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
