// Centralized app configuration — reads from environment variables
// All values are validated at startup; missing required vars throw.

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please copy .env.local.example to .env.local and fill in all values.`
    );
  }
  return value;
}

function optionalEnv(key, fallback = '') {
  return process.env[key] || fallback;
}

// Only validate server-side vars on the server
const isServer = typeof window === 'undefined';

export const config = {
  app: {
    name: optionalEnv('NEXT_PUBLIC_APP_NAME', 'ToolifHub'),
    url: optionalEnv('NEXT_PUBLIC_APP_URL', 'https://toolifhub.com'),
    description: 'One Hub. Unlimited Tools. — Free online tools for everyone.',
    tagline: 'One Hub. Unlimited Tools.',
  },
  db: {
    uri: isServer ? optionalEnv('MONGODB_URI', '') : '',
    name: optionalEnv('DATABASE_NAME', 'toolifhub'),
  },
  auth: {
    jwtSecret: isServer ? optionalEnv('JWT_SECRET', 'dev-secret-change-in-production') : '',
    jwtExpiresIn: '7d',
    cookieName: 'auth_token',
  },
  admin: {
    email: isServer ? optionalEnv('ADMIN_EMAIL', 'admin@toolifhub.com') : '',
    password: isServer ? optionalEnv('ADMIN_PASSWORD', '') : '',
  },
  analytics: {
    gtmId: optionalEnv('NEXT_PUBLIC_GTM_ID', ''),
    gaId: optionalEnv('NEXT_PUBLIC_GA_ID', ''),
    googleAdsId: optionalEnv('NEXT_PUBLIC_GOOGLE_ADS_ID', ''),
  },
  ads: {
    adsenseClient: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT', ''),
    slots: {
      header: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_HEADER_SLOT', '2106750160'),
      homepageContent: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_HOMEPAGE_SLOT', '7660584898'),
      toolTop: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_TOOL_TOP_SLOT', '3317593746'),
      toolMiddle: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_TOOL_MIDDLE_SLOT', '8969797136'),
      toolBottom: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_TOOL_BOTTOM_SLOT', '5030552128'),
      blogTop: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_BLOG_TOP_SLOT', '2404388781'),
      blogMiddle: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_BLOG_MIDDLE_SLOT', '8081432898'),
      category: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CATEGORY_SLOT', '4647408746'),
      sidebar: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT', '8203510373'),
      footer: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_FOOTER_SLOT', '9691430409'),
    },
  },
  pagination: {
    toolsPerPage: 24,
    blogsPerPage: 12,
  },
};

export default config;
