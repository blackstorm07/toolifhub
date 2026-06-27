import AdUnit from './AdUnit';
import config from '@/config';

export default function ToolBottomAd() {
  const slot = config.ads.slots.toolBottom;
  if (!config.ads.adsenseClient || !slot) return null;

  return (
    <div className="my-8">
      <AdUnit
        slot={slot}
        format="auto"
        className="min-h-[90px]"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
}
