import AdUnit from './AdUnit';

export default function FooterAd() {
  return (
    <div className="py-4 border-t border-border bg-muted/20">
      <div className="container">
        <AdUnit slot="YOUR_FOOTER_AD_SLOT_ID" format="horizontal" className="min-h-[90px]" />
      </div>
    </div>
  );
}
