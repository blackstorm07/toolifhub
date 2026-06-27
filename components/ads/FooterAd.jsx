import AdUnit from './AdUnit';
import config from '@/config';

export default function FooterAd() {
  const slot = config.ads.slots.footer;
  if (!config.ads.adsenseClient || !slot) return null;

  return (
    <div className="py-6 bg-muted/20 border-t border-border">
      <div className="container">
        <AdUnit
          slot={slot}
          format="auto"
          className="min-h-[50px] md:min-h-[90px]"
          style={{ minHeight: '50px' }}
        />
      </div>
    </div>
  );
}
