import { isGTMAnabled } from '@/lib/gtm';

function getDataLayer() {
  if (typeof window === 'undefined') return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function pushToDataLayer(payload) {
  const dataLayer = getDataLayer();
  if (dataLayer) {
    dataLayer.push(payload);
  }
}

// ─── Page Views ───────────────────────────────────────────────────────────────

export function trackPageView(url) {
  if (!isGTMAnabled()) return;
  pushToDataLayer({
    event: 'page_view',
    page_path: url,
    page_location: typeof window !== 'undefined' ? `${window.location.origin}${url}` : url,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  });
}

// ─── Custom Events ────────────────────────────────────────────────────────────

export function trackEvent({ action, category, label, value }) {
  if (!isGTMAnabled()) return;
  pushToDataLayer({
    event: action,
    event_category: category,
    event_label: label,
    ...(value !== undefined ? { value } : {}),
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

// ─── AI Tools ─────────────────────────────────────────────────────────────────

export function trackAiRequestSubmitted(toolSlug) {
  trackEvent({ action: 'ai_request_submitted', category: 'AI Tools', label: toolSlug });
}

export function trackAiRequestSuccess(toolSlug, durationMs) {
  trackEvent({ action: 'ai_request_success', category: 'AI Tools', label: toolSlug, value: durationMs });
}

export function trackAiRequestError(toolSlug) {
  trackEvent({ action: 'ai_request_error', category: 'AI Tools', label: toolSlug });
}

export function trackAiOutputCopied(toolSlug) {
  trackEvent({ action: 'ai_output_copied', category: 'AI Tools', label: toolSlug });
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
  if (!isGTMAnabled()) return;
  pushToDataLayer({
    event: 'category_visibility_filtered',
    event_category: 'Visibility',
    event_label: category,
    country,
    visibility_type: visibility,
  });
}

export function trackToolVisibilityFiltered({ country, category, tool, visibility }) {
  if (!isGTMAnabled()) return;
  pushToDataLayer({
    event: 'tool_visibility_filtered',
    event_category: 'Visibility',
    event_label: tool,
    country,
    category,
    visibility_type: visibility,
  });
}
