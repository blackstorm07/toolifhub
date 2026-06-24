'use client';

import ServiceGatedTool from './shared/ServiceGatedTool';

export default function KeywordPositionChecker() {
  return (
    <ServiceGatedTool
      toolSlug="keyword-position-checker"
      toolName="Keyword Position Checker"
      action="position"
      fields={[
        { key: 'keyword', label: 'Keyword *', placeholder: 'best running shoes', required: true },
        { key: 'domain', label: 'Domain *', placeholder: 'example.com', required: true },
      ]}
      renderResult={(result) => (
        <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm">
          Position #{result.position} for &quot;{result.keyword}&quot; on {result.domain}
        </div>
      )}
    />
  );
}
