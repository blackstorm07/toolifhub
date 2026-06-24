'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';
import { copyToClipboard, downloadText } from '@/lib/utils';
import { dedupe } from '@/lib/seo/keywordCombinator';

// Reusable shell for "seed keyword -> generated phrase list" tools
// (Long Tail Keyword Generator, Keyword Suggestion Tool, LSI Keyword
// Generator, Related Keywords Finder). Each tool supplies a generator fn
// and copy, the rest of the UI/UX is shared.
export default function KeywordListGenerator({ toolSlug, toolName, placeholder, helperText, generate, disclaimer }) {
  const [seed, setSeed] = useState('');
  const [tracked, setTracked] = useState(false);

  const results = useMemo(() => {
    if (!seed.trim()) return [];
    return dedupe(generate(seed));
  }, [seed, generate]);

  const handleChange = (e) => {
    setSeed(e.target.value);
    if (!tracked && e.target.value.trim().length > 1) { trackToolUsage(toolSlug, toolName); setTracked(true); }
  };

  const handleCopyAll = () => {
    copyToClipboard(results.join('\n'));
    toast.success('All keywords copied!');
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">Seed Keyword *</label>
        <input
          value={seed} onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
        {helperText && <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Enter a seed keyword to generate suggestions.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{results.length} suggestions</p>
            <div className="flex items-center gap-3">
              <button onClick={handleCopyAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Copy className="w-3.5 h-3.5" /> Copy All
              </button>
              <button
                onClick={() => downloadText(`${toolSlug}.txt`, results.join('\n'))}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[28rem] overflow-y-auto pr-1">
            {results.map((kw) => <KeywordChip key={kw} keyword={kw} />)}
          </div>
        </div>
      )}

      {disclaimer && <p className="text-xs text-muted-foreground">{disclaimer}</p>}
    </div>
  );
}

function KeywordChip({ keyword }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { copyToClipboard(keyword); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-muted/30 hover:bg-muted rounded-xl border border-border text-left transition-colors"
    >
      <span className="text-sm truncate">{keyword}</span>
      {copied ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
    </button>
  );
}
