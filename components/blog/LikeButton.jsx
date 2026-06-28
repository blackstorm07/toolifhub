'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function LikeButton({ slug, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return; // one like per page-load — keeps it honest without needing accounts
    setLiked(true);
    setLikes((n) => n + 1);
    try {
      const res = await fetch(`/api/blogs/${slug}/like`, { method: 'POST' });
      const data = await res.json();
      if (typeof data.likes === 'number') setLikes(data.likes);
    } catch {
      // Keep the optimistic increment — a failed network call here isn't worth surfacing to the reader.
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
        liked
          ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 text-red-500'
          : 'border-border hover:bg-muted text-muted-foreground'
      }`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
      {likes > 0 ? likes : 'Like'}
    </button>
  );
}
