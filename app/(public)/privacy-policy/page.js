import LegalPageLayout from '@/components/legal/LegalPageLayout';
import PrivacyPolicyContent, {
  privacyPolicySections,
} from '@/components/legal/PrivacyPolicyContent';
import JsonLd, { buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { PRIVACY_POLICY_LAST_UPDATED } from '@/lib/legal/constants';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: `Learn how ${SITE_NAME} collects, uses, and protects your information. Transparent privacy practices for our free online tools platform.`,
  path: '/privacy-policy',
  keywords: [
    'privacy policy', 'data protection', 'cookie policy', 'user privacy',
    `${SITE_NAME.toLowerCase()} privacy`, 'how is my data used', 'data collection policy',
    'is toolifhub safe', 'gdpr compliance', 'personal data protection', 'browser based privacy',
    'no data storage tools', 'online privacy policy', 'website privacy practices',
    'data security policy', 'user data rights', 'privacy first online tools',
    'toolifhub data policy', 'free tools privacy', 'ToolifHub',
  ],
});

function buildPrivacyPolicySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy — ${SITE_NAME}`,
    description: `Privacy Policy for ${SITE_NAME}. Learn how we collect, use, and protect your personal information.`,
    url: `${SITE_URL}/privacy-policy`,
    dateModified: PRIVACY_POLICY_LAST_UPDATED,
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([{ label: 'Privacy Policy', href: '/privacy-policy' }]),
          buildPrivacyPolicySchema(),
        ]}
      />
      <LegalPageLayout
        title="Privacy Policy"
        lastUpdated={PRIVACY_POLICY_LAST_UPDATED}
        badge="Your Privacy"
        description={`At ${SITE_NAME}, we believe privacy is a fundamental right. This policy explains exactly what data we collect, how we use it, and the choices you have.`}
        sections={privacyPolicySections}
      >
        <PrivacyPolicyContent />
      </LegalPageLayout>
    </>
  );
}
