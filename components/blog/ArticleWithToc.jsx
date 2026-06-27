'use client';

import { useEffect, useRef, useState } from 'react';

export default function ArticleWithToc({ beforeHtml = '', afterHtml = '', midContent = null }) {
  const contentRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll('h2, h3'));
    const used = new Set();
    const items = nodes.map((node, i) => {
      let slug =
        node.id ||
        node.textContent
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      if (!slug) slug = `section-${i}`;
      while (used.has(slug)) slug = `${slug}-${i}`;
      used.add(slug);
      node.id = slug;
      return { id: slug, text: node.textContent, level: node.tagName === 'H3' ? 3 : 2 };
    });
    setHeadings(items);
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [beforeHtml, afterHtml]);

  const handleJump = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_16rem] gap-12 items-start">
      <div ref={contentRef} className="article-body max-w-[820px] w-full mx-auto xl:mx-0">
        {beforeHtml && <div dangerouslySetInnerHTML={{ __html: beforeHtml }} />}
        {midContent}
        {afterHtml && <div dangerouslySetInnerHTML={{ __html: afterHtml }} />}
      </div>

      {headings.length > 1 && (
        <nav aria-label="Table of contents" className="hidden xl:block sticky top-28 self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
          <ul className="space-y-1 text-sm">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => handleJump(e, h.id)}
                  className={`block border-l-2 py-1 transition-colors ${h.level === 3 ? 'pl-7' : 'pl-3'} ${
                    activeId === h.id
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-medium'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
