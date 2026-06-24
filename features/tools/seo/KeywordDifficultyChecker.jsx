'use client';

import ServiceGatedTool from './shared/ServiceGatedTool';

export default function KeywordDifficultyChecker() {
  return (
    <ServiceGatedTool
      toolSlug="keyword-difficulty-checker"
      toolName="Keyword Difficulty Checker"
      action="difficulty"
      fields={[{ key: 'keyword', label: 'Keyword *', placeholder: 'email marketing tools', required: true, fullWidth: true }]}
      renderResult={(result) => (
        <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm">
          Difficulty score: {result.difficulty}/100 for &quot;{result.keyword}&quot;
        </div>
      )}
    />
  );
}
