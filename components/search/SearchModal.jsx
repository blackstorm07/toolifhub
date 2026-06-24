'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { trackSearch } from '@/lib/analytics';
import { useIsClient } from '@/hooks/useIsClient';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tools: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const mounted = useIsClient();
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  // Focus input when modal opens
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Search
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function runSearch() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        if (!cancelled) {
          setResults({ tools: [], categories: [] });
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`);
        const data = await response.json();
        if (!cancelled) {
          setResults({ tools: data.tools || [], categories: data.categories || [] });
          trackSearch(debouncedQuery);
        }
      } catch {
        // Ignore search errors in the modal UI
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open]);

  const allItems = [...results.categories.map(c => ({ ...c, type: 'category' })),
                    ...results.tools.map(t => ({ ...t, type: 'tool' }))];

  const handleSelect = useCallback((item) => {
    onClose();
    if (item.type === 'category') {
      router.push(`/category/${item.slug}`);
    } else {
      router.push(`/tools/${item.slug}`);
    }
  }, [router, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSelect(allItems[activeIndex]);
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools and categories"
        className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, categories..."
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          )}
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}

          {query.length >= 2 && allItems.length === 0 && !loading && (
            <div className="p-8 text-center text-muted-foreground">
              <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {results.categories.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Categories</p>
              {results.categories.map((cat, i) => (
                <button
                  key={cat._id}
                  onClick={() => handleSelect({ ...cat, type: 'category' })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${activeIndex === i ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-muted'}`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{cat.name}</p>
                  </div>
                  <Tag className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {results.tools.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Tools</p>
              {results.tools.map((tool, i) => {
                const idx = results.categories.length + i;
                return (
                  <button
                    key={tool._id}
                    onClick={() => handleSelect({ ...tool, type: 'tool' })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${activeIndex === idx ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-muted'}`}
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tool.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{tool.shortDescription}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="font-mono bg-background border border-border rounded px-1">↑↓</kbd> Navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-background border border-border rounded px-1">Enter</kbd> Select</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-background border border-border rounded px-1">Esc</kbd> Close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
