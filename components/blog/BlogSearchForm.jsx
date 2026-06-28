import { Search } from 'lucide-react';

export default function BlogSearchForm({ defaultValue = '' }) {
  return (
    <form action="/blog/search" method="GET" className="relative mb-8 max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles..."
        className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500"
      />
    </form>
  );
}
