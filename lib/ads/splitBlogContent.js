/**
 * Split blog HTML near the 40–50% mark on block-element boundaries
 * so a mid-content ad can be inserted without breaking markup.
 */
export function splitBlogContent(html) {
  if (!html?.trim()) {
    return { before: '', after: '' };
  }

  const blockPattern = /<\/(?:p|h2|h3|h4|ul|ol|blockquote|figure|div)>/gi;
  const matches = [...html.matchAll(blockPattern)];

  if (matches.length < 2) {
    return { before: html, after: '' };
  }

  const targetIndex = Math.max(1, Math.floor(matches.length * 0.45));
  const splitAt = matches[targetIndex - 1].index + matches[targetIndex - 1][0].length;

  return {
    before: html.slice(0, splitAt),
    after: html.slice(splitAt),
  };
}
