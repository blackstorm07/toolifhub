import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist or may have been moved.',
  path: '/404',
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold mb-4">404 — Page Not Found</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
        >
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-xl hover:bg-muted transition-colors"
        >
          <Search className="w-4 h-4" /> Browse Tools
        </Link>
      </div>
    </div>
  );
}
