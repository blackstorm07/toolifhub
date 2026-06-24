'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Link2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareButtons({ url, title, className = '' }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const shareLinkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const btnClass =
    'w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-brand-300 dark:hover:border-brand-700 transition-colors';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a href={shareTwitter} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={btnClass}>
        <Twitter className="w-4 h-4" />
      </a>
      <a href={shareLinkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className={btnClass}>
        <Linkedin className="w-4 h-4" />
      </a>
      <button type="button" onClick={copyLink} aria-label="Copy link" className={btnClass}>
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
