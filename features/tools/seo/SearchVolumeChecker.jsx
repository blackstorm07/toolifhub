'use client';

import ServiceGatedTool from './shared/ServiceGatedTool';

export default function SearchVolumeChecker() {
  return (
    <ServiceGatedTool
      toolSlug="search-volume-checker"
      toolName="Search Volume Checker"
      action="volume"
      fields={[{ key: 'keyword', label: 'Keyword *', placeholder: 'project management software', required: true, fullWidth: true }]}
      renderResult={(result) => (
        <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm">
          {result.volume?.toLocaleString()} average monthly searches for &quot;{result.keyword}&quot;
        </div>
      )}
    />
  );
}
