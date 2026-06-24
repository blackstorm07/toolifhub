'use client';

import { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';

function analyzeText(text) {
  if (!text.trim()) return { words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, readingTime: 0 };
  const words = text.trim().match(/\b\w+\b/g)?.length || 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length || 1;
  const readingTime = Math.ceil(words / 200); // avg 200 wpm
  return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime };
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const stats = useMemo(() => analyzeText(text), [text]);
  const [tracked, setTracked] = useState(false);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!tracked && e.target.value.length > 20) {
      trackToolUsage('word-counter', 'Word Counter');
      setTracked(true);
    }
  };

  const statCards = [
    { label: 'Words', value: stats.words, icon: '📝' },
    { label: 'Characters', value: stats.chars, icon: '🔤' },
    { label: 'Chars (no spaces)', value: stats.charsNoSpaces, icon: '✂️' },
    { label: 'Sentences', value: stats.sentences, icon: '📖' },
    { label: 'Paragraphs', value: stats.paragraphs, icon: '📄' },
    { label: 'Reading Time', value: stats.readingTime ? `${stats.readingTime} min` : '< 1 min', icon: '⏱️' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon }) => (
          <div key={label} className="flex flex-col items-center p-4 bg-muted/30 rounded-2xl border border-border text-center">
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Your Text</label>
          {text && (
            <button onClick={() => setText('')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <textarea
          value={text} onChange={handleChange}
          placeholder="Start typing or paste your text here..."
          rows={16}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {text && (
        <div className="p-4 bg-muted/30 rounded-xl text-sm space-y-1.5">
          <p className="font-medium">Keyword Density</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              text.toLowerCase().match(/\b\w{4,}\b/g)?.reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc; }, {}) || {}
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([word, count]) => (
                <span key={word} className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs">
                  {word} <span className="font-bold text-brand-500">×{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
