'use client';

import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';
import { copyToClipboard, downloadText } from '@/lib/utils';

const CARD_TYPES = [
  { value: 'summary', label: 'Summary' },
  { value: 'summary_large_image', label: 'Summary Large Image' },
  { value: 'app', label: 'App' },
  { value: 'player', label: 'Player' },
];

export default function TwitterCardGenerator() {
  const [form, setForm] = useState({
    card: 'summary_large_image', title: '', description: '', image: '', site: '', creator: '',
  });
  const [copied, setCopied] = useState(false);
  const [tracked, setTracked] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (!tracked) { trackToolUsage('twitter-card-generator', 'Twitter Card Generator'); setTracked(true); }
  };

  const tags = useMemo(() => {
    const lines = [`<meta name="twitter:card" content="${form.card}" />`];
    if (form.site) lines.push(`<meta name="twitter:site" content="${escapeHtml(form.site)}" />`);
    if (form.creator) lines.push(`<meta name="twitter:creator" content="${escapeHtml(form.creator)}" />`);
    if (form.title) lines.push(`<meta name="twitter:title" content="${escapeHtml(form.title)}" />`);
    if (form.description) lines.push(`<meta name="twitter:description" content="${escapeHtml(form.description)}" />`);
    if (form.image) lines.push(`<meta name="twitter:image" content="${escapeHtml(form.image)}" />`);
    return lines.join('\n');
  }, [form]);

  const handleCopy = () => {
    copyToClipboard(tags);
    setCopied(true);
    toast.success('Twitter Card tags copied!');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">Card Type</label>
        <select
          value={form.card} onChange={set('card')}
          className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          {CARD_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="@Site Handle" value={form.site} onChange={set('site')} placeholder="@ToolifHub" />
        <Field label="@Creator Handle" value={form.creator} onChange={set('creator')} placeholder="@yourhandle" />
        <Field label="Title *" value={form.title} onChange={set('title')} placeholder="Page title" className="sm:col-span-2" />
        <Field label="Image URL" value={form.image} onChange={set('image')} placeholder="https://example.com/twitter-image.jpg" className="sm:col-span-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          value={form.description} onChange={set('description')} rows={3}
          placeholder="Brief description of the page"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {form.image && (
        <div className={`rounded-xl border border-border overflow-hidden bg-muted/30 ${form.card === 'summary' ? 'max-w-xs flex' : 'max-w-sm'}`}>
          <div className={form.card === 'summary' ? 'w-24 h-24 flex-shrink-0 bg-muted overflow-hidden' : 'aspect-video bg-muted overflow-hidden'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="Twitter card preview" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
          </div>
          <div className="p-3 min-w-0">
            <p className="text-sm font-semibold truncate">{form.title || 'Page title'}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{form.description}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Generated Tags</label>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />} Copy
            </button>
            <button onClick={() => downloadText('twitter-card-tags.html', tags)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Download
            </button>
          </div>
        </div>
        <pre className="code-block whitespace-pre-wrap text-xs">{tags}</pre>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        value={value} onChange={onChange} placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
      />
    </div>
  );
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
