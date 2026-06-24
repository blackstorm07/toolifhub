'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function TextRepeater() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [separator, setSeparator] = useState('newline');
  const [copied, setCopied] = useState(false);
  const sep = separator === 'newline' ? '\n' : separator === 'space' ? ' ' : ', ';
  const output = text ? Array(count).fill(text).join(sep) : '';
  const copy = async () => { await copyToClipboard(output); trackToolUsage('text-repeater', 'Text Repeater'); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1.5">Text to Repeat</label>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Hello World" className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" /></div>
        <div><label className="block text-sm font-medium mb-1.5">Repeat Count</label>
          <input type="number" value={count} onChange={e => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))} min="1" max="1000" className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand-500" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-2">Separator</label>
        <div className="flex gap-2">
          {[{ id: 'newline', label: 'New Line' }, { id: 'space', label: 'Space' }, { id: 'comma', label: 'Comma' }].map(s => (
            <button key={s.id} onClick={() => setSeparator(s.id)} className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${separator === s.id ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>{s.label}</button>
          ))}
        </div>
      </div>
      {output && (<div className="space-y-2">
        <div className="flex items-center justify-between"><span className="text-sm font-medium">Output ({output.length} chars)</span>
          <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 text-sm font-medium rounded-xl hover:bg-brand-100 transition-colors">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}</button></div>
        <textarea value={output} readOnly rows={8} className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none" /></div>)}
    </div>
  );
}
