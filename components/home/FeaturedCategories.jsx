import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FeaturedCategories({ categories = [] }) {
  return (
    <section className="section">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Browse by Category</p>
            <h2 className="text-3xl lg:text-4xl font-bold">Tool Categories</h2>
          </div>
          <Link href="/categories" className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cat.name}
                </p>
                {cat.toolCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.toolCount} tools</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-medium text-brand-500">
            View all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
