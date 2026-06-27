'use client';

import { useEffect, useId, useRef } from 'react';
import { usePathname } from 'next/navigation';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

function isAdInitialized(ins) {
  return Boolean(
    ins.getAttribute('data-adsbygoogle-status') ||
      ins.getAttribute('data-ad-status') ||
      ins.dataset.adInitialized === 'true'
  );
}

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
  const instanceId = useId();

  // Reset per route + slot so client navigations can fill a fresh <ins>.
  useEffect(() => {
    pushedRef.current = false;
  }, [pathname, slot]);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;

    const ins = insRef.current;
    if (!ins || pushedRef.current || isAdInitialized(ins)) return;

    let cancelled = false;
    let observer;

    const pushAd = () => {
      if (cancelled || pushedRef.current || !insRef.current) return;
      const el = insRef.current;
      if (isAdInitialized(el)) {
        pushedRef.current = true;
        return;
      }

      try {
        el.dataset.adInitialized = 'true';
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        delete el.dataset.adInitialized;
      }
    };

    const startPush = () => {
      if (cancelled) return;

      if (window.adsbygoogle) {
        pushAd();
        return;
      }

      let attempts = 0;
      const interval = window.setInterval(() => {
        attempts += 1;
        if (window.adsbygoogle) {
          window.clearInterval(interval);
          pushAd();
        } else if (attempts >= 100) {
          window.clearInterval(interval);
        }
      }, 100);

      return interval;
    };

    let pollInterval;

    if (lazy && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            pollInterval = startPush();
          }
        },
        { rootMargin: '200px 0px' }
      );
      observer.observe(ins);
    } else {
      pollInterval = startPush();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (pollInterval) window.clearInterval(pollInterval);
    };
  }, [slot, pathname, lazy]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div
      className={`ad-unit w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <ins
        ref={insRef}
        key={`${pathname}-${slot}-${instanceId}`}
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
