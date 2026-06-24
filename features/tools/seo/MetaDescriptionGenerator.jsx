'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';
import { copyToClipboard } from '@/lib/utils';
import { estimateDescriptionWidth, SERP_LIMITS } from '@/lib/seo/serpUtils';

const TEMPLATES = [
  (kw) => `Discover everything you need to know about ${kw}. Get expert tips, practical guides, and proven strategies — completely free, no sign-up required.`,
  (kw) => `Looking for the best ${kw}? Compare top options, learn key benefits, and find the perfect fit for your needs in minutes.`,
  (kw) => `Master ${kw} with our step-by-step guide. Clear explanations, real examples, and actionable advice you can use today.`,
  (kw) => `${kw.charAt(0).toUpperCase() + kw.slice(1)} made simple. Free tools, expert tips, and everything you need — all in one place.`,
];

export default function MetaDescriptionGenerator() {
  const [keyword, setKeyword] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const trackedRef = useRef(false);

  const descriptions = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return [];
    return TEMPLATES.map((t) => t(kw));
  }, [keyword]);

  useEffect(() => {
    if (!keyword.trim() || trackedRef.current) return;
    trackToolUsage('meta-description-generator', 'Meta Description Generator');
    trackedRef.current = true;
  }, [keyword]);

  const handleCopy = (text, idx) => {
    copyToClipboard(text);
    setCopiedIdx(idx);
    toast.success('Description copied!');
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">Target Keyword / Topic *</label>
        <input
          value={keyword} onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. project management software"
          className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
      </div>

      {descriptions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Enter a keyword to generate SEO-friendly meta description suggestions.
        </div>
      ) : (
        <div className="space-y-2.5">
          {descriptions.map((desc, idx) => {
            const widthPx = estimateDescriptionWidth(desc);
            const tooLong = widthPx > SERP_LIMITS.DESC_MAX_PX;
            return (
              <div key={idx} className="flex items-start justify-between gap-3 p-3.5 bg-muted/30 rounded-xl border border-border">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{desc}</p>
                  <p className={`text-xs mt-1.5 ${tooLong ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {desc.length} characters · {tooLong ? 'May be truncated in search results' : 'Fits within SERP width'}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(desc, idx)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Copy description"
                >
                  {copiedIdx === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Recommended length: under {SERP_LIMITS.DESC_RECOMMENDED_CHARS} characters so Google doesn&apos;t truncate your description in search results.
      </p>
    </div>
  );
}
