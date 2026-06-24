'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/;}/g, '}')
    .trim();
}

export default function CssMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const process = () => {
    if (!input.trim()) { toast.error('Enter CSS to minify'); return; }
    trackToolUsage('css-minifier', 'CSS Minifier');
    const result = minifyCSS(input);
    setOutput(result);
    const savings = Math.round(((input.length - result.length) / input.length) * 100);
    toast.success(`Minified! Saved ${savings}% (${input.length - result.length} chars)`);
  };

  const copy = async () => { await copyToClipboard(output); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Input CSS</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={14} placeholder=".example {\n  color: red;\n  background: blue;\n}"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500" /></div>
        <div><label className="block text-sm font-medium mb-2">Minified CSS</label>
          <textarea value={output} readOnly rows={14} onClick={e => output && e.target.select()} placeholder="Minified output..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none" /></div>
      </div>
      <div className="flex gap-3 items-center">
        <button onClick={process} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">Minify CSS</button>
        {output && <button onClick={copy} className="flex items-center gap-2 px-4 py-2.5 border border-border hover:bg-muted rounded-xl text-sm font-medium transition-colors">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}Copy</button>}
        {output && input && <span className="text-sm text-muted-foreground ml-auto">Original: {input.length} → Minified: {output.length} chars ({Math.round(((input.length - output.length) / input.length) * 100)}% saved)</span>}
      </div>
    </div>
  );
}
