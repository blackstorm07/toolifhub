'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ArticleFaq({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(0);
  if (!faqs.length) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-card">
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              aria-expanded={openIndex === i}
            >
              <span className="font-medium text-sm">{faq.question}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {openIndex === i && (
              <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
