'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

const GST_RATES = [0, 0.1, 0.25, 3, 5, 12, 18, 28];

export default function GSTCalculator() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [type, setType] = useState('exclusive'); // exclusive = add GST, inclusive = extract GST
  const [copied, setCopied] = useState('');

  const calc = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0 || !gstRate) return null;
    const rate = gstRate / 100;

    if (type === 'exclusive') {
      const gstAmount = a * rate;
      const total = a + gstAmount;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { original: a, gstAmount, total, cgst, sgst };
    } else {
      const original = a / (1 + rate);
      const gstAmount = a - original;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { original, gstAmount, total: a, cgst, sgst };
    }
  };

  const result = calc();
  const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const copy = async (field, value) => {
    trackToolUsage('gst-calculator', 'GST Calculator');
    await copyToClipboard(value.toFixed(2));
    setCopied(field); toast.success('Copied!'); setTimeout(() => setCopied(''), 2000);
  };

  const rows = result ? [
    { key: 'original', label: type === 'exclusive' ? 'Original Amount' : 'Pre-GST Amount', value: result.original },
    { key: 'cgst', label: `CGST (${gstRate / 2}%)`, value: result.cgst },
    { key: 'sgst', label: `SGST (${gstRate / 2}%)`, value: result.sgst },
    { key: 'gst', label: `Total GST (${gstRate}%)`, value: result.gstAmount },
    { key: 'total', label: 'Total Amount (incl. GST)', value: result.total, highlight: true },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-2">Amount (₹)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10000"
            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">GST Rate (%)</label>
          <div className="flex flex-wrap gap-2">
            {GST_RATES.map(r => (
              <button key={r} onClick={() => setGstRate(r)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${gstRate === r ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>
                {r}%
              </button>
            ))}
          </div>
          <input type="number" value={gstRate} onChange={e => setGstRate(parseFloat(e.target.value) || 0)} placeholder="Custom rate"
            className="mt-2 w-32 h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Calculation Type</label>
          <div className="space-y-2">
            {[{ id: 'exclusive', label: 'GST Exclusive (Add GST to amount)' }, { id: 'inclusive', label: 'GST Inclusive (Extract GST from amount)' }].map(t => (
              <label key={t.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <input type="radio" value={t.id} checked={type === t.id} onChange={() => setType(t.id)} className="mt-0.5" />
                <span className="text-sm">{t.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-2">
          {rows.map(({ key, label, value, highlight }) => (
            <div key={key} className={`flex items-center justify-between px-5 py-3.5 rounded-xl border ${highlight ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 font-semibold' : 'bg-muted/20 border-border'}`}>
              <span className={`text-sm ${highlight ? 'text-brand-800 dark:text-brand-200' : ''}`}>{label}</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${highlight ? 'text-brand-700 dark:text-brand-300 font-bold text-base' : ''}`}>{fmt(value)}</span>
                <button onClick={() => copy(key, value)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied === key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
