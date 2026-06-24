import AdUnit from './AdUnit';

export default function InContentAd() {
  return (
    <div className="my-8">
      <AdUnit
        slot="YOUR_IN_CONTENT_AD_SLOT_ID"
        format="rectangle"
        className="min-h-[250px]"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
}
