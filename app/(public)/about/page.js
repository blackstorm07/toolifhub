import { buildPageMetadata } from '@/lib/seo/metadata';
import JsonLd, { buildOrganizationSchema } from '@/components/seo/JsonLd';

export const metadata = buildPageMetadata({
  title: 'About ToolifHub — One Hub. Unlimited Tools.',
  description: 'Learn about ToolifHub — the free online tools platform built for developers, creators, and productivity enthusiasts.',
  path: '/about',
  keywords: ['about toolifhub', 'free tools platform', 'online tools'],
});

const values = [
  { icon: '🆓', title: 'Always Free', desc: 'Every tool on ToolifHub is free to use, forever. No hidden fees, no premium tiers.' },
  { icon: '🔒', title: 'Privacy First', desc: "We don't store your data. All processing happens in your browser or is discarded immediately." },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Built on Next.js 15 with edge-optimized infrastructure for sub-second tool loads.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Every tool is designed mobile-first and works perfectly on any device or screen size.' },
];

export default function AboutPage() {
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ToolifHub';
  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <div className="page max-w-7xl">
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-4">About Us</p>
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-6">
          We built <span className="gradient-text">{APP_NAME}</span> so you don&apos;t have to jump between 50 tabs.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Every day, millions of people need simple online tools — and they end up scattered across dozens of slow, ad-heavy websites. We decided to fix that.
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none mb-10">
        <h2>Our Mission</h2>
        <p>
          {APP_NAME} is a free, premium-quality online tools platform. Our goal is simple: give everyone access to the tools they need — fast, private, and beautifully designed — without the clutter.
        </p>
        <p>
          We serve developers, YouTubers, SEO professionals, content creators, students, and everyday internet users who just need a reliable tool without the hassle.
        </p>
        <h2>What We Offer</h2>
        <p>
          50+ tools spanning YouTube optimization, SEO analysis, developer utilities, text processing, image editing, calculators, converters, and more. Each tool is designed with care, optimized for speed, and continuously improved based on user feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {values.map((v) => (
          <div key={v.title} className="flex gap-4 p-6 rounded-2xl border border-border bg-card">
            <div className="text-3xl flex-shrink-0">{v.icon}</div>
            <div>
              <h3 className="font-bold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 border border-brand-100 dark:border-brand-900">
        <h2 className="text-2xl font-bold mb-3">Have a tool idea?</h2>
        <p className="text-muted-foreground mb-6">We&apos;re always adding new tools. If there&apos;s something you&apos;d love to see, let us know!</p>
        <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors">
          Suggest a Tool
        </a>
      </div>
    </div>
    </>
  );
}
