import SearchBar from '@/components/search/SearchBar';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

const highlights = ['500+ Free Tools', 'No Sign Up Required', 'Mobile Friendly', 'Lightning Fast'];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-background to-background dark:from-brand-950/20 dark:via-background">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Blob gradients */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl" />
      <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

      <div className="relative container py-8 sm:py-10 lg:py-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs sm:text-sm font-medium rounded-full border border-brand-200 dark:border-brand-800 mb-4">
          <Zap className="w-3.5 h-3.5" fill="currentColor" />
          500+ Free Online Tools
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-3 leading-[1.05]">
          One Hub.{' '}
          <span className="gradient-text">Unlimited</span>
          <br />
          Tools.
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-5 leading-relaxed">
          Everything you need — YouTube tools, SEO analyzers, developer utilities, image editors, calculators, and more. All free, all in one place.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href="/categories"
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand-500/25"
          >
            Explore All Tools
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tools/youtube-tag-generator"
            className="flex items-center gap-2 px-6 py-2.5 border border-border hover:bg-muted font-semibold rounded-xl transition-colors"
          >
            ▶ YouTube Tag Generator
          </Link>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-5">
          <SearchBar size="lg" placeholder="Search 500+ tools — JSON Formatter, Tag Generator, Word Counter..." />
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          {highlights.map((h) => (
            <span key={h} className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {h}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
