import AdUnit from './AdUnit';
import config from '@/config';

export default function ToolTopAd() {
  const slot = config.ads.slots.toolTop;
  if (!config.ads.adsenseClient || !slot) return null;

  return (
    <div className="my-6">
      <AdUnit
        slot={slot}
        format="auto"
        className="min-h-[90px]"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
}
