'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

const conversions = [
  { id: 'upper', label: 'UPPERCASE', fn: t => t.toUpperCase() },
  { id: 'lower', label: 'lowercase', fn: t => t.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: t => t.replace(/\b\w/g, c => c.toUpperCase()) },
  { id: 'sentence', label: 'Sentence case', fn: t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() },
  { id: 'camel', label: 'camelCase', fn: t => t.toLowerCase().replace(/[\s_-]+(.)/g, (_, c) => c.toUpperCase()) },
  { id: 'pascal', label: 'PascalCase', fn: t => t.replace(/[\s_-]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase()) },
  { id: 'snake', label: 'snake_case', fn: t => t.toLowerCase().replace(/[\s-]+/g, '_') },
  { id: 'kebab', label: 'kebab-case', fn: t => t.toLowerCase().replace(/[\s_]+/g, '-') },
  { id: 'alternating', label: 'aLtErNaTiNg', fn: t => t.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: 'inverse', label: 'iNVERSE cASE', fn: t => t.split('').map(c => c === c.upper ? c.toLowerCase() : c.toUpperCase()).join('') },
];

export default function CaseConverter() {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const copy = async (id, text) => {
    await copyToClipboard(text);
    trackToolUsage('case-converter', 'Case Converter');
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Input Text</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={4}
          placeholder="Type or paste your text here..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
      </div>

      {input && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conversions.map(({ id, label, fn }) => {
            const converted = fn(input);
            return (
              <div key={id} className="group p-4 bg-muted/30 border border-border rounded-xl hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                  <button onClick={() => copy(id, converted)} className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                    {copiedId === id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm font-mono break-all cursor-pointer" onClick={() => copy(id, converted)}>{converted}</p>
              </div>
            );
          })}
        </div>
      )}

      {!input && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Type some text above to see all case conversions instantly
        </div>
      )}
    </div>
  );
}
