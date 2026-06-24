'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

const TEMPLATES = [
  (topic) => `How to ${topic} — Complete Guide for Beginners`,
  (topic) => `${topic}: Everything You Need to Know in 2024`,
  (topic) => `Top 10 ${topic} Tips That Actually Work`,
  (topic) => `I Tried ${topic} for 30 Days — Here's What Happened`,
  (topic) => `The TRUTH About ${topic} Nobody Tells You`,
  (topic) => `${topic} Tutorial for Beginners | Step-by-Step`,
  (topic) => `Why ${topic} Changed My Life (And How It Can Change Yours)`,
  (topic) => `${topic} Mistakes Everyone Makes (And How to Fix Them)`,
  (topic) => `The Ultimate ${topic} Guide You've Been Waiting For`,
  (topic) => `${topic} vs Everything Else — Which is BEST?`,
  (topic) => `How I ${topic} and Made $X in 30 Days`,
  (topic) => `${topic} Hacks: Work Smarter, Not Harder`,
];

export default function TitleGenerator() {
  const [topic, setTopic] = useState('');
  const [titles, setTitles] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generate = () => {
    if (!topic.trim()) { toast.error('Enter a topic first'); return; }
    trackToolUsage('youtube-title-generator', 'YouTube Title Generator');
    const generated = TEMPLATES.map(t => t(topic));
    setTitles(generated);
    toast.success(`${generated.length} titles generated!`);
  };

  const copy = async (title, i) => {
    await copyToClipboard(title);
    setCopiedIndex(i);
    toast.success('Copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Video Topic / Keyword</label>
        <div className="flex gap-3">
          <input
            value={topic} onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g., pasta carbonara, JavaScript promises, yoga for beginners..."
            className="flex-1 h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <button onClick={generate}
            className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            <Sparkles className="w-4 h-4" /> Generate
          </button>
        </div>
      </div>

      {titles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{titles.length} Title Ideas</span>
            <button onClick={generate} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          </div>
          <div className="space-y-2">
            {titles.map((title, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-4 bg-muted/30 border border-border rounded-xl hover:border-brand-300 dark:hover:border-brand-700 transition-colors group">
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground font-mono mr-2">#{i + 1}</span>
                  <span className="text-sm font-medium">{title}</span>
                  <span className="text-xs text-muted-foreground ml-2">({title.length} chars)</span>
                </div>
                <button onClick={() => copy(title, i)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  {copiedIndex === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">💡 Tip: Titles between 40–70 characters perform best for YouTube SEO.</p>
        </div>
      )}
    </div>
  );
}
