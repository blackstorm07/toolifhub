// Pattern-based keyword expansion utilities.
// These generate candidate keyword phrases from modifier word lists (the
// "alphabet soup" / questions / prepositions method long-tail SEO tools use).
// They do NOT return real search volume, ranking, or competition data —
// callers must not present output as measured search metrics.

const QUESTION_WORDS = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'will', 'should'];

const PREPOSITIONS = ['for', 'with', 'without', 'near', 'vs', 'to', 'in', 'on', 'about', 'like'];

const COMPARISONS = ['vs', 'or', 'alternative to', 'compared to', 'better than'];

const COMMERCIAL_MODIFIERS = [
  'best', 'cheap', 'free', 'top', 'affordable', 'premium', 'professional',
  'online', 'near me', 'for beginners', 'for small business', '2025',
  'review', 'reviews', 'pricing', 'cost', 'discount', 'guide', 'tutorial',
];

const LONG_TAIL_TEMPLATES = [
  'best {kw} for beginners',
  'how to use {kw}',
  'how to choose {kw}',
  '{kw} vs alternatives',
  'cheap {kw} online',
  'free {kw} tool',
  '{kw} pricing guide',
  'top 10 {kw} in 2025',
  '{kw} for small business',
  'why use {kw}',
  '{kw} step by step guide',
  '{kw} pros and cons',
  'is {kw} worth it',
  '{kw} near me',
  '{kw} for beginners vs experts',
];

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function generateAlphabetSuggestions(seed) {
  const kw = seed.trim();
  if (!kw) return [];
  return ALPHABET.map((letter) => `${kw} ${letter}`);
}

export function generateQuestionKeywords(seed) {
  const kw = seed.trim();
  if (!kw) return [];
  return QUESTION_WORDS.map((q) => `${q} ${kw}`);
}

export function generatePrepositionKeywords(seed) {
  const kw = seed.trim();
  if (!kw) return [];
  return PREPOSITIONS.map((p) => `${kw} ${p}`);
}

export function generateComparisonKeywords(seed) {
  const kw = seed.trim();
  if (!kw) return [];
  return COMPARISONS.map((c) => `${kw} ${c}`);
}

export function generateCommercialKeywords(seed) {
  const kw = seed.trim();
  if (!kw) return [];
  return COMMERCIAL_MODIFIERS.map((m) =>
    m === 'near me' || m === '2025' || m.startsWith('for') ? `${kw} ${m}` : `${m} ${kw}`
  );
}

export function generateLongTailKeywords(seed) {
  const kw = seed.trim();
  if (!kw) return [];
  return LONG_TAIL_TEMPLATES.map((t) => t.replace('{kw}', kw));
}

// Simple co-occurrence-style related term expansion (semantic/LSI-style).
// Uses generic topical relation patterns rather than a real corpus model.
const RELATION_SUFFIXES = [
  'definition', 'meaning', 'examples', 'types of', 'benefits of', 'tips',
  'strategy', 'tools', 'services', 'companies', 'software', 'platform',
  'checklist', 'mistakes to avoid', 'case study', 'statistics',
];

export function generateRelatedTerms(seed) {
  const kw = seed.trim();
  if (!kw) return [];
  return RELATION_SUFFIXES.map((s) => (s.endsWith('of') ? `${s} ${kw}` : `${kw} ${s}`));
}

export function dedupe(list) {
  return Array.from(new Set(list.map((s) => s.trim().toLowerCase().replace(/\s+/g, ' '))))
    .filter(Boolean);
}
