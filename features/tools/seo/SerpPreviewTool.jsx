'use client';

import { useState } from 'react';
import { estimateTitleWidth, estimateDescriptionWidth, SERP_LIMITS } from '@/lib/seo/serpUtils';
import { trackToolUsage } from '@/lib/analytics';

export default function SerpPreviewTool() {
  const [title, setTitle] = useState('Your Page Title Goes Here');
  const [url, setUrl] = useState('https://www.example.com/page-path');
  const [description, setDescription] = useState('Your meta description appears here. Write a compelling summary of your page to improve click-through rate from search results.');
  const [tracked, setTracked] = useState(false);
  const [device, setDevice] = useState('desktop');

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    if (!tracked) { trackToolUsage('serp-preview-tool', 'SERP Preview Tool'); setTracked(true); }
  };

  const titleTooLong = estimateTitleWidth(title) > SERP_LIMITS.TITLE_MAX_PX;
  const descTooLong = estimateDescriptionWidth(description) > SERP_LIMITS.DESC_MAX_PX;

  let displayUrl = url;
  try {
    const u = new URL(url);
    displayUrl = `${u.hostname}${u.pathname !== '/' ? ' › ' + u.pathname.replace(/^\//, '').split('/').join(' › ') : ''}`;
  } catch {
    // leave as-is for invalid/partial URLs
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Page URL</label>
          <input
            value={url} onChange={handleChange(setUrl)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Title Tag</label>
            <span className={`text-xs ${titleTooLong ? 'text-red-500' : 'text-muted-foreground'}`}>{title.length} chars</span>
          </div>
          <input
            value={title} onChange={handleChange(setTitle)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Meta Description</label>
            <span className={`text-xs ${descTooLong ? 'text-red-500' : 'text-muted-foreground'}`}>{description.length} chars</span>
          </div>
          <textarea
            value={description} onChange={handleChange(setDescription)} rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {['desktop', 'mobile'].map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              device === d ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className={`p-5 bg-white dark:bg-[#202124] rounded-xl border border-border ${device === 'mobile' ? 'max-w-sm' : 'max-w-xl'}`}>
        <p className="text-[#202124] dark:text-gray-300 text-sm truncate">{displayUrl || 'www.example.com'}</p>
        <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg sm:text-xl leading-snug mt-1 truncate" style={{ fontFamily: 'arial, sans-serif' }}>
          {title || 'Your Page Title Goes Here'}
        </h3>
        <p className="text-[#4d5156] dark:text-gray-400 text-sm mt-1 leading-relaxed line-clamp-2">
          {description || 'Your meta description will appear here.'}
        </p>
      </div>

      {(titleTooLong || descTooLong) && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {titleTooLong && 'Title may be truncated in search results. '}
          {descTooLong && 'Description may be truncated in search results.'}
        </p>
      )}
    </div>
  );
}
