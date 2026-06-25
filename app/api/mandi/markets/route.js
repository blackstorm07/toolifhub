import { NextResponse } from 'next/server';
import { getMarketsForState } from '@/lib/government/dataGovInService';
import { getQueryParam, mandiConfigGuard, mandiErrorResponse } from '@/lib/government/mandiRouteUtils';

export const revalidate = 3600;

export async function GET(request) {
  const guard = mandiConfigGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const state = getQueryParam(searchParams, 'state');
  const commodity = getQueryParam(searchParams, 'commodity');

  if (!state) {
    return NextResponse.json({ error: 'A state is required to load markets.' }, { status: 400 });
  }

  try {
    const { markets, districts } = await getMarketsForState(state, { commodity: commodity || undefined });
    return NextResponse.json({ data: markets, districts });
  } catch (err) {
    return mandiErrorResponse(err);
  }
}
