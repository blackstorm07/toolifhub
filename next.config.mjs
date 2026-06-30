/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Admin-entered Featured Image URLs can point to any external host
      // (CDN, Cloudinary, S3, a customer's own site, etc.) — a finite
      // allowlist can't keep up, so allow any https/http remote source
      // through Next's image optimizer rather than silently blocking
      // unlisted domains.
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog/10-youtube-seo-tips-to-rank-number-1-in-2024',
        destination: '/blog/10-youtube-seo-tips-to-rank-number-1-in-2026',
        permanent: true,
      },
      {
        source: '/tools/random-name-generator',
        destination: '/tools/random-user-generator',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/sitemap(.*).xml',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600' }],
      },
      {
        // Cross-origin isolation enables SharedArrayBuffer, which lets
        // @imgly/background-removal use multi-threaded WASM (faster).
        // Scoped to this single route only: applying COEP site-wide would
        // block third-party AdSense iframes on every other tool page.
        // 'credentialless' (rather than 'require-corp') avoids requiring
        // CORP headers from every cross-origin resource on this page.
        source: '/tools/remove-background',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },
};

export default nextConfig;
