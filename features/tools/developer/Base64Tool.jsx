'use client';

import { useState } from 'react';
import { Copy, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function Base64Tool({ tool }) {
  const defaultMode = tool?.slug === 'base64-decoder' ? 'decode' : 'encode';
  const [mode, setMode] = useState(defaultMode);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const process = () => {
    if (!input.trim()) { toast.error('Enter some text first'); return; }
    trackToolUsage(tool?.slug || 'base64-encoder', 'Base64 Tool');
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
        toast.success('Encoded!');
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
        toast.success('Decoded!');
      }
    } catch (e) {
      setError('Invalid Base64 input. Please check your text.');
      toast.error('Invalid input');
    }
  };

  const copy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {[{ id: 'encode', label: 'Encode' }, { id: 'decode', label: 'Decode' }].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setInput(''); setOutput(''); setError(''); }}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${mode === m.id ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{mode === 'encode' ? 'Plain Text' : 'Base64 String'}</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={10}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string to decode...'}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</label>
          {error ? (
            <div className="min-h-[240px] p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 font-mono text-sm text-red-600">{error}</div>
          ) : (
            <textarea value={output} readOnly rows={10} onClick={e => output && e.target.select()}
              placeholder="Output will appear here..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none" />
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={process}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
          {mode === 'encode' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
        </button>
        {output && (
          <button onClick={copy}
            className="flex items-center gap-2 px-6 py-2.5 border border-border hover:bg-muted font-medium rounded-xl transition-colors text-sm">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            Copy Output
          </button>
        )}
      </div>
    </div>
  );
}
