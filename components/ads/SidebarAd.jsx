import AdUnit from './AdUnit';
import config from '@/config';

export default function SidebarAd() {
  const slot = config.ads.slots.sidebar;
  if (!config.ads.adsenseClient || !slot) return null;

  return (
    <div className="hidden lg:block sticky top-24">
      <AdUnit
        slot={slot}
        format="auto"
        className="min-h-[250px] max-w-[300px]"
        style={{ minHeight: '250px', maxWidth: '300px' }}
      />
    </div>
  );
}
