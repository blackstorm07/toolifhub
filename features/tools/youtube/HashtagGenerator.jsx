'use client';

import { useState } from 'react';
import { Hash, Copy, Check, Lightbulb } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function HashtagGenerator() {
  const [topic, setTopic] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    trackToolUsage('youtube-hashtag-generator', 'YouTube Hashtag Generator');
    const base = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const generated = [
      `#${topic.replace(/\s+/g, '')}`,
      ...base.map(w => `#${w}`),
      `#${topic.replace(/\s+/g, '')}Tutorial`,
      `#${topic.replace(/\s+/g, '')}Tips`,
      `#${topic.replace(/\s+/g, '')}2024`,
      `#${topic.replace(/\s+/g, '')}Guide`,
      '#YouTube', '#Tutorial', '#HowTo', '#Tips', '#Learning',
      '#Education', '#Free', '#Online', '#Beginner',
    ].filter((h, i, a) => a.indexOf(h) === i).slice(0, 20);
    setHashtags(generated);
    toast.success(`${generated.length} hashtags generated!`);
  };

  const copy = async () => {
    await copyToClipboard(hashtags.join(' '));
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Video Topic</label>
        <div className="flex gap-3">
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g., cooking pasta, React tutorial, fitness tips..."
            className="flex-1 h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          <button onClick={generate} className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            <Hash className="w-4 h-4" /> Generate
          </button>
        </div>
      </div>

      {hashtags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{hashtags.length} Hashtags</span>
            <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-xl hover:bg-brand-100 transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-lg cursor-pointer hover:bg-brand-100 transition-colors"
                onClick={() => copyToClipboard(tag).then(() => toast.success(`Copied ${tag}`))}>
                {tag}
              </span>
            ))}
          </div>
          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-xs font-medium text-muted-foreground mb-2">Copy-paste format:</p>
            <p className="text-sm font-mono break-all">{hashtags.join(' ')}</p>
          </div>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            YouTube recommends using 3–5 hashtags. Too many hashtags can mark your video as spam.
          </p>
        </div>
      )}
    </div>
  );
}
