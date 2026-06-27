'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isAdUnitInitialized, pushAdUnit, waitForAdSense } from '@/lib/ads/adsense';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

export default function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style = {},
  lazy = true,
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    pushedRef.current = false;
  }, [pathname, slot]);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;

    const ins = insRef.current;
    if (!ins) return;

    let cancelled = false;
    let observer;

    const initialize = async () => {
      if (cancelled || pushedRef.current || isAdUnitInitialized(ins)) return;

      const ready = await waitForAdSense();
      if (cancelled || !ready || !insRef.current) return;

      if (pushAdUnit(insRef.current)) {
        pushedRef.current = true;
      }
    };

    if (lazy && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            initialize();
          }
        },
        { rootMargin: '200px 0px' }
      );
      observer.observe(ins);
    } else {
      initialize();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [slot, pathname, lazy]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div className={`ad-unit w-full overflow-hidden ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: 'block', minHeight: style.minHeight || undefined, ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
