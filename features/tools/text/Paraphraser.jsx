'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { trackToolUsage, trackAiRequestSubmitted, trackAiRequestSuccess, trackAiRequestError } from '@/lib/analytics';
import AiToolShell from './shared/AiToolShell';

const MODES = [
  { id: 'standard', label: 'Standard' },
  { id: 'fluency', label: 'Fluency' },
  { id: 'formal', label: 'Formal' },
  { id: 'academic', label: 'Academic' },
  { id: 'creative', label: 'Creative' },
  { id: 'simple', label: 'Simple' },
];

export default function Paraphraser({ tool }) {
  const slug = tool?.slug || 'ai-paraphraser';
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('standard');
  const [preserveMeaning, setPreserveMeaning] = useState(true);
  const [shorten, setShorten] = useState(false);
  const [expand, setExpand] = useState(false);
  const [improveReadability, setImproveReadability] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState(false);

  const handleChange = (value) => {
    setText(value);
    if (!tracked && value.length > 20) {
      trackToolUsage(slug, 'AI Paraphraser');
      setTracked(true);
    }
  };

  const handleShortenToggle = (checked) => {
    setShorten(checked);
    if (checked) setExpand(false);
  };

  const handleExpandToggle = (checked) => {
    setExpand(checked);
    if (checked) setShorten(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setOutput('');
    trackAiRequestSubmitted(slug);
    const startedAt = Date.now();

    try {
      const res = await fetch('/api/ai/paraphraser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode, preserveMeaning, shorten, expand, improveReadability }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong.');
      }

      setOutput(json.data.paraphrasedText);
      trackAiRequestSuccess(slug, Date.now() - startedAt);
      toast.success('Text paraphrased!');
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
      inputLabel="Original Text"
      outputLabel="Paraphrased Text"
      inputPlaceholder="Paste the text you want to paraphrase..."
      value={text}
      onChange={handleChange}
      output={output}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Paraphrase Text"
      extraControls={
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Mode</label>
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
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={preserveMeaning} onChange={(e) => setPreserveMeaning(e.target.checked)} />
              Preserve meaning
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={shorten} onChange={(e) => handleShortenToggle(e.target.checked)} />
              Shorten text
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={expand} onChange={(e) => handleExpandToggle(e.target.checked)} />
              Expand text
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
