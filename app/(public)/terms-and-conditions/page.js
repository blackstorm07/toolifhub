import { Scale } from 'lucide-react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import TermsAndConditionsContent, {
  termsSections,
} from '@/components/legal/TermsAndConditionsContent';
import JsonLd, { buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { TERMS_LAST_UPDATED } from '@/lib/legal/constants';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const metadata = buildPageMetadata({
  title: 'Terms & Conditions',
  description: `Read the Terms & Conditions for using ${SITE_NAME}. Understand your rights, responsibilities, and our service policies for our free online tools platform.`,
  path: '/terms-and-conditions',
  keywords: [
    'terms and conditions',
    'terms of service',
    'user agreement',
    'acceptable use',
    `${SITE_NAME.toLowerCase()} terms`,
  ],
});

function buildTermsSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Terms & Conditions — ${SITE_NAME}`,
    description: `Terms and Conditions for ${SITE_NAME}. Rules and guidelines for using our free online tools platform.`,
    url: `${SITE_URL}/terms-and-conditions`,
    dateModified: TERMS_LAST_UPDATED,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { label: 'Terms & Conditions', href: '/terms-and-conditions' },
          ]),
          buildTermsSchema(),
        ]}
      />
      <LegalPageLayout
        title="Terms & Conditions"
        lastUpdated={TERMS_LAST_UPDATED}
        badge="Legal Agreement"
        heroIcon={Scale}
        description={`These Terms govern your use of ${SITE_NAME} and our free online tools. Please read them carefully to understand your rights and responsibilities.`}
        sections={termsSections}
      >
        <TermsAndConditionsContent />
      </LegalPageLayout>
    </>
  );
}
