import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ tools: [], categories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      const q = debouncedQuery?.trim() ?? '';
      if (q.length < 2) {
        if (!cancelled) {
          setResults({ tools: [], categories: [] });
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const clearSearch = () => {
    setQuery('');
    setResults({ tools: [], categories: [] });
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
    hasResults: results.tools.length > 0 || results.categories.length > 0,
  };
}
