// Generated dynamically from env so the publisher ID never drifts from the
// AdSense script loaded via components/ads/AdSenseScript.jsx in app/layout.js.
export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || '';
  const pubId = client.replace(/^ca-/, '');
  const lines = pubId ? [`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`] : [];

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
