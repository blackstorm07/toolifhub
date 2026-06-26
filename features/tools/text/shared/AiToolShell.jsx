'use client';

import { useState } from 'react';
import { Copy, Check, ClipboardPaste, Eraser, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/utils';
import { trackAiOutputCopied } from '@/lib/analytics';
import { MAX_INPUT_LENGTH } from '@/lib/ai/sanitize';

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Shared input/output shell for all Gemini-powered text AI tools.
 * Handles the input editor, output editor, counters, copy/paste/clear,
 * loading state, and error display. Tool-specific option controls and
 * the submit action are passed in by the caller.
 */
export default function AiToolShell({
  toolSlug,
  inputLabel = 'Your Text',
  outputLabel = 'Result',
  inputPlaceholder = 'Type or paste your text here...',
  value,
  onChange,
  output,
  loading,
  error,
  onSubmit,
  submitLabel = 'Generate',
  extraControls = null,
  outputExtra = null,
}) {
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      onChange(clipboardText);
    } catch {
      toast.error('Could not read clipboard. Paste manually instead.');
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleCopy = async () => {
    if (!output) return;
    await copyToClipboard(output);
    setCopied(true);
    trackAiOutputCopied(toolSlug);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const overLimit = value.length > MAX_INPUT_LENGTH;

  return (
    <div className="space-y-4">
      {extraControls}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">{inputLabel}</label>
            <span className={`text-xs ${overLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
              {value.length}/{MAX_INPUT_LENGTH} chars · {countWords(value)} words
            </span>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            placeholder={inputPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border hover:bg-muted rounded-lg transition-colors"
            >
              <ClipboardPaste className="w-3.5 h-3.5" /> Paste
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border hover:bg-muted rounded-lg transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">{outputLabel}</label>
            <span className="text-xs text-muted-foreground">
              {output.length} chars · {countWords(output)} words
            </span>
          </div>
          {error ? (
            <div className="min-h-[280px] p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <textarea
              value={output}
              readOnly
              rows={12}
              onClick={(e) => output && e.target.select()}
              placeholder="Output will appear here..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none"
            />
          )}
          {outputExtra}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border hover:bg-muted rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              Copy
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !value.trim() || overLimit}
        className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Processing...' : submitLabel}
      </button>
    </div>
  );
}
