import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo/constants';

export const runtime = 'edge';

// Branded fallback OG image for tools/categories/blogs that don't have a
// custom featuredImage — keeps every shared link visual instead of blank.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || SITE_NAME).slice(0, 80);
  const subtitle = (searchParams.get('subtitle') || SITE_TAGLINE).slice(0, 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.85)', marginBottom: 24, fontWeight: 600 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 64, color: 'white', fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.8)', marginTop: 28 }}>{subtitle}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
