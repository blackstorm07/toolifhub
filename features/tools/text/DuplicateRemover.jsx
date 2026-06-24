'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function DuplicateRemover() {
  const [input, setInput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimSpaces, setTrimSpaces] = useState(true);
  const [copied, setCopied] = useState(false);

  const process = () => {
    const lines = input.split('\n');
    const seen = new Set();
    const result = lines.filter(line => {
      const key = trimSpaces ? line.trim() : line;
      const compareKey = caseSensitive ? key : key.toLowerCase();
      if (seen.has(compareKey)) return false;
      seen.add(compareKey);
      return true;
    });
    return { lines: result.join('\n'), removed: lines.length - result.length, total: result.length };
  };

  const { lines: output, removed, total } = input ? process() : { lines: '', removed: 0, total: 0 };

  const copy = async () => {
    trackToolUsage('remove-duplicate-lines', 'Duplicate Line Remover');
    await copyToClipboard(output);
    setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} className="w-4 h-4 rounded" />Case sensitive</label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={trimSpaces} onChange={e => setTrimSpaces(e.target.checked)} className="w-4 h-4 rounded" />Trim whitespace</label>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Input (paste lines)</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={14} placeholder={'apple\nbanana\napple\norange\nbanana'} className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500" /></div>
        <div><label className="block text-sm font-medium mb-2">Deduplicated Output {input && <span className="text-muted-foreground font-normal">({total} unique, {removed} removed)</span>}</label>
          <textarea value={output} readOnly rows={14} onClick={e => output && e.target.select()} className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none" /></div>
      </div>
      {output && <button onClick={copy} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}Copy Result</button>}
    </div>
  );
}
