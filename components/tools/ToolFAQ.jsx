'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ToolFAQ({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
      <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <span className="font-semibold text-sm leading-relaxed">{faq.question}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
