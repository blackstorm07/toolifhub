import { CheckCircle2 } from 'lucide-react';
import ToolFAQ from '@/components/tools/ToolFAQ';
import { generateToolSeoContent } from '@/lib/seo/toolContent';
import Link from 'next/link';

export default function ToolSeoContent({ tool, categoryName }) {
  const content = generateToolSeoContent(tool, categoryName);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold not-prose mb-4">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">{content.overview}</p>
      </section>

      {/* Full description from DB */}
      {tool.fullDescription && (
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold not-prose mb-4">About {tool.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: tool.fullDescription }} />
        </section>
      )}

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Key Features</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Benefits</h2>
        <ul className="space-y-3">
          {content.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How to Use */}
      <section>
        <h2 className="text-2xl font-bold mb-4">How to Use {tool.title}</h2>
        <ol className="space-y-3">
          {content.howToUse.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-muted-foreground pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Use Cases */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.useCases.map((uc, i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-2">{uc.title}</h3>
              <p className="text-sm text-muted-foreground">{uc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category internal link */}
      {tool.category?.slug && (
        <section className="p-5 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
          <p className="text-sm text-muted-foreground">
            Explore more tools in our{' '}
            <Link href={`/category/${tool.category.slug}`} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              {categoryName || tool.category.name}
            </Link>{' '}
            category, or browse all{' '}
            <Link href="/categories" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              free online tools
            </Link>{' '}
            on ToolifHub.
          </p>
        </section>
      )}

      {/* FAQ — only render if not already shown via ToolFAQ with tool.faq */}
      {content.faq?.length > 0 && !tool.faq?.length && <ToolFAQ faqs={content.faq} />}
    </div>
  );
}
