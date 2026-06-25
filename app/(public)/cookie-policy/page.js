import LegalPageLayout from '@/components/legal/LegalPageLayout';
import CookiePolicyContent, { cookiePolicySections } from '@/components/legal/CookiePolicyContent';
import JsonLd, { buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { COOKIE_POLICY_LAST_UPDATED } from '@/lib/legal/constants';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const metadata = buildPageMetadata({
  title: 'Cookie Policy',
  description: `Learn how ${SITE_NAME} uses cookies and similar technologies, and how to manage your cookie preferences.`,
  path: '/cookie-policy',
  keywords: ['cookie policy', 'cookies', 'tracking', `${SITE_NAME.toLowerCase()} cookies`],
});

function buildCookiePolicySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Cookie Policy — ${SITE_NAME}`,
    description: `Cookie Policy for ${SITE_NAME}. Learn how we use cookies and similar tracking technologies.`,
    url: `${SITE_URL}/cookie-policy`,
    dateModified: COOKIE_POLICY_LAST_UPDATED,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

export default function CookiePolicyPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([{ label: 'Cookie Policy', href: '/cookie-policy' }]),
          buildCookiePolicySchema(),
        ]}
      />
      <LegalPageLayout
        title="Cookie Policy"
        lastUpdated={COOKIE_POLICY_LAST_UPDATED}
        badge="Cookies"
        description={`This policy explains how ${SITE_NAME} uses cookies and similar technologies, and how you can control them.`}
        sections={cookiePolicySections}
      >
        <CookiePolicyContent />
      </LegalPageLayout>
    </>
  );
}
