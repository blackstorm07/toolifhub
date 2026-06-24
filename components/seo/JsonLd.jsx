import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export default function JsonLd({ data }) {
  if (!data) return null;
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export function buildFaqSchema(faqs = []) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function buildBreadcrumbSchema(items = [], baseUrl = SITE_URL) {
  const elements = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    ...items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: elements,
  };
}

export function buildSoftwareApplicationSchema({ name, description, url, category, applicationCategory }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: applicationCategory || category || 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

/** @deprecated Use buildSoftwareApplicationSchema */
export function buildWebApplicationSchema(props) {
  return buildSoftwareApplicationSchema(props);
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.svg`,
    description: 'Free online tools for YouTube, SEO, developers, AI, productivity and more.',
    sameAs: [],
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Free online tools for everyone. 500+ tools, no sign-up required.',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/categories?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildArticleSchema({ title, description, url, image, datePublished, dateModified, authorName }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/og-image.svg`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { '@type': 'Person', name: authorName || SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export function buildCollectionPageSchema({ name, description, url, items = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}
