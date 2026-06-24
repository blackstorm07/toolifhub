'use client';
import { useState } from 'react';
import { trackToolUsage } from '@/lib/analytics';

export default function EMICalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [tenureType, setTenureType] = useState('years');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const t = parseFloat(tenure);
    if (!P || !annualRate || !t || P <= 0 || annualRate <= 0 || t <= 0) return;

    const months = tenureType === 'years' ? t * 12 : t;
    const r = annualRate / 12 / 100;
    const emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;

    // Build amortization schedule (first 12 months + last month)
    const schedule = [];
    let balance = P;
    for (let i = 1; i <= months; i++) {
      const interest = balance * r;
      const principalPaid = emi - interest;
      balance -= principalPaid;
      schedule.push({ month: i, emi, principal: principalPaid, interest, balance: Math.max(0, balance) });
    }

    trackToolUsage('emi-calculator', 'EMI Calculator');
    setResult({ emi, totalPayment, totalInterest, months, schedule });
  };

  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Loan Amount (₹)</label>
          <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="500000"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="8.5" step="0.1"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-2">Loan Tenure</label>
          <div className="flex gap-3">
            <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} placeholder="5"
              className="flex-1 h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
            <div className="flex rounded-xl border border-border overflow-hidden">
              {['years', 'months'].map(t => (
                <button key={t} onClick={() => setTenureType(t)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tenureType === t ? 'bg-brand-500 text-white' : 'hover:bg-muted'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
        Calculate EMI
      </button>

      {result && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Monthly EMI', value: fmt(result.emi), accent: true },
              { label: 'Total Interest', value: fmt(result.totalInterest) },
              { label: 'Total Payment', value: fmt(result.totalPayment) },
            ].map(({ label, value, accent }) => (
              <div key={label} className={`p-5 rounded-2xl border text-center ${accent ? 'bg-brand-500 border-brand-500 text-white' : 'bg-muted/30 border-border'}`}>
                <p className={`text-sm mb-1 ${accent ? 'text-brand-100' : 'text-muted-foreground'}`}>{label}</p>
                <p className={`text-2xl font-bold ${accent ? 'text-white' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Pie visual */}
          <div className="p-5 bg-muted/20 border border-border rounded-2xl">
            <p className="text-sm font-medium mb-3">Loan Breakdown</p>
            <div className="flex gap-4 items-center">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.8" className="text-muted/30" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.8" className="text-brand-500"
                    strokeDasharray={`${(parseFloat(principal) / result.totalPayment * 100).toFixed(1)} 100`} strokeLinecap="round" />
                </svg>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-500 inline-block" /><span>Principal: {fmt(parseFloat(principal))} ({(parseFloat(principal) / result.totalPayment * 100).toFixed(1)}%)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-muted-foreground inline-block" /><span>Interest: {fmt(result.totalInterest)} ({(result.totalInterest / result.totalPayment * 100).toFixed(1)}%)</span></div>
              </div>
            </div>
          </div>

          {/* Amortization - first 6 months */}
          <div className="overflow-x-auto">
            <p className="text-sm font-medium mb-2">Amortization Schedule (first 6 months)</p>
            <table className="w-full text-xs text-left border-collapse">
              <thead><tr className="border-b border-border">{['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map(h => <th key={h} className="py-2 px-3 font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>
                {result.schedule.slice(0, 6).map(r => (
                  <tr key={r.month} className="border-b border-border/50 hover:bg-muted/20">
                    {[r.month, fmt(r.emi), fmt(r.principal), fmt(r.interest), fmt(r.balance)].map((v, i) => <td key={i} className="py-2 px-3">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
