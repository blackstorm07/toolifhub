'use client';

import KeywordListGenerator from './shared/KeywordListGenerator';
import { generateRelatedTerms, generateComparisonKeywords } from '@/lib/seo/keywordCombinator';

export default function LsiKeywordGenerator() {
  return (
    <KeywordListGenerator
      toolSlug="lsi-keyword-generator"
      toolName="LSI Keyword Generator"
      placeholder="e.g. content marketing"
      helperText="Suggests semantically related terms and concepts to add topical depth around your main keyword."
      generate={(seed) => [...generateRelatedTerms(seed), ...generateComparisonKeywords(seed)]}
      disclaimer="These are pattern-based topical/semantic suggestions, not output from a trained LSI/NLP model on real search corpora — use them as a brainstorming starting point."
    />
  );
}
