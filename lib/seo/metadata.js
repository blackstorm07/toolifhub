import { truncate } from '@/lib/utils';
import {
  SITE_NAME,
  SITE_URL,
  SITE_TAGLINE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  OG_IMAGE,
  TWITTER_HANDLE,
  GSC_VERIFICATION,
} from './constants';

export function buildCanonical(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function buildToolTitle(toolName) {
  return `${toolName} - Free Online Tool | ${SITE_NAME}`;
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  ogImage = OG_IMAGE.url,
  ogType = 'website',
  noIndex = false,
  absoluteTitle = false,
}) {
  const canonical = buildCanonical(path);
  const metaDescription = truncate(description || DEFAULT_DESCRIPTION, 160);
  const titleConfig = absoluteTitle ? { absolute: title } : title;

  const metadata = {
    title: titleConfig,
    description: metaDescription,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    openGraph: {
      title: absoluteTitle ? title.replace(` | ${SITE_NAME}`, '') : title,
      description: metaDescription,
      url: canonical,
      type: ogType,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle ? title.replace(` | ${SITE_NAME}`, '') : title,
      description: metaDescription,
      images: [ogImage],
      ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  };

  if (GSC_VERIFICATION) {
    metadata.verification = { google: GSC_VERIFICATION };
  }

  return metadata;
}

export function buildRootMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: DEFAULT_DESCRIPTION,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: DEFAULT_DESCRIPTION,
      images: [OG_IMAGE.url],
      ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: { canonical: SITE_URL },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.json',
    ...(GSC_VERIFICATION ? { verification: { google: GSC_VERIFICATION } } : {}),
  };
}
