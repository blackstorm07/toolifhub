import Script from 'next/script';
import config from '@/config';

const GOOGLE_ADS_ID = config.analytics.googleAdsId;

/**
 * Google tag (gtag.js) for Google Ads conversion tracking.
 * Uses next/script so Next.js owns insertion/dedup instead of a manually
 * authored <head>, which previously caused hydration attribute mismatches.
 */
export default function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        id="google-ads-tag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <Script
        id="google-ads-tag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`,
        }}
      />
    </>
  );
}
