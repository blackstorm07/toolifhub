'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function toSlug(text, separator = '-') {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, separator).replace(/^-+|-+$/g, '');
}

export default function SlugGenerator() {
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [copied, setCopied] = useState(false);
  const slug = input ? toSlug(input, separator) : '';

  const copy = async () => {
    if (!slug) return;
    await copyToClipboard(slug);
    trackToolUsage('slug-generator', 'Slug Generator');
    setCopied(true);
    toast.success('Slug copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Input Text</label>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="My Awesome Blog Post Title"
          className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Separator</label>
        <div className="flex gap-2">
          {[{ id: '-', label: 'Hyphen (-)' }, { id: '_', label: 'Underscore (_)' }, { id: '', label: 'None' }].map(s => (
            <button key={s.id} onClick={() => setSeparator(s.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${separator === s.id ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {slug && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Generated Slug</label>
          <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl">
            <code className="flex-1 text-sm font-mono text-brand-600 dark:text-brand-400 break-all">{slug}</code>
            <button onClick={copy} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy
            </button>
          </div>
        </div>
      )}

      {input && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-muted/30 rounded-xl"><span className="text-muted-foreground">Original length:</span> <span className="font-mono font-bold">{input.length}</span></div>
          <div className="p-3 bg-muted/30 rounded-xl"><span className="text-muted-foreground">Slug length:</span> <span className="font-mono font-bold">{slug.length}</span></div>
        </div>
      )}
    </div>
  );
}
