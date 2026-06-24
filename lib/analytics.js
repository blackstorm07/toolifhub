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
