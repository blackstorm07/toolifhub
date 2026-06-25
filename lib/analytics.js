'use client';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const GA_TRACKING_ID = GA_ID;

function getDataLayer() {
  if (typeof window === 'undefined') return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function pushToDataLayer(...args) {
  const dataLayer = getDataLayer();
  if (dataLayer) {
    dataLayer.push(args);
  }
}

// ─── Page Views ───────────────────────────────────────────────────────────────

export function trackPageView(url, gaId = GA_ID) {
  if (!gaId) return;
  pushToDataLayer('config', gaId, { page_path: url });
}

// ─── Custom Events ────────────────────────────────────────────────────────────

export function trackEvent({ action, category, label, value }) {
  if (!GA_ID) return;
  pushToDataLayer('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export function trackToolUsage(toolSlug, toolName) {
  trackEvent({
    action: 'tool_use',
    category: 'Tools',
    label: `${toolName} (${toolSlug})`,
  });
}

export function trackSearch(query) {
  trackEvent({
    action: 'search',
    category: 'Search',
    label: query,
  });
}

export function trackCategoryVisit(categorySlug) {
  trackEvent({
    action: 'category_visit',
    category: 'Navigation',
    label: categorySlug,
  });
}

export function trackBlogVisit(blogSlug) {
  trackEvent({
    action: 'blog_visit',
    category: 'Blog',
    label: blogSlug,
  });
}

export function trackShare(toolSlug, platform) {
  trackEvent({
    action: 'share',
    category: 'Social',
    label: `${toolSlug} via ${platform}`,
  });
}

export function trackNewsletterSignup() {
  trackEvent({
    action: 'newsletter_signup',
    category: 'Engagement',
    label: 'newsletter',
  });
}

// ─── Visibility Filtering ─────────────────────────────────────────────────────
// Fired when a visitor is blocked from a category/tool by country-based
// visibility rules, so we can see how much traffic geo-restrictions affect.

export function trackCategoryVisibilityFiltered({ country, category, visibility }) {
  if (!GA_ID) return;
  pushToDataLayer('event', 'category_visibility_filtered', {
    event_category: 'Visibility',
    event_label: category,
    country,
    visibility_type: visibility,
  });
}

export function trackToolVisibilityFiltered({ country, category, tool, visibility }) {
  if (!GA_ID) return;
  pushToDataLayer('event', 'tool_visibility_filtered', {
    event_category: 'Visibility',
    event_label: tool,
    country,
    category,
    visibility_type: visibility,
  });
}
