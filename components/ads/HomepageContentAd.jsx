import AdUnit from './AdUnit';
import config from '@/config';

export default function HomepageContentAd() {
  const slot = config.ads.slots.homepageContent;
  if (!config.ads.adsenseClient || !slot) return null;

  return (
    <div className="my-8">
      <div className="container">
        <AdUnit
          slot={slot}
          format="auto"
          className="min-h-[250px]"
          style={{ minHeight: '250px' }}
        />
      </div>
    </div>
  );
}
