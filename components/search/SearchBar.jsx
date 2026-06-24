'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';

export default function SearchBar({ placeholder = 'Search 500+ tools...', size = 'md', className = '' }) {
  const [open, setOpen] = useState(false);

  const sizes = {
    sm: 'h-9 text-sm px-3',
    md: 'h-11 text-base px-4',
    lg: 'h-14 text-lg px-5',
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-3 w-full ${sizes[size]} bg-muted/60 hover:bg-muted border border-border rounded-xl text-muted-foreground transition-colors cursor-text ${className}`}
        aria-label="Open search"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate">{placeholder}</span>
        <span className="hidden sm:flex items-center gap-1 text-xs bg-background border border-border rounded px-1.5 py-0.5 flex-shrink-0">
          <kbd>⌘</kbd><kbd>K</kbd>
        </span>
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
