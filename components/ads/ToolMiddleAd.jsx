import AdUnit from './AdUnit';
import config from '@/config';

export default function ToolMiddleAd() {
  const slot = config.ads.slots.toolMiddle;
  if (!config.ads.adsenseClient || !slot) return null;

  return (
    <div className="my-8">
      <AdUnit
        slot={slot}
        format="auto"
        className="min-h-[250px]"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
}
