import LegalPageLayout from '@/components/legal/LegalPageLayout';
import DisclaimerContent, { disclaimerSections } from '@/components/legal/DisclaimerContent';
import JsonLd, { buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { DISCLAIMER_LAST_UPDATED } from '@/lib/legal/constants';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const metadata = buildPageMetadata({
  title: 'Disclaimer',
  description: `Read the disclaimer for ${SITE_NAME}, covering tool accuracy, professional advice, third-party links, and limitation of liability.`,
  path: '/disclaimer',
  keywords: ['disclaimer', 'liability', 'terms', `${SITE_NAME.toLowerCase()} disclaimer`],
});

function buildDisclaimerSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Disclaimer — ${SITE_NAME}`,
    description: `Disclaimer for ${SITE_NAME} covering tool accuracy, professional advice, and liability.`,
    url: `${SITE_URL}/disclaimer`,
    dateModified: DISCLAIMER_LAST_UPDATED,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([{ label: 'Disclaimer', href: '/disclaimer' }]),
          buildDisclaimerSchema(),
        ]}
      />
      <LegalPageLayout
        title="Disclaimer"
        lastUpdated={DISCLAIMER_LAST_UPDATED}
        badge="Please Read"
        description={`Important information about the limitations of the tools and content provided by ${SITE_NAME}.`}
        sections={disclaimerSections}
      >
        <DisclaimerContent />
      </LegalPageLayout>
    </>
  );
}
