'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { cn } from '@/lib/utils';

function TocNav({ sections, activeId, onNavigate, className }) {
  return (
    <nav aria-label="Table of contents" className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
        On this page
      </p>
      <ul className="space-y-0.5">
        {sections.map((section) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(section.id);
                }}
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm transition-colors border-l-2',
                  isActive
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                {section.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function LegalTableOfContents({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      setMobileOpen(false);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const activeTitle =
    sections.find((s) => s.id === activeId)?.title || sections[0]?.title;

  return (
    <>
      {/* Mobile collapsible TOC */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm"
          aria-expanded={mobileOpen}
          aria-controls="legal-toc-mobile"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <List className="w-4 h-4 text-brand-500" aria-hidden="true" />
            {mobileOpen ? 'Hide contents' : activeTitle}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              mobileOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
        {mobileOpen && (
          <div
            id="legal-toc-mobile"
            className="mt-2 rounded-xl border border-border bg-card p-3 shadow-sm"
          >
            <TocNav
              sections={sections}
              activeId={activeId}
              onNavigate={scrollToSection}
            />
          </div>
        )}
      </div>

      {/* Desktop sticky TOC */}
      <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <TocNav
            sections={sections}
            activeId={activeId}
            onNavigate={scrollToSection}
          />
        </div>
      </aside>
    </>
  );
}
