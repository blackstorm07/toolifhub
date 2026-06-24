'use client';

import { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'as', 'by', 'this', 'that', 'it', 'be', 'have', 'has', 'had', 'i', 'you', 'we', 'they', 'your', 'our']);

function analyzeDensity(text) {
  const words = (text.toLowerCase().match(/[a-z0-9'-]+/g) || []);
  const totalWords = words.length;
  if (!totalWords) return { totalWords: 0, single: [], double: [], triple: [] };

  const countNgrams = (n) => {
    const counts = {};
    for (let i = 0; i <= words.length - n; i++) {
      const gram = words.slice(i, i + n);
      if (n === 1 && STOPWORDS.has(gram[0])) continue;
      if (gram.some((w) => w.length < 2)) continue;
      const phrase = gram.join(' ');
      counts[phrase] = (counts[phrase] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, c]) => c > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([phrase, count]) => ({ phrase, count, density: ((count * n / totalWords) * 100).toFixed(2) }));
  };

  return {
    totalWords,
    single: countNgrams(1),
    double: countNgrams(2),
    triple: countNgrams(3),
  };
}

export default function KeywordDensityChecker() {
  const [text, setText] = useState('');
  const [tracked, setTracked] = useState(false);
  const [tab, setTab] = useState('single');

  const result = useMemo(() => analyzeDensity(text), [text]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!tracked && e.target.value.length > 30) { trackToolUsage('keyword-density-checker', 'Keyword Density Checker'); setTracked(true); }
  };

  const tabs = [
    { key: 'single', label: '1 Word', data: result.single },
    { key: 'double', label: '2 Words', data: result.double },
    { key: 'triple', label: '3 Words', data: result.triple },
  ];
  const activeData = tabs.find((t) => t.key === tab)?.data || [];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Paste your content</label>
          {text && (
            <button onClick={() => setText('')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <textarea
          value={text} onChange={handleChange}
          placeholder="Paste an article, blog post, or page content to check keyword density..."
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
        <p className="text-xs text-muted-foreground">{result.totalWords} words analyzed</p>
      </div>

      {result.totalWords > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.key ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No repeated phrases found for this length yet — keep writing or try another tab.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeData.map(({ phrase, count, density }) => (
                <div key={phrase} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
                  <span className="text-sm font-medium truncate">{phrase}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{count}× · {density}%</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Healthy keyword density is typically 1–3%. Densities above 5% can look like keyword stuffing to search engines.
          </p>
        </div>
      )}
    </div>
  );
}
