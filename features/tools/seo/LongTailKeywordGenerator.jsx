'use client';

import KeywordListGenerator from './shared/KeywordListGenerator';
import { generateLongTailKeywords, generateQuestionKeywords } from '@/lib/seo/keywordCombinator';

export default function LongTailKeywordGenerator() {
  return (
    <KeywordListGenerator
      toolSlug="long-tail-keyword-generator"
      toolName="Long Tail Keyword Generator"
      placeholder="e.g. project management software"
      helperText="Generates longer, more specific keyword phrase variations built from your seed term."
      generate={(seed) => [...generateLongTailKeywords(seed), ...generateQuestionKeywords(seed)]}
      disclaimer="Suggestions are generated from common long-tail phrase patterns — verify actual search demand with a keyword research platform before targeting."
    />
  );
}
