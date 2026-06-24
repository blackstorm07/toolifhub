'use client';
import { useState } from 'react';
import { trackToolUsage } from '@/lib/analytics';

function Calc({ label, inputs, formula, resultLabel }) {
  const [vals, setVals] = useState(inputs.map(() => ''));
  const result = (() => { try { return formula(...vals.map(Number)); } catch { return null; } })();
  const valid = vals.every(v => v !== '') && result !== null && isFinite(result) && !isNaN(result);
  return (
    <div className="p-5 bg-muted/20 border border-border rounded-2xl space-y-3">
      <h3 className="font-semibold text-sm">{label}</h3>
      <div className="grid grid-cols-2 gap-3">
        {inputs.map((placeholder, i) => (
          <input key={i} type="number" value={vals[i]} onChange={e => { const n = [...vals]; n[i] = e.target.value; setVals(n); }}
            placeholder={placeholder}
            className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        ))}
      </div>
      <div className={`px-4 py-3 rounded-xl text-sm font-medium ${valid ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'bg-muted text-muted-foreground'}`}>
        {valid ? `${resultLabel}: ${result % 1 === 0 ? result : result.toFixed(2)}` : 'Enter values above'}
      </div>
    </div>
  );
}

export default function PercentageCalculator() {
  const calcs = [
    { label: 'What is X% of Y?', inputs: ['X (percentage)', 'Y (number)'], formula: (x, y) => (x / 100) * y, resultLabel: 'Result' },
    { label: 'X is what % of Y?', inputs: ['X (part)', 'Y (total)'], formula: (x, y) => (x / y) * 100, resultLabel: 'Percentage' },
    { label: '% Increase/Decrease from X to Y', inputs: ['X (original)', 'Y (new value)'], formula: (x, y) => ((y - x) / x) * 100, resultLabel: 'Change %' },
    { label: 'X + Y% increase = ?', inputs: ['X (base)', 'Y (percentage)'], formula: (x, y) => x + (x * y / 100), resultLabel: 'Result' },
    { label: 'X - Y% decrease = ?', inputs: ['X (base)', 'Y (percentage)'], formula: (x, y) => x - (x * y / 100), resultLabel: 'Result' },
    { label: 'X is Y% of what number?', inputs: ['X (value)', 'Y (percentage)'], formula: (x, y) => (x / y) * 100, resultLabel: 'Total' },
  ];

  const trackUsage = () => trackToolUsage('percentage-calculator', 'Percentage Calculator');

  return (
    <div className="space-y-4" onClick={trackUsage}>
      <p className="text-sm text-muted-foreground">Six percentage calculators — fill in any two fields to get the result instantly.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {calcs.map((c, i) => <Calc key={i} {...c} />)}
      </div>
    </div>
  );
}
