'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';
import { copyToClipboard } from '@/lib/utils';
import { estimateTitleWidth, SERP_LIMITS } from '@/lib/seo/serpUtils';

const TEMPLATES = [
  (kw, brand) => `${kw} — ${brand}`,
  (kw, brand) => `Best ${kw} in 2025 | ${brand}`,
  (kw, brand) => `${kw}: The Complete Guide | ${brand}`,
  (kw, brand) => `${kw} — Free, Fast & Easy | ${brand}`,
  (kw, brand) => `How to ${kw} (Step-by-Step) | ${brand}`,
  (kw, brand) => `${kw} | ${brand}`,
  (kw, brand) => `Top ${kw} Tips You Need to Know | ${brand}`,
];

export default function MetaTitleGenerator() {
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const trackedRef = useRef(false);

  const titles = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return [];
    return TEMPLATES.map((t) => t(kw.replace(/\b\w/g, (c) => c.toUpperCase()), brand.trim() || 'YourBrand'));
  }, [keyword, brand]);

  useEffect(() => {
    if (!keyword.trim() || trackedRef.current) return;
    trackToolUsage('meta-title-generator', 'Meta Title Generator');
    trackedRef.current = true;
  }, [keyword]);

  const handleCopy = (text, idx) => {
    copyToClipboard(text);
    setCopiedIdx(idx);
    toast.success('Title copied!');
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Target Keyword / Topic *</label>
          <input
            value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. email marketing software"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Brand Name (optional)</label>
          <input
            value={brand} onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. ToolifHub"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {titles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Enter a keyword to generate SEO-friendly title tag suggestions.
        </div>
      ) : (
        <div className="space-y-2.5">
          {titles.map((title, idx) => {
            const widthPx = estimateTitleWidth(title);
            const tooLong = widthPx > SERP_LIMITS.TITLE_MAX_PX;
            return (
              <div key={idx} className="flex items-start justify-between gap-3 p-3.5 bg-muted/30 rounded-xl border border-border">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400 truncate">{title}</p>
                  <p className={`text-xs mt-1 ${tooLong ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {title.length} characters · {tooLong ? 'May be truncated in search results' : 'Fits within SERP width'}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(title, idx)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Copy title"
                >
                  {copiedIdx === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Recommended length: under {SERP_LIMITS.TITLE_RECOMMENDED_CHARS} characters / {SERP_LIMITS.TITLE_MAX_PX}px so Google doesn&apos;t truncate your title in search results.
      </p>
    </div>
  );
}
