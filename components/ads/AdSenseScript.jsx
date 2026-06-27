import config from '@/config';

const ADSENSE_CLIENT = config.ads.adsenseClient;

/**
 * Native <script> in <head> — required by Google AdSense.
 * Do NOT use next/script here; it injects data-nscript, which AdSense rejects.
 */
export default function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
