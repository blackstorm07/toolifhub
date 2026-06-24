'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function generateDescription({ title, topic, keywords, channelName, cta }) {
  const kws = keywords ? keywords.split(',').map(k => k.trim()) : [topic];
  return `🎬 ${title || topic}

In this video, we'll explore everything you need to know about ${topic}. Whether you're a beginner or looking to level up your skills, this comprehensive guide has you covered!

⏱️ TIMESTAMPS:
00:00 - Introduction
01:30 - What is ${topic}?
05:00 - Getting Started
10:00 - Advanced Tips
15:00 - Common Mistakes to Avoid
20:00 - Final Thoughts

📌 WHAT YOU'LL LEARN:
✅ The fundamentals of ${topic}
✅ Pro tips used by experts
✅ How to avoid common pitfalls
✅ Step-by-step practical guide

${cta ? `👉 ${cta}` : `👍 If you found this video helpful, please LIKE and SUBSCRIBE for more content like this!`}

📱 CONNECT WITH US:
• Subscribe for weekly videos
• Leave a comment below with your questions!

🔑 RELATED KEYWORDS:
${kws.join(', ')}, ${topic} tutorial, ${topic} guide, how to ${topic}, ${topic} tips, ${topic} 2024

${channelName ? `© ${channelName} — All rights reserved.` : ''}

#${topic.replace(/\s+/g, '')} #Tutorial #HowTo #${kws[0]?.replace(/\s+/g, '') || 'Tips'}`;
}

export default function DescriptionGenerator() {
  const [form, setForm] = useState({ title: '', topic: '', keywords: '', channelName: '', cta: '' });
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const generate = () => {
    if (!form.topic.trim()) { toast.error('Enter a video topic'); return; }
    trackToolUsage('youtube-description-generator', 'YouTube Description Generator');
    setDescription(generateDescription(form));
    toast.success('Description generated!');
  };

  const copy = async () => {
    await copyToClipboard(description);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1.5">Video Topic *</label>
          <input value={form.topic} onChange={set('topic')} placeholder="e.g., Python for beginners" className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
        <div><label className="block text-sm font-medium mb-1.5">Video Title</label>
          <input value={form.title} onChange={set('title')} placeholder="Full video title" className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
        <div><label className="block text-sm font-medium mb-1.5">Keywords (comma separated)</label>
          <input value={form.keywords} onChange={set('keywords')} placeholder="python, coding, programming" className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
        <div><label className="block text-sm font-medium mb-1.5">Channel Name</label>
          <input value={form.channelName} onChange={set('channelName')} placeholder="Your Channel Name" className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1.5">Call to Action</label>
        <input value={form.cta} onChange={set('cta')} placeholder="e.g., Subscribe for daily coding tips!" className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" /></div>

      <button onClick={generate} className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
        <Sparkles className="w-4 h-4" /> Generate Description
      </button>

      {description && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{description.length} / 5000 chars</span>
            <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-xl hover:bg-brand-100 transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Description'}
            </button>
          </div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={16}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none focus:border-brand-500" />
        </div>
      )}
    </div>
  );
}
