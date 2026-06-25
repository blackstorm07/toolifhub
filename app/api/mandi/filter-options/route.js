import { NextResponse } from 'next/server';
import { getFilterOptions } from '@/lib/government/dataGovInService';
import { getQueryParam, mandiConfigGuard, mandiErrorResponse } from '@/lib/government/mandiRouteUtils';

export const revalidate = 1800;

export async function GET(request) {
  const guard = mandiConfigGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const state = getQueryParam(searchParams, 'state');
  const commodity = getQueryParam(searchParams, 'commodity');
  const market = getQueryParam(searchParams, 'market');
  const district = getQueryParam(searchParams, 'district');

  if (!state || !commodity || !market) {
    return NextResponse.json(
      { error: 'State, commodity, and market are required for filter options.' },
      { status: 400 }
    );
  }

  try {
    const options = await getFilterOptions({
      state,
      commodity,
      market,
      district: district || undefined,
    });
    return NextResponse.json({ data: options });
  } catch (err) {
    return mandiErrorResponse(err);
  }
}
