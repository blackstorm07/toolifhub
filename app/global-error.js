'use client';

import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" aria-hidden="true" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-border font-semibold rounded-xl hover:bg-muted transition-colors"
          >
            Go Home
          </a>
        </div>
      </body>
    </html>
  );
}
