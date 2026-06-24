import BestOfPage, { generateBestOfMetadata } from '@/components/seo/BestOfPage';

const ROUTE = 'best-developer-tools';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateBestOfMetadata(ROUTE);
}

export default function Page() {
  return <BestOfPage routeSlug={ROUTE} />;
}
