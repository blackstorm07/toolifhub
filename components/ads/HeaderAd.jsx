import AdUnit from './AdUnit';

// Replace slot IDs with your actual AdSense slot IDs after getting approval
export default function HeaderAd() {
  return (
    <div className="hidden md:block w-full py-2 bg-muted/20">
      <div className="container">
        <AdUnit
          slot="YOUR_HEADER_AD_SLOT_ID"
          format="horizontal"
          className="min-h-[90px]"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
}
