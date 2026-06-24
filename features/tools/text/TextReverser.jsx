'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function TextReverser() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('characters');
  const [copied, setCopied] = useState(false);

  const reverse = () => {
    if (!input) return '';
    if (mode === 'characters') return input.split('').reverse().join('');
    if (mode === 'words') return input.split(/\s+/).reverse().join(' ');
    return input.split('\n').reverse().join('\n');
  };

  const output = reverse();

  const copy = async () => {
    if (!output) return;
    trackToolUsage('text-reverser', 'Text Reverser');
    await copyToClipboard(output);
    setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000);
  };

  const modes = [
    { id: 'characters', label: 'Reverse Characters' },
    { id: 'words', label: 'Reverse Words' },
    { id: 'lines', label: 'Reverse Lines' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Reverse Mode</label>
        <div className="flex flex-wrap gap-2">
          {modes.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${mode === m.id ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input Text</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={10}
            placeholder="Enter text to reverse..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:border-brand-500" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Reversed Output</label>
            {output && (
              <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <textarea value={output} readOnly rows={10} onClick={e => output && e.target.select()}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none" />
        </div>
      </div>

      {input && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[['Characters', input.length], ['Words', input.trim().split(/\s+/).filter(Boolean).length], ['Lines', input.split('\n').length]].map(([label, val]) => (
            <div key={label} className="p-3 bg-muted/30 rounded-xl text-center">
              <div className="text-xl font-bold text-brand-600">{val}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
