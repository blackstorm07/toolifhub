'use client';
import { useState, useRef, useEffect, useMemo, useId } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * Controlled, searchable, single-select combobox. Selection is restricted to
 * `options` — there is no way to free-type a value that isn't in the list,
 * so callers can never submit an invalid value.
 *
 * Implements the WAI-ARIA combobox pattern: role="combobox" trigger,
 * role="listbox" popover, arrow-key navigation, Enter to select, Escape to
 * close and return focus to the trigger.
 *
 * @param {string} id - id for the trigger button, referenced by an external <label htmlFor>
 * @param {string} value - currently selected option value (or '')
 * @param {(value: string) => void} onChange
 * @param {{value: string, label: string}[]} options
 * @param {boolean} disabled
 * @param {boolean} loading - shows a skeleton instead of the trigger
 * @param {string} placeholder
 * @param {string} emptyMessage - shown when options is empty (and not loading)
 * @param {string} disabledMessage - shown as placeholder when disabled
 */
export default function SearchableSelect({
  id,
  value,
  onChange,
  options = [],
  disabled = false,
  loading = false,
  placeholder = 'Select…',
  emptyMessage = 'No options available',
  disabledMessage,
}) {
  const generatedId = useId();
  const triggerId = id || generatedId;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setHighlightedIndex(value ? options.findIndex((o) => o.value === value) : 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    setHighlightedIndex(filtered.length ? 0 : -1);
  }, [filtered.length, query]);

  useEffect(() => {
    if (open && highlightedIndex >= 0) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, open]);

  const selected = options.find((o) => o.value === value);

  const closeAndFocusTrigger = () => {
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };

  const selectOption = (option) => {
    onChange(option.value);
    closeAndFocusTrigger();
  };

  const handleTriggerKeyDown = (e) => {
    if (disabled) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) selectOption(filtered[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAndFocusTrigger();
    } else if (e.key === 'Tab') {
      setOpen(false);
      setQuery('');
    }
  };

  if (loading) {
    return <div className="h-11 w-full rounded-xl border border-border bg-muted/40 animate-pulse" aria-hidden="true" />;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        className={`w-full h-11 px-4 rounded-xl border border-border bg-background text-left text-sm flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-500 ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-brand-500/50'
        } ${open ? 'ring-2 ring-brand-500/20 border-brand-500' : ''}`}
      >
        <span className={`truncate ${selected ? '' : 'text-muted-foreground'}`}>
          {selected ? selected.label : disabled && disabledMessage ? disabledMessage : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && !disabled && (
            <X
              className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear selection"
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
            />
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </div>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search…"
              aria-label="Search options"
              role="searchbox"
              aria-controls={listboxId}
              aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
              className="w-full text-sm bg-transparent focus:outline-none"
            />
          </div>
          <ul id={listboxId} role="listbox" className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground text-center" role="presentation">{emptyMessage}</li>
            )}
            {filtered.map((o, i) => (
              <li key={o.value} role="presentation">
                <button
                  id={`${listboxId}-option-${i}`}
                  ref={(el) => { optionRefs.current[i] = el; }}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => selectOption(o)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    i === highlightedIndex ? 'bg-muted/70' : 'hover:bg-muted/50'
                  } ${o.value === value ? 'text-brand-700 dark:text-brand-300 font-medium' : ''}`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
