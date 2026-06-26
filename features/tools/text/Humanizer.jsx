'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { trackToolUsage, trackAiRequestSubmitted, trackAiRequestSuccess, trackAiRequestError } from '@/lib/analytics';
import AiToolShell from './shared/AiToolShell';

const STRENGTHS = [
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'strong', label: 'Strong' },
];

export default function Humanizer({ tool }) {
  const slug = tool?.slug || 'ai-text-humanizer';
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [strength, setStrength] = useState('medium');
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [preserveMeaning, setPreserveMeaning] = useState(true);
  const [improveReadability, setImproveReadability] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState(false);

  const handleChange = (value) => {
    setText(value);
    if (!tracked && value.length > 20) {
      trackToolUsage(slug, 'AI Humanizer');
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
      const res = await fetch('/api/ai/humanizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, strength, preserveFormatting, preserveMeaning, improveReadability }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong.');
      }

      setOutput(json.data.humanizedText);
      trackAiRequestSuccess(slug, Date.now() - startedAt);
      toast.success('Text humanized!');
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
      inputLabel="AI-Generated Text"
      outputLabel="Humanized Text"
      inputPlaceholder="Paste your AI-generated text here..."
      value={text}
      onChange={handleChange}
      output={output}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Humanize Text"
      extraControls={
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Humanization Strength</label>
            <div className="flex rounded-xl border border-border overflow-hidden w-fit">
              {STRENGTHS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStrength(s.id)}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${
                    strength === s.id ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={preserveFormatting} onChange={(e) => setPreserveFormatting(e.target.checked)} />
              Preserve formatting
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={preserveMeaning} onChange={(e) => setPreserveMeaning(e.target.checked)} />
              Preserve meaning
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={improveReadability} onChange={(e) => setImproveReadability(e.target.checked)} />
              Improve readability
            </label>
          </div>
        </div>
      }
    />
  );
}
