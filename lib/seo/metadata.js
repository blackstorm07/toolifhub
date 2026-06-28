import { truncate } from '@/lib/utils';
import {
  SITE_NAME,
  SITE_URL,
  SITE_TAGLINE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  OG_IMAGE,
  TWITTER_HANDLE,
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
  ogImageWidth = OG_IMAGE.width,
  ogImageHeight = OG_IMAGE.height,
  ogType = 'website',
  noIndex = false,
  absoluteTitle = false,
  languages,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
}) {
  const canonical = buildCanonical(path);
  const metaDescription = truncate(description || DEFAULT_DESCRIPTION, 160);
  const titleConfig = absoluteTitle ? { absolute: title } : title;

  const metadata = {
    title: titleConfig,
    description: metaDescription,
    keywords: keywords.length ? keywords : undefined,
    alternates: {
      canonical,
      // Future-ready hreflang: pages restricted to an India-only audience
      // (lib/visibility.js) get an explicit en-IN alternate. Worldwide pages
      // intentionally omit `languages` until additional locales exist.
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title: absoluteTitle ? title.replace(` | ${SITE_NAME}`, '') : title,
      description: metaDescription,
      url: canonical,
      type: ogType,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: ogImageWidth, height: ogImageHeight, alt: OG_IMAGE.alt }],
      ...(ogType === 'article'
        ? {
            publishedTime: articlePublishedTime,
            modifiedTime: articleModifiedTime,
            authors: articleAuthor ? [articleAuthor] : undefined,
          }
        : {}),
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
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { verification: { other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } }
      : {}),
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: "/favicon.png", type: "image/png" },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.json',
  };
}
