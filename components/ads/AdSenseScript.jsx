import Script from 'next/script';
import config from '@/config';

const ADSENSE_CLIENT = config.ads.adsenseClient;

/**
 * Loads adsbygoogle.js once globally via next/script so Next.js owns
 * insertion/dedup instead of a manually authored <head>, which previously
 * caused hydration attribute mismatches. AdSense doesn't care about the
 * extra data-nscript attribute next/script adds — it only needs src+async.
 */
export default function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
