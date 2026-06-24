'use client';

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const GA_TRACKING_ID = GA_ID;

// ─── Core GA4 Event ──────────────────────────────────────────────────────────

function gtag(...args) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

// ─── Page Views ───────────────────────────────────────────────────────────────

export function trackPageView(url) {
  if (!GA_ID) return;
  gtag('config', GA_ID, { page_path: url });
}

// ─── Custom Events ────────────────────────────────────────────────────────────

export function trackEvent({ action, category, label, value }) {
  if (!GA_ID) return;
  gtag('event', action, {
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

export function trackNewsletterSignup(email) {
  trackEvent({
    action: 'newsletter_signup',
    category: 'Engagement',
    label: 'newsletter',
  });
}
