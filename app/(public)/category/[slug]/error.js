'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function CategoryError({ error, reset }) {
  return (
    <div className="page min-h-[50vh] flex flex-col items-center justify-center text-center">
      <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong loading this category</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Please try again, or head back to all categories.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-xl hover:bg-muted transition-colors"
        >
          <Home className="w-4 h-4" /> All Categories
        </Link>
      </div>
    </div>
  );
}
