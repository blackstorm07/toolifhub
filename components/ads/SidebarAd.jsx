import AdUnit from './AdUnit';

export default function SidebarAd() {
  return (
    <div className="sticky top-24">
      <AdUnit
        slot="YOUR_SIDEBAR_AD_SLOT_ID"
        format="vertical"
        className="min-h-[600px]"
        style={{ minHeight: '600px', width: '300px' }}
      />
    </div>
  );
}
