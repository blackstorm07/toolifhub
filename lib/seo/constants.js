export const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ToolifHub';
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const SITE_TAGLINE = 'One Hub. Unlimited Tools.';
export const DEFAULT_DESCRIPTION =
  'Free online tools for YouTube, SEO, developers, AI, productivity and more. 500+ tools — no sign-up required.';
export const DEFAULT_KEYWORDS = [
  'free online tools',
  'youtube tools',
  'seo tools',
  'developer tools',
  'ai tools',
  'productivity tools',
];
export const OG_IMAGE = {
  url: '/og-image.svg',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — Free Online Tools`,
};
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '';
