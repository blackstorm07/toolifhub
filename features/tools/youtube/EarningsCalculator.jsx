'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';

const CPM_RANGES = {
  'education': { min: 5, max: 15 },
  'finance': { min: 10, max: 30 },
  'tech': { min: 4, max: 12 },
  'gaming': { min: 2, max: 8 },
  'entertainment': { min: 1.5, max: 6 },
  'cooking': { min: 2, max: 8 },
  'fitness': { min: 3, max: 10 },
  'general': { min: 2, max: 8 },
};

export default function EarningsCalculator() {
  const [form, setForm] = useState({ views: '100000', cpm: '5', niche: 'general', rpm: '' });
  const [result, setResult] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const calculate = () => {
    trackToolUsage('youtube-earnings-calculator', 'YouTube Earnings Calculator');
    const views = parseFloat(form.views) || 0;
    const cpm = parseFloat(form.cpm) || 5;
    const rpm = parseFloat(form.rpm) || cpm * 0.45; // ~45% of CPM goes to creator

    const nicheRange = CPM_RANGES[form.niche] || CPM_RANGES.general;
    const minEarnings = (views / 1000) * nicheRange.min * 0.45;
    const maxEarnings = (views / 1000) * nicheRange.max * 0.45;
    const estimatedEarnings = (views / 1000) * rpm;

    setResult({ views, cpm, rpm, estimatedEarnings, minEarnings, maxEarnings, nicheRange });
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Monthly Video Views</label>
          <input type="number" value={form.views} onChange={set('views')} min="0"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="100000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Niche / Category</label>
          <select value={form.niche} onChange={set('niche')}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500">
            {Object.keys(CPM_RANGES).map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">CPM Rate ($ per 1000 views)</label>
          <input type="number" value={form.cpm} onChange={set('cpm')} step="0.1" min="0"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">RPM (optional, overrides CPM)</label>
          <input type="number" value={form.rpm} onChange={set('rpm')} step="0.1" min="0"
            placeholder="Auto-calculated"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
      </div>

      <button onClick={calculate} className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
        <DollarSign className="w-4 h-4" /> Calculate Earnings
      </button>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-900 text-center">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Estimated Earnings</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{fmt(result.estimatedEarnings)}</p>
            </div>
            <div className="p-5 bg-muted rounded-2xl text-center">
              <p className="text-sm text-muted-foreground font-medium mb-1">Min Estimate</p>
              <p className="text-2xl font-bold">{fmt(result.minEarnings)}</p>
            </div>
            <div className="p-5 bg-muted rounded-2xl text-center">
              <p className="text-sm text-muted-foreground font-medium mb-1">Max Estimate</p>
              <p className="text-2xl font-bold">{fmt(result.maxEarnings)}</p>
            </div>
          </div>

          <div className="p-5 bg-card border border-border rounded-2xl space-y-3 text-sm">
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Breakdown</h3>
            <div className="grid grid-cols-2 gap-y-2 text-muted-foreground">
              <span>Total Views:</span><span className="font-medium text-foreground">{result.views.toLocaleString()}</span>
              <span>CPM:</span><span className="font-medium text-foreground">${result.cpm.toFixed(2)}</span>
              <span>RPM (your share):</span><span className="font-medium text-foreground">${result.rpm.toFixed(2)}</span>
              <span>Niche CPM Range:</span><span className="font-medium text-foreground">${result.nicheRange.min}–${result.nicheRange.max}</span>
            </div>
          </div>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            Estimates are approximations. Actual earnings depend on audience location, ad formats, engagement, and advertiser demand.
          </p>
        </div>
      )}
    </div>
  );
}
