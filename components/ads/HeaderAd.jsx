import AdUnit from './AdUnit';
import config from '@/config';

export default function HeaderAd() {
  const slot = config.ads.headerSlot;
  if (!slot) return null;

  return (
    <div className="hidden md:block w-full py-2 bg-muted/20">
      <div className="container">
        <AdUnit
          slot={slot}
          format="horizontal"
          className="min-h-[90px]"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
}
