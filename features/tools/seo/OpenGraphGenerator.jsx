'use client';

import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';
import { copyToClipboard, downloadText } from '@/lib/utils';

const TYPES = ['website', 'article', 'product', 'profile', 'video.other'];

export default function OpenGraphGenerator() {
  const [form, setForm] = useState({
    title: '', description: '', url: '', image: '', siteName: '', type: 'website',
  });
  const [copied, setCopied] = useState(false);
  const [tracked, setTracked] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (!tracked) { trackToolUsage('open-graph-generator', 'Open Graph Tag Generator'); setTracked(true); }
  };

  const tags = useMemo(() => {
    const lines = [];
    if (form.title) lines.push(`<meta property="og:title" content="${escapeHtml(form.title)}" />`);
    if (form.description) lines.push(`<meta property="og:description" content="${escapeHtml(form.description)}" />`);
    if (form.url) lines.push(`<meta property="og:url" content="${escapeHtml(form.url)}" />`);
    if (form.image) lines.push(`<meta property="og:image" content="${escapeHtml(form.image)}" />`);
    if (form.siteName) lines.push(`<meta property="og:site_name" content="${escapeHtml(form.siteName)}" />`);
    lines.push(`<meta property="og:type" content="${form.type}" />`);
    return lines.join('\n');
  }, [form]);

  const hasContent = form.title || form.description || form.url || form.image;

  const handleCopy = () => {
    copyToClipboard(tags);
    setCopied(true);
    toast.success('Open Graph tags copied!');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Title *" value={form.title} onChange={set('title')} placeholder="Page title" />
        <Field label="Site Name" value={form.siteName} onChange={set('siteName')} placeholder="ToolifHub" />
        <Field label="Page URL" value={form.url} onChange={set('url')} placeholder="https://example.com/page" className="sm:col-span-2" />
        <Field label="Image URL" value={form.image} onChange={set('image')} placeholder="https://example.com/og-image.jpg" className="sm:col-span-2" />
        <div>
          <label className="block text-sm font-medium mb-1.5">Type</label>
          <select
            value={form.type} onChange={set('type')}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          value={form.description} onChange={set('description')} rows={3}
          placeholder="Brief description of the page"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      {hasContent && form.image && (
        <div className="rounded-xl border border-border overflow-hidden bg-muted/30 max-w-sm">
          <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="OG preview" className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground truncate">{form.url || 'example.com'}</p>
            <p className="text-sm font-semibold truncate mt-0.5">{form.title || 'Page title'}</p>
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
            <button
              onClick={() => downloadText('og-tags.html', tags)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
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
