import config from '@/config';

const GOOGLE_ADS_ID = config.analytics.googleAdsId;

/**
 * Google tag (gtag.js) for Google Ads — loaded once in root layout <head>.
 * Placed first in <head> per Google's installation instructions.
 */
export default function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`,
        }}
      />
    </>
  );
}
