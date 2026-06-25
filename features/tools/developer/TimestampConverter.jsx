'use client';
import { useState, useEffect, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function CopyableRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    await copyToClipboard(String(value));
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/20">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm break-all">{value || '—'}</p>
      </div>
      {value && (
        <button onClick={copy} className="flex-shrink-0 ml-3 text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

export default function TimestampConverter() {
  const [unixInput, setUnixInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const convertFromUnix = useCallback((val) => {
    if (!val.trim()) { setResult(null); setError(''); return; }
    const num = Number(val.trim());
    if (Number.isNaN(num)) { setError('Enter a valid Unix timestamp (seconds or milliseconds)'); setResult(null); return; }
    const ms = String(val.trim()).length > 10 ? num : num * 1000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) { setError('Enter a valid Unix timestamp'); setResult(null); return; }
    setError('');
    trackToolUsage('timestamp-converter', 'Timestamp Converter');
    setResult({
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      utc: date.toUTCString(),
      local: date.toString(),
      iso: date.toISOString(),
    });
  }, []);

  const convertFromDate = useCallback((val) => {
    if (!val) { setResult(null); setError(''); return; }
    const date = new Date(val);
    if (Number.isNaN(date.getTime())) { setError('Enter a valid date'); setResult(null); return; }
    setError('');
    trackToolUsage('timestamp-converter', 'Timestamp Converter');
    setResult({
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      utc: date.toUTCString(),
      local: date.toString(),
      iso: date.toISOString(),
    });
  }, []);

  useEffect(() => {
    if (unixInput) convertFromUnix(unixInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unixInput]);

  useEffect(() => {
    if (dateInput) convertFromDate(dateInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateInput]);

  const useNow = () => {
    const now = Date.now();
    setUnixInput(String(Math.floor(now / 1000)));
    setDateInput('');
    convertFromUnix(String(Math.floor(now / 1000)));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Unix Timestamp</label>
          <input
            value={unixInput}
            onChange={(e) => { setUnixInput(e.target.value); setDateInput(''); }}
            placeholder="1718000000"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date &amp; Time</label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => { setDateInput(e.target.value); setUnixInput(''); }}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <button
        onClick={useNow}
        className="px-5 py-2.5 border border-border hover:bg-muted text-sm font-medium rounded-xl transition-colors"
      >
        Use Current Timestamp
      </button>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <CopyableRow label="Unix Timestamp (seconds)" value={result.unix} />
          <CopyableRow label="Unix Timestamp (milliseconds)" value={result.unixMs} />
          <CopyableRow label="UTC" value={result.utc} />
          <CopyableRow label="Local Timezone" value={result.local} />
          <CopyableRow label="ISO 8601" value={result.iso} />
        </div>
      )}

      {!result && !error && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Enter a Unix timestamp or pick a date to convert between them in real time.
        </p>
      )}
    </div>
  );
}
