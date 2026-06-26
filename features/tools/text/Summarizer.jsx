'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { trackToolUsage, trackAiRequestSubmitted, trackAiRequestSuccess, trackAiRequestError } from '@/lib/analytics';
import AiToolShell from './shared/AiToolShell';

const MODES = [
  { id: 'bullet', label: 'Bullet Summary' },
  { id: 'short', label: 'Short Summary' },
  { id: 'detailed', label: 'Detailed Summary' },
  { id: 'executive', label: 'Executive Summary' },
  { id: 'key-takeaways', label: 'Key Takeaways' },
];

const LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

export default function Summarizer({ tool }) {
  const slug = tool?.slug || 'ai-text-summarizer';
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('short');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState(false);

  const handleChange = (value) => {
    setText(value);
    if (!tracked && value.length > 20) {
      trackToolUsage(slug, 'AI Summarizer');
      setTracked(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setOutput('');
    trackAiRequestSubmitted(slug);
    const startedAt = Date.now();

    try {
      const res = await fetch('/api/ai/summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode, length }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong.');
      }

      setOutput(json.data.summary);
      trackAiRequestSuccess(slug, Date.now() - startedAt);
      toast.success('Summary generated!');
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
      inputLabel="Text to Summarize"
      outputLabel="Summary"
      inputPlaceholder="Paste the text you want to summarize..."
      value={text}
      onChange={handleChange}
      output={output}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Summarize Text"
      extraControls={
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Summary Type</label>
            <div className="flex flex-wrap rounded-xl border border-border overflow-hidden w-fit">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    mode === m.id ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Summary Length</label>
            <div className="flex rounded-xl border border-border overflow-hidden w-fit">
              {LENGTHS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLength(l.id)}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${
                    length === l.id ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
