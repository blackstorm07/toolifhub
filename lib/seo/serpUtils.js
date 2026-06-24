// Heuristics for SERP title/description pixel-width truncation.
// Google truncates around ~580px (title) / ~920px (description) at default
// desktop font sizes. We approximate per-character pixel width since exact
// font metrics aren't available outside a canvas context.

const AVG_CHAR_PX = 7.5; // approx average width of Arial 20px (title) per char it scales below
const TITLE_MAX_PX = 580;
const DESC_MAX_PX = 920;

const CHAR_WIDTHS = {
  narrow: 'iIl.,:;\'`|!'.split(''),
  wide: 'mMW@#%&'.split(''),
};

function estimateWidth(text, baseCharPx) {
  let width = 0;
  for (const ch of text) {
    if (CHAR_WIDTHS.narrow.includes(ch)) width += baseCharPx * 0.45;
    else if (CHAR_WIDTHS.wide.includes(ch)) width += baseCharPx * 1.6;
    else if (ch === ' ') width += baseCharPx * 0.5;
    else width += baseCharPx;
  }
  return width;
}

export function estimateTitleWidth(title) {
  return estimateWidth(title || '', AVG_CHAR_PX);
}

export function estimateDescriptionWidth(desc) {
  return estimateWidth(desc || '', AVG_CHAR_PX * 0.92);
}

export function isTitleTooLong(title) {
  return estimateTitleWidth(title) > TITLE_MAX_PX;
}

export function isDescriptionTooLong(desc) {
  return estimateDescriptionWidth(desc) > DESC_MAX_PX;
}

export const SERP_LIMITS = {
  TITLE_MAX_PX,
  DESC_MAX_PX,
  TITLE_RECOMMENDED_CHARS: 60,
  DESC_RECOMMENDED_CHARS: 160,
};
