'use client';
import { useState } from 'react';
import { trackToolUsage } from '@/lib/analytics';

export default function DiscountCalculator() {
  const [mode, setMode] = useState('percent'); // percent | fixed | find-percent | find-price
  const [original, setOriginal] = useState('');
  const [discount, setDiscount] = useState('');
  const [final, setFinal] = useState('');

  const calc = () => {
    const o = parseFloat(original);
    const d = parseFloat(discount);
    const f = parseFloat(final);

    if (mode === 'percent' && o > 0 && d >= 0 && d <= 100) {
      const saving = o * d / 100;
      return { saving, finalPrice: o - saving, percent: d, original: o };
    }
    if (mode === 'fixed' && o > 0 && d >= 0 && d <= o) {
      return { saving: d, finalPrice: o - d, percent: (d / o * 100), original: o };
    }
    if (mode === 'find-percent' && o > 0 && f >= 0 && f <= o) {
      const saving = o - f;
      return { saving, finalPrice: f, percent: (saving / o * 100), original: o };
    }
    if (mode === 'find-price' && o > 0 && d >= 0 && d <= 100) {
      const saving = o * d / 100;
      return { saving, finalPrice: o - saving, percent: d, original: o };
    }
    return null;
  };

  const result = calc();
  if (result) trackToolUsage('discount-calculator', 'Discount Calculator');
  const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const modes = [
    { id: 'percent', label: '% Off' },
    { id: 'fixed', label: 'Fixed Discount' },
    { id: 'find-percent', label: 'Find % Off' },
    { id: 'find-price', label: 'Find Price' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Calculator Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {modes.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setOriginal(''); setDiscount(''); setFinal(''); }}
              className={`py-2.5 text-sm font-medium rounded-xl border transition-colors ${mode === m.id ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(mode === 'percent' || mode === 'fixed' || mode === 'find-percent' || mode === 'find-price') && (
          <div>
            <label className="block text-sm font-medium mb-2">Original Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input type="number" value={original} onChange={e => setOriginal(e.target.value)} placeholder="100.00"
                className="w-full h-11 pl-7 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>
        )}

        {(mode === 'percent' || mode === 'find-price') && (
          <div>
            <label className="block text-sm font-medium mb-2">Discount Percentage</label>
            <div className="relative">
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="20" min="0" max="100"
                className="w-full h-11 px-4 pr-8 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
        )}

        {mode === 'fixed' && (
          <div>
            <label className="block text-sm font-medium mb-2">Discount Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="20.00"
                className="w-full h-11 pl-7 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>
        )}

        {mode === 'find-percent' && (
          <div>
            <label className="block text-sm font-medium mb-2">Final Price Paid</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input type="number" value={final} onChange={e => setFinal(e.target.value)} placeholder="80.00"
                className="w-full h-11 pl-7 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-3">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Original Price</p>
                <p className="text-xl font-bold text-foreground">{fmt(result.original)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">You Save</p>
                <p className="text-xl font-bold text-green-600">-{fmt(result.saving)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Final Price</p>
                <p className="text-xl font-bold text-brand-600">{fmt(result.finalPrice)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
            <span className="text-sm text-muted-foreground">That's</span>
            <span className="text-2xl font-bold text-brand-600">{result.percent.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground">off the original price!</span>
          </div>

          {/* Multiple discounts stacked */}
          {mode === 'percent' && (
            <div className="p-4 bg-muted/20 border border-border rounded-xl text-sm space-y-1.5">
              <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Compare with other discounts</p>
              {[10, 15, 20, 25, 30, 40, 50].filter(r => r !== parseFloat(discount)).slice(0, 4).map(r => {
                const s = result.original * r / 100;
                return (
                  <div key={r} className="flex justify-between">
                    <span className="text-muted-foreground">{r}% off</span>
                    <span className="font-mono">{fmt(result.original - s)} <span className="text-muted-foreground text-xs">(save {fmt(s)})</span></span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
