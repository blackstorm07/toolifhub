'use client';
import { useState, useMemo, useEffect } from 'react';
import { trackToolUsage } from '@/lib/analytics';

const FLAGS = ['g', 'i', 'm', 's'];

const EXAMPLES = [
  { label: 'Email', pattern: '[\\w.-]+@[\\w-]+\\.[a-zA-Z]{2,}', flags: 'g', text: 'Contact us at hello@toolifhub.com or support@example.co' },
  { label: 'URL', pattern: 'https?:\\/\\/[\\w.-]+(?:\\/[\\w\\-./?%&=]*)?', flags: 'g', text: 'Visit https://toolifhub.com or http://example.com/page?id=1' },
  { label: 'Phone (India)', pattern: '[6-9]\\d{9}', flags: 'g', text: 'Call us at 9876543210 or 8123456789' },
  { label: 'Hex Color', pattern: '#[0-9a-fA-F]{3,6}\\b', flags: 'g', text: 'Brand colors: #6366f1, #fff, and #1E293B' },
  { label: 'Digits Only', pattern: '\\d+', flags: 'g', text: 'Order #12345 shipped on 2024-06-01 with 3 items' },
];

function useRegex(pattern, flags) {
  return useMemo(() => {
    if (!pattern) return { regex: null, error: '' };
    try {
      return { regex: new RegExp(pattern, flags), error: '' };
    } catch (e) {
      return { regex: null, error: e.message };
    }
  }, [pattern, flags]);
}

function HighlightedText({ text, regex }) {
  if (!regex || !text) return <span className="text-muted-foreground">{text || 'Test text will appear here…'}</span>;

  const parts = [];
  let lastIndex = 0;
  let match;
  const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');

  while ((match = globalRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), matched: false });
    parts.push({ text: match[0], matched: true });
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) globalRegex.lastIndex++;
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), matched: false });

  return (
    <>
      {parts.map((p, i) =>
        p.matched ? (
          <mark key={i} className="bg-brand-200 dark:bg-brand-800 text-foreground rounded px-0.5">{p.text}</mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');

  const { regex, error } = useRegex(pattern, flags);

  const matches = useMemo(() => {
    if (!regex || !text) return [];
    const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    const results = [];
    let match;
    while ((match = globalRegex.exec(text)) !== null) {
      results.push({ match: match[0], index: match.index, groups: match.slice(1) });
      if (match[0].length === 0) globalRegex.lastIndex++;
    }
    return results;
  }, [regex, text]);

  useEffect(() => {
    if (pattern && regex) trackToolUsage('regex-tester', 'Regex Tester');
  }, [pattern, regex]);

  const toggleFlag = (flag) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  const loadExample = (example) => {
    setPattern(example.pattern);
    setFlags(example.flags);
    setText(example.text);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Common Examples</label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => loadExample(ex)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="[a-z]+"
            className="flex-1 h-11 px-3 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <span className="text-muted-foreground font-mono">/{flags}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FLAGS.map((flag) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                flags.includes(flag) ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'
              }`}
            >
              {flag}
            </button>
          ))}
        </div>
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Test Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text to test your pattern against…"
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Highlighted Matches {matches.length > 0 && `(${matches.length})`}</label>
        <div className="w-full min-h-[80px] p-4 rounded-xl border border-border bg-muted/20 font-mono text-sm whitespace-pre-wrap break-words">
          <HighlightedText text={text} regex={regex} />
        </div>
      </div>

      {matches.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Match Details</label>
          {matches.slice(0, 20).map((m, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/10 text-sm">
              <span className="font-mono">{m.match}</span>
              <span className="text-xs text-muted-foreground">index {m.index}{m.groups.length > 0 ? ` · groups: ${m.groups.filter(Boolean).join(', ')}` : ''}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
