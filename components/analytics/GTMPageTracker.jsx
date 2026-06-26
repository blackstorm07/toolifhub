'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';
import { trackPageView } from '@/lib/analytics';
import { isGTMAnabled } from '@/lib/gtm';

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!isGTMAnabled()) return;
    // GTM fires the initial page_view when the container loads.
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GTMPageTracker() {
  if (!isGTMAnabled()) return null;

  return (
    <Suspense fallback={null}>
      <RouteChangeTracker />
    </Suspense>
  );
}
