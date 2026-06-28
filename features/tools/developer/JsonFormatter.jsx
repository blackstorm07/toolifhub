'use client';

import { useState } from 'react';
import { Copy, Check, Trash2, Minimize2, Maximize2, XCircle } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('format'); // 'format' | 'minify' | 'validate'

  const process = () => {
    if (!input.trim()) { toast.error('Paste your JSON first'); return; }
    trackToolUsage('json-formatter', 'JSON Formatter');
    setError('');
    try {
      const parsed = JSON.parse(input);
      if (mode === 'minify') {
        setOutput(JSON.stringify(parsed));
        toast.success('JSON minified!');
      } else {
        setOutput(JSON.stringify(parsed, null, indent));
        toast.success('JSON formatted!');
      }
    } catch (e) {
      setError(e.message);
      setOutput('');
      toast.error('Invalid JSON');
    }
  };

  const copy = async () => {
    await copyToClipboard(output);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    trackToolUsage('json-validator', 'JSON Validator');
    setError('');
    try {
      JSON.parse(input);
      toast.success('Valid JSON!');
    } catch (e) {
      setError(e.message);
      toast.error('Invalid JSON');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {[{ id: 'format', label: '{ } Format' }, { id: 'minify', label: 'Minify' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === m.id ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}>
              {m.label}
            </button>
          ))}
        </div>
        {mode === 'format' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Indent:</label>
            <select value={indent} onChange={e => setIndent(Number(e.target.value))}
              className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-brand-500">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={'\t'}>Tab</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input JSON</label>
            <button onClick={() => setInput('')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          <textarea
            value={input} onChange={e => setInput(e.target.value)}
            placeholder={'{\n  "key": "value",\n  "number": 42\n}'}
            rows={16}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            {output && (
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            )}
          </div>
          {error ? (
            <div className="h-full min-h-[300px] p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 font-mono text-sm text-red-600 dark:text-red-400">
              <p className="flex items-center gap-1.5 font-bold mb-1">
                <XCircle className="w-4 h-4" aria-hidden="true" /> JSON Error:
              </p>
              <p>{error}</p>
            </div>
          ) : (
            <textarea
              value={output} readOnly
              placeholder="Formatted JSON will appear here..."
              rows={16}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none"
              onClick={e => output && e.target.select()}
            />
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={process}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
          {mode === 'minify' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {mode === 'minify' ? 'Minify JSON' : 'Format JSON'}
        </button>
        <button onClick={validate}
          className="px-6 py-2.5 border border-border hover:bg-muted font-medium rounded-xl transition-colors text-sm">
          Validate
        </button>
        {output && (
          <button onClick={copy}
            className="flex items-center gap-2 ml-auto px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors text-sm">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Output'}
          </button>
        )}
      </div>
    </div>
  );
}
