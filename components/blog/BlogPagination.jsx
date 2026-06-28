import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** `basePath` must already include any query string except `page`, e.g.
 * `/blog/category/seo` or `/blog/search?q=json`. */
export default function BlogPagination({ currentPage, totalPages, basePath }) {
  if (totalPages <= 1) return null;

  const hasQuery = basePath.includes('?');
  const join = hasQuery ? '&' : '?';
  const hrefFor = (page) => (page <= 1 ? basePath : `${basePath}${join}page=${page}`);

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Blog pagination">
      <Link
        href={hrefFor(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={`flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-sm font-medium transition-colors ${
          currentPage <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-muted'
        }`}
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Prev
      </Link>
      <span className="text-sm text-muted-foreground px-2">
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={hrefFor(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={`flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-sm font-medium transition-colors ${
          currentPage >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-muted'
        }`}
      >
        Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
