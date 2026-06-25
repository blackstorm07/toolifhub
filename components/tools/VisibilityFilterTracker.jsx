'use client';

import { useEffect } from 'react';
import { trackCategoryVisibilityFiltered, trackToolVisibilityFiltered } from '@/lib/analytics';

/**
 * Fires a single `category_visibility_filtered` / `tool_visibility_filtered`
 * analytics event when a visitor lands on a page that exists but is hidden
 * from their country by visibility rules. Renders nothing.
 */
export default function VisibilityFilterTracker({ type, category, tool, visibility, country }) {
  useEffect(() => {
    if (type === 'tool') {
      trackToolVisibilityFiltered({ country, category, tool, visibility });
    } else {
      trackCategoryVisibilityFiltered({ country, category, visibility });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
