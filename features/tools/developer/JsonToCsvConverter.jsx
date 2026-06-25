'use client';
import { useState } from 'react';
import { Copy, Check, Download, Trash2 } from 'lucide-react';
import { copyToClipboard, downloadText } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function jsonToCsv(input) {
  const parsed = JSON.parse(input);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  if (rows.length === 0) throw new Error('JSON array is empty — nothing to convert');
  if (!rows.every((r) => r && typeof r === 'object' && !Array.isArray(r))) {
    throw new Error('Expected an array of flat objects, e.g. [{"name": "A", "age": 1}]');
  }

  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((k) => set.add(k));
    return set;
  }, new Set()));

  const lines = [headers.map(escapeCsvValue).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvValue(row[h])).join(','));
  }
  return lines.join('\n');
}

export default function JsonToCsvConverter() {
  const [input, setInput] = useState('');
  const [csv, setCsv] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = () => {
    if (!input.trim()) { toast.error('Paste your JSON first'); return; }
    try {
      const result = jsonToCsv(input);
      setCsv(result);
      setError('');
      trackToolUsage('json-to-csv-converter', 'JSON to CSV Converter');
      toast.success('Converted to CSV!');
    } catch (e) {
      setError(e.message);
      setCsv('');
      toast.error('Conversion failed');
    }
  };

  const copy = async () => {
    await copyToClipboard(csv);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    downloadText('data.csv', csv, 'text/csv');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input JSON</label>
            <button onClick={() => setInput('')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'[\n  { "name": "Asha", "age": 28 },\n  { "name": "Ravi", "age": 34 }\n]'}
            rows={14}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">CSV Output</label>
            {csv && (
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            )}
          </div>
          {error ? (
            <div className="h-full min-h-[300px] p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 font-mono text-sm text-red-600 dark:text-red-400">
              <p className="font-bold mb-1">Conversion Error:</p>
              <p>{error}</p>
            </div>
          ) : (
            <textarea
              value={csv}
              readOnly
              placeholder="CSV output will appear here…"
              rows={14}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none"
              onClick={(e) => csv && e.target.select()}
            />
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={convert}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
        >
          Convert to CSV
        </button>
        {csv && (
          <button
            onClick={download}
            className="flex items-center gap-2 ml-auto px-6 py-2.5 border border-border hover:bg-muted font-medium rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        )}
      </div>
    </div>
  );
}
