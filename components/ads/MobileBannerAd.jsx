import AdUnit from './AdUnit';

export default function MobileBannerAd() {
  return (
    <div className="block md:hidden w-full sticky bottom-0 z-40 bg-background border-t border-border shadow-lg">
      <AdUnit
        slot="YOUR_MOBILE_BANNER_AD_SLOT_ID"
        format="banner"
        className="min-h-[50px]"
        style={{ minHeight: '50px' }}
      />
    </div>
  );
}
