'use client';

import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';

function Row({ label, value, status }) {
  const Icon = status === 'good' ? CheckCircle : status === 'warn' ? AlertTriangle : XCircle;
  const color = status === 'good' ? 'text-green-500' : status === 'warn' ? 'text-amber-500' : 'text-red-500';
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex items-start gap-2 min-w-0">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground break-words mt-0.5">{value || '(not found)'}</p>
        </div>
      </div>
    </div>
  );
}

export default function MetaTagsAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    trackToolUsage('meta-tags-analyzer', 'Meta Tags Analyzer');
    try {
      const res = await fetch('/api/seo/inspect-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to analyze URL');
      setData(json.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
        <input
          value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
        <button
          type="submit" disabled={loading || !url.trim()}
          className="flex items-center justify-center gap-2 h-11 px-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          Analyze
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
          <p className="text-xs text-muted-foreground mb-2">
            HTTP {data.httpStatus} · {(data.contentLengthBytes / 1024).toFixed(1)} KB
          </p>
          <Row label="Title Tag" value={data.title} status={data.title ? (data.title.length > 60 ? 'warn' : 'good') : 'bad'} />
          <Row label="Meta Description" value={data.metaDescription} status={data.metaDescription ? (data.metaDescription.length > 160 ? 'warn' : 'good') : 'bad'} />
          <Row label="Canonical URL" value={data.canonical} status={data.canonical ? 'good' : 'warn'} />
          <Row label="Meta Robots" value={data.metaRobots} status={data.metaRobots ? 'good' : 'warn'} />
          <Row label="Viewport" value={data.viewport} status={data.viewport ? 'good' : 'bad'} />
          <Row label="H1 Tags" value={`${data.h1Count} found${data.headings.h1[0] ? ` — "${data.headings.h1[0]}"` : ''}`} status={data.h1Count === 1 ? 'good' : 'warn'} />
          <Row label="Open Graph Title" value={data.openGraph.title} status={data.openGraph.title ? 'good' : 'warn'} />
          <Row label="Open Graph Image" value={data.openGraph.image} status={data.openGraph.image ? 'good' : 'warn'} />
          <Row label="Twitter Card" value={data.twitter.card} status={data.twitter.card ? 'good' : 'warn'} />
          <Row label="Images Missing Alt Text" value={`${data.images.missingAlt} of ${data.images.total}`} status={data.images.missingAlt === 0 ? 'good' : 'warn'} />
          <Row label="Internal / External Links" value={`${data.links.internal} internal · ${data.links.external} external`} status="good" />
        </div>
      )}

      {!data && !error && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Enter any public URL to fetch and analyze its title, meta description, Open Graph/Twitter tags, headings, and more.
        </p>
      )}
    </div>
  );
}
