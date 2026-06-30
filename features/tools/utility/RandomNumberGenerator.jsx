'use client';
import { useState } from 'react';
import { Copy, Check, RefreshCw, Download, Trash2 } from 'lucide-react';
import { copyToClipboard, downloadText } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function secureRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

function randomDecimal(min, max, places) {
  const value = secureRandom() * (max - min) + min;
  return Number(value.toFixed(places));
}

function generateNumbers({ min, max, quantity, allowDuplicates, mode, decimalPlaces }) {
  if (mode === 'decimal') {
    return Array.from({ length: quantity }, () => randomDecimal(min, max, decimalPlaces));
  }

  if (allowDuplicates) {
    return Array.from({ length: quantity }, () => Math.floor(secureRandom() * (max - min + 1)) + min);
  }

  const pool = [];
  for (let i = min; i <= max; i++) pool.push(i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, quantity);
}

export default function RandomNumberGenerator() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [quantity, setQuantity] = useState('5');
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [mode, setMode] = useState('integer');
  const [decimalPlaces, setDecimalPlaces] = useState('2');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const minVal = Number(min);
    const maxVal = Number(max);
    const qty = Number(quantity);
    const places = Number(decimalPlaces);

    if (min === '' || max === '' || Number.isNaN(minVal) || Number.isNaN(maxVal)) {
      return 'Enter valid minimum and maximum values';
    }
    if (minVal >= maxVal) {
      return 'Minimum must be less than maximum';
    }
    if (quantity === '' || Number.isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      return 'Quantity must be a whole number of at least 1';
    }
    if (qty > 10000) {
      return 'Quantity cannot exceed 10,000';
    }
    if (mode === 'integer' && !allowDuplicates) {
      const range = Math.floor(maxVal) - Math.floor(minVal) + 1;
      if (qty > range) {
        return `Only ${range} unique whole numbers are available in this range`;
      }
    }
    if (mode === 'decimal' && (places === '' || Number.isNaN(places) || places < 0 || places > 10)) {
      return 'Decimal places must be between 0 and 10';
    }
    return '';
  };

  const generate = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    setError('');
    const numbers = generateNumbers({
      min: Math.floor(Number(min)),
      max: Math.floor(Number(max)),
      quantity: Number(quantity),
      allowDuplicates,
      mode,
      decimalPlaces: Number(decimalPlaces),
    });
    setResults(numbers);
    trackToolUsage('random-number-generator', 'Random Number Generator');
    toast.success(`Generated ${numbers.length} number${numbers.length > 1 ? 's' : ''}!`);
  };

  const clear = () => {
    setResults([]);
    setError('');
  };

  const copy = async () => {
    if (!results.length) return;
    await copyToClipboard(results.join(', '));
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    downloadText('random-numbers.txt', results.join('\n'), 'text/plain');
  };

  const downloadCsv = () => {
    const csv = ['number', ...results.map(String)].join('\n');
    downloadText('random-numbers.csv', csv, 'text/csv');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="rng-min" className="text-sm font-medium">Minimum</label>
          <input
            id="rng-min"
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="rng-max" className="text-sm font-medium">Maximum</label>
          <input
            id="rng-max"
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="rng-qty" className="text-sm font-medium">Quantity</label>
          <input
            id="rng-qty"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="rng-mode" className="text-sm font-medium">Number Type</label>
          <select
            id="rng-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="integer">Integer</option>
            <option value="decimal">Decimal</option>
          </select>
        </div>
      </div>

      {mode === 'decimal' && (
        <div className="space-y-2 sm:w-1/2">
          <label htmlFor="rng-places" className="text-sm font-medium">Decimal Places</label>
          <input
            id="rng-places"
            type="number"
            min={0}
            max={10}
            value={decimalPlaces}
            onChange={(e) => setDecimalPlaces(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      )}

      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors w-fit">
        <input
          type="checkbox"
          checked={allowDuplicates}
          onChange={(e) => setAllowDuplicates(e.target.checked)}
          disabled={mode === 'decimal'}
          className="w-4 h-4 rounded accent-brand-500"
        />
        <span className="text-sm">Allow duplicate numbers</span>
      </label>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-2 h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Generate Numbers
      </button>

      {results.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Results ({results.length})</label>
            <div className="flex items-center gap-3">
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
              <button onClick={clear} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border bg-muted/30 min-h-[80px]">
            {results.map((num, i) => (
              <span
                key={i}
                className="px-3.5 py-2 rounded-lg bg-card border border-border font-mono text-sm font-medium"
              >
                {num}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadTxt}
              className="flex items-center gap-2 px-5 py-2.5 border border-border hover:bg-muted font-medium rounded-xl transition-colors text-sm"
            >
              <Download className="w-4 h-4" /> Download TXT
            </button>
            <button
              onClick={downloadCsv}
              className="flex items-center gap-2 px-5 py-2.5 border border-border hover:bg-muted font-medium rounded-xl transition-colors text-sm"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">No numbers generated yet. Set your range and click Generate.</p>
      )}
    </div>
  );
}
