'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { trackToolUsage, trackAiRequestSubmitted, trackAiRequestSuccess, trackAiRequestError } from '@/lib/analytics';
import AiToolShell from './shared/AiToolShell';

export default function GrammarChecker({ tool }) {
  const slug = tool?.slug || 'ai-grammar-checker';
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState(false);

  const handleChange = (value) => {
    setText(value);
    if (!tracked && value.length > 20) {
      trackToolUsage(slug, 'AI Grammar Checker');
      setTracked(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setOutput('');
    setCorrections([]);
    trackAiRequestSubmitted(slug);
    const startedAt = Date.now();

    try {
      const res = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong.');
      }

      setOutput(json.data.correctedText);
      setCorrections(json.data.corrections);
      trackAiRequestSuccess(slug, Date.now() - startedAt);
      toast.success(json.data.corrections.length ? `Found ${json.data.corrections.length} correction(s)!` : 'No issues found!');
    } catch (err) {
      setError(err.message);
      trackAiRequestError(slug);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiToolShell
      toolSlug={slug}
      inputLabel="Your Text"
      outputLabel="Corrected Text"
      inputPlaceholder="Paste your text to check grammar, spelling, and punctuation..."
      value={text}
      onChange={handleChange}
      output={output}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Check Grammar"
      outputExtra={
        corrections.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium">Corrections ({corrections.length})</div>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {corrections.map((c, i) => (
                <li key={i} className="p-3 rounded-xl border border-border bg-card text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 capitalize">
                      {c.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="line-through text-red-500">{c.original}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">{c.corrected}</span>
                  </div>
                  {c.explanation && <p className="text-xs text-muted-foreground mt-1">{c.explanation}</p>}
                </li>
              ))}
            </ul>
          </div>
        )
      }
    />
  );
}
