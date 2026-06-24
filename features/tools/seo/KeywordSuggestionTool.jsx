'use client';

import KeywordListGenerator from './shared/KeywordListGenerator';
import {
  generateAlphabetSuggestions, generatePrepositionKeywords, generateCommercialKeywords,
} from '@/lib/seo/keywordCombinator';

export default function KeywordSuggestionTool() {
  return (
    <KeywordListGenerator
      toolSlug="keyword-suggestion-tool"
      toolName="Keyword Suggestion Tool"
      placeholder="e.g. digital marketing"
      helperText="Uses the alphabet-soup, preposition, and commercial-modifier methods to surface keyword ideas around your seed term."
      generate={(seed) => [
        ...generateCommercialKeywords(seed),
        ...generatePrepositionKeywords(seed),
        ...generateAlphabetSuggestions(seed),
      ]}
      disclaimer="Suggestions are pattern-generated, not pulled from live search autocomplete or search volume data."
    />
  );
}
