'use client';

import { useState } from 'react';
import { Search, PlugZap, AlertTriangle } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';

// Shared shell for tools that need a real third-party data provider
// (ranking position, search volume, keyword difficulty, etc). Submits a
// real request to the backing API route every time — when the env var for
// the provider is configured server-side, results render normally; until
// then it surfaces a clear "connect a provider" state instead of fake data.
export default function ServiceGatedTool({ toolSlug, toolName, action, fields, renderResult }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, ''])));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    trackToolUsage(toolSlug, toolName);
    try {
      const res = await fetch('/api/seo/keyword-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...values }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json);
        return;
      }
      setResult(json);
    } catch (err) {
      setError({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.fullWidth ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium mb-1.5">{f.label}</label>
            <input
              value={values[f.key]} onChange={set(f.key)} placeholder={f.placeholder} required={f.required}
              className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 h-11 px-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            Check
          </button>
        </div>
      </form>

      {error && error.envVar && (
        <div className="p-5 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-900 rounded-xl">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
            <PlugZap className="w-4 h-4" /> Data provider not connected
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This tool needs real third-party data and isn&apos;t available without a configured provider. Set{' '}
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{error.envVar}</code> in your environment using {error.provider}, then this form will return live results.
          </p>
        </div>
      )}

      {error && !error.envVar && (
        <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error.error}
        </div>
      )}

      {result && renderResult(result)}
    </div>
  );
}
