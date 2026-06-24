import { useCallback } from 'react';
import { trackEvent, trackToolUsage, trackSearch, trackCategoryVisit } from '@/lib/analytics';

export function useAnalytics() {
  const track = useCallback((eventName, params = {}) => {
    trackEvent(eventName, params);
  }, []);

  const trackTool = useCallback((slug, name) => {
    trackToolUsage(slug, name);
  }, []);

  const trackSearchQuery = useCallback((query, resultCount) => {
    trackSearch(query, resultCount);
  }, []);

  const trackCategory = useCallback((slug, name) => {
    trackCategoryVisit(slug, name);
  }, []);

  const trackShare = useCallback((platform, contentType, contentId) => {
    trackEvent('share', { method: platform, content_type: contentType, item_id: contentId });
  }, []);

  const trackClick = useCallback((label, category = 'engagement') => {
    trackEvent('click', { event_category: category, event_label: label });
  }, []);

  return { track, trackTool, trackSearchQuery, trackCategory, trackShare, trackClick };
}
