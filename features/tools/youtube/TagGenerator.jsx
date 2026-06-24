'use client';

import { useState } from 'react';
import { Search, Copy, Check, Trash2, Plus, Tag } from 'lucide-react';
import { copyToClipboard, extractYouTubeId } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

const TAG_SUGGESTIONS = {
  'tutorial': ['tutorial', 'how to', 'step by step', 'beginners guide', 'learn', 'course', 'lessons', 'tips'],
  'gaming': ['gaming', 'gameplay', 'walkthrough', 'let\'s play', 'game review', 'gaming tips', 'esports'],
  'cooking': ['cooking', 'recipe', 'food', 'how to cook', 'easy recipe', 'homemade', 'delicious', 'healthy food'],
  'tech': ['technology', 'tech review', 'unboxing', 'gadgets', 'smartphone', 'laptop review', 'tech tips'],
  'music': ['music', 'song', 'cover', 'lyrics', 'official video', 'new song', 'music video', 'remix'],
  'fitness': ['fitness', 'workout', 'exercise', 'gym', 'weight loss', 'muscle building', 'health', 'diet'],
};

function generateTagsFromTitle(title) {
  const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const generated = new Set();
  generated.add(title.toLowerCase());

  words.forEach(w => generated.add(w));
  for (let i = 0; i < words.length - 1; i++) generated.add(`${words[i]} ${words[i + 1]}`);

  Object.entries(TAG_SUGGESTIONS).forEach(([key, tags]) => {
    if (title.toLowerCase().includes(key)) {
      tags.forEach(t => generated.add(t));
    }
  });

  const extras = ['free', 'best', 'top', 'how to', '2024', 'tutorial', 'guide', 'tips'];
  extras.slice(0, 4).forEach(e => generated.add(`${title.toLowerCase()} ${e}`));

  return Array.from(generated).slice(0, 30).map(t =>
    t.replace(/[^a-z0-9\s]/gi, '').trim()
  ).filter(t => t.length >= 2 && t.length <= 100);
}

export default function TagGenerator() {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('title'); // 'title' | 'url'

  const handleGenerate = () => {
    if (!input.trim()) { toast.error('Please enter a title or video URL'); return; }
    trackToolUsage('youtube-tag-generator', 'YouTube Tag Generator');

    let generated = [];
    if (mode === 'url') {
      const videoId = extractYouTubeId(input);
      if (!videoId) { toast.error('Could not extract video ID from URL'); return; }
      // In production, call YouTube Data API v3 here
      // For demo, generate from URL
      generated = generateTagsFromTitle('YouTube Video ' + videoId);
      toast('In production, connect YouTube Data API to fetch real tags!', { icon: 'ℹ️' });
    } else {
      generated = generateTagsFromTitle(input);
    }

    setTags(generated);
    toast.success(`Generated ${generated.length} tags!`);
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(tags.join(', '));
    setCopied(true);
    toast.success('Tags copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = tags.join(', ').length;

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {[{ id: 'title', label: 'From Title' }, { id: 'url', label: 'From URL' }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${mode === m.id ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {mode === 'title' ? 'Video Title' : 'YouTube Video URL'}
        </label>
        <div className="flex gap-3">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder={mode === 'title' ? 'e.g., How to Make Perfect Pasta at Home' : 'https://www.youtube.com/watch?v=...'}
            className="flex-1 h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            <Search className="w-4 h-4" /> Generate
          </button>
        </div>
      </div>

      {/* Tags output */}
      {tags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold">{tags.length} Tags Generated</span>
              <span className={`text-sm font-medium ${charCount > 500 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount}/500 chars
              </span>
            </div>
            <button onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy All Tags'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-xl min-h-[80px]">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-lg text-sm group hover:border-red-300 transition-colors">
                <Tag className="w-3 h-3 text-muted-foreground" />
                {tag}
                <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-red-500 transition-colors ml-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom tag */}
          <div className="flex gap-2">
            <input
              value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="Add a custom tag..."
              className="flex-1 h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm"
            />
            <button onClick={addTag} className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-muted rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Copy as textarea */}
          <div>
            <label className="block text-sm font-medium mb-2">Copy-paste format (for YouTube Studio):</label>
            <textarea
              readOnly value={tags.join(', ')}
              className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm resize-none focus:outline-none"
              onClick={e => e.target.select()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
