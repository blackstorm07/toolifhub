'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function formatHTML(html, indentSize = 2) {
  const indent = ' '.repeat(indentSize);
  let result = '';
  let level = 0;
  const INLINE_TAGS = new Set(['a', 'span', 'strong', 'em', 'b', 'i', 'u', 'code', 'small', 'label', 'button']);
  const SELF_CLOSING = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

  const tokens = html.split(/(<[^>]+>)/g).filter(t => t.trim());

  tokens.forEach(token => {
    const isClosingTag = /^<\//.test(token);
    const isSelfClosing = /\/>$/.test(token) || SELF_CLOSING.has(token.replace(/<([a-z]+).*/i, '$1').toLowerCase());
    const isOpeningTag = /^<[^/]/.test(token) && !isSelfClosing;
    const tagName = token.replace(/<\/?([a-z]+).*/i, '$1').toLowerCase();
    const isInline = INLINE_TAGS.has(tagName);

    if (isClosingTag && !isInline) level = Math.max(0, level - 1);
    result += (isInline ? '' : '\n' + indent.repeat(level)) + token;
    if (isOpeningTag && !isInline) level++;
  });

  return result.trim();
}

function minifyHTML(html) {
  return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

export default function HtmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('format');
  const [copied, setCopied] = useState(false);

  const process = () => {
    if (!input.trim()) { toast.error('Enter HTML to process'); return; }
    trackToolUsage('html-formatter', 'HTML Formatter');
    const result = mode === 'minify' ? minifyHTML(input) : formatHTML(input);
    setOutput(result);
    toast.success(mode === 'minify' ? 'HTML minified!' : 'HTML formatted!');
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
        {[{ id: 'format', label: '< > Format' }, { id: 'minify', label: 'Minify' }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${mode === m.id ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input HTML</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={14}
            placeholder="<div><p>Paste your HTML here</p></div>"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Output</label>
          <textarea value={output} readOnly rows={14} onClick={e => output && e.target.select()}
            placeholder="Formatted HTML will appear here..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={process} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
          {mode === 'minify' ? 'Minify HTML' : 'Format HTML'}
        </button>
        {output && (
          <button onClick={copy} className="flex items-center gap-2 px-6 py-2.5 border border-border hover:bg-muted font-medium rounded-xl transition-colors text-sm">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Copy
          </button>
        )}
      </div>
    </div>
  );
}
