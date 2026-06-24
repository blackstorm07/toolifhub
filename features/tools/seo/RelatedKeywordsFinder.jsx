'use client';

import KeywordListGenerator from './shared/KeywordListGenerator';
import { generatePrepositionKeywords, generateRelatedTerms, generateQuestionKeywords } from '@/lib/seo/keywordCombinator';

export default function RelatedKeywordsFinder() {
  return (
    <KeywordListGenerator
      toolSlug="related-keywords-finder"
      toolName="Related Keywords Finder"
      placeholder="e.g. email marketing"
      helperText="Combines question, preposition, and topical-relation patterns to surface keywords related to your seed term."
      generate={(seed) => [
        ...generateQuestionKeywords(seed),
        ...generatePrepositionKeywords(seed),
        ...generateRelatedTerms(seed),
      ]}
      disclaimer="Related terms are pattern-generated for brainstorming — pair with a real keyword research tool to validate search demand."
    />
  );
}
