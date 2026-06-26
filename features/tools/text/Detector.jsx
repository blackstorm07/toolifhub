'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage, trackAiRequestSubmitted, trackAiRequestSuccess, trackAiRequestError } from '@/lib/analytics';
import AiToolShell from './shared/AiToolShell';

export default function Detector({ tool }) {
  const slug = tool?.slug || 'ai-content-detector';
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState(false);

  const handleChange = (value) => {
    setText(value);
    if (!tracked && value.length > 20) {
      trackToolUsage(slug, 'AI Detector');
      setTracked(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    trackAiRequestSubmitted(slug);
    const startedAt = Date.now();

    try {
      const res = await fetch('/api/ai/detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong.');
      }

      setResult(json.data);
      trackAiRequestSuccess(slug, Date.now() - startedAt);
      toast.success('Analysis complete!');
    } catch (err) {
      setError(err.message);
      trackAiRequestError(slug);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const outputSummary = result
    ? `AI Probability: ${result.aiProbability}%\nHuman Probability: ${result.humanProbability}%\nConfidence: ${result.confidence}${
        result.highlights.length ? `\n\nSuspicious sections:\n${result.highlights.map((h) => `- ${h}`).join('\n')}` : ''
      }`
    : '';

  return (
    <AiToolShell
      toolSlug={slug}
      inputLabel="Text to Analyze"
      outputLabel="Detection Result"
      inputPlaceholder="Paste the text you want to check..."
      value={text}
      onChange={handleChange}
      output={outputSummary}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Detect AI Content"
      outputExtra={
        result && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border bg-card text-center">
                <div className="text-2xl font-bold text-red-500">{result.aiProbability}%</div>
                <div className="text-xs text-muted-foreground mt-1">AI Probability</div>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card text-center">
                <div className="text-2xl font-bold text-green-500">{result.humanProbability}%</div>
                <div className="text-xs text-muted-foreground mt-1">Human Probability</div>
              </div>
            </div>
            <div className="text-sm">
              Confidence: <span className="font-semibold capitalize">{result.confidence}</span>
            </div>
            {result.highlights.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Suspicious sections</div>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  {result.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{result.disclaimer}</span>
            </div>
          </div>
        )
      }
    />
  );
}
