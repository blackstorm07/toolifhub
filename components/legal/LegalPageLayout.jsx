import LegalHero from './LegalHero';
import LegalTableOfContents from './LegalTableOfContents';

export default function LegalPageLayout({
  title,
  lastUpdated,
  description,
  badge,
  heroIcon,
  sections,
  children,
}) {
  return (
    <div className="page">
      <div className="max-w-6xl mx-auto">
        <LegalHero
          title={title}
          lastUpdated={lastUpdated}
          description={description}
          badge={badge}
          icon={heroIcon}
        />

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-12">
          <LegalTableOfContents sections={sections} />

          <div className="max-w-[52rem] space-y-5 sm:space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
