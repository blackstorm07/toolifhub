'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';
import { trackPageView } from '@/lib/analytics';

function RouteChangeTracker({ gaId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!gaId) return;
    // gtag-init in layout.js already fires the initial page_view.
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    trackPageView(url, gaId);
  }, [pathname, searchParams, gaId]);

  return null;
}

export default function GAPageTracker({ gaId }) {
  if (!gaId) return null;

  return (
    <Suspense fallback={null}>
      <RouteChangeTracker gaId={gaId} />
    </Suspense>
  );
}
