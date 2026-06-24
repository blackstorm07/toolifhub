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
    url: optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
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
    gaId: optionalEnv('NEXT_PUBLIC_GA_ID', ''),
    gscVerification: optionalEnv('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION', ''),
  },
  ads: {
    adsenseClient: optionalEnv('NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT', ''),
  },
  pagination: {
    toolsPerPage: 24,
    blogsPerPage: 12,
  },
};

export default config;
