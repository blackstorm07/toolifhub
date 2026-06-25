import { NextResponse } from 'next/server';
import { getFilterOptions, getMandiPrices } from '@/lib/government/dataGovInService';
import { getQueryParam, mandiConfigGuard, mandiErrorResponse } from '@/lib/government/mandiRouteUtils';

export async function GET(request) {
  const guard = mandiConfigGuard();
  if (guard) return guard;

  const { searchParams } = new URL(request.url);
  const commodity = getQueryParam(searchParams, 'commodity');
  const state = getQueryParam(searchParams, 'state');
  const market = getQueryParam(searchParams, 'market');
  const district = getQueryParam(searchParams, 'district');
  const variety = getQueryParam(searchParams, 'variety');
  const grade = getQueryParam(searchParams, 'grade');
  const optionsOnly = getQueryParam(searchParams, 'optionsOnly') === 'true';

  if (!commodity || !state || !market) {
    return NextResponse.json(
      { error: 'Commodity, state, and market are all required.' },
      { status: 400 }
    );
  }

  try {
    if (optionsOnly) {
      const options = await getFilterOptions({ state, commodity, market, district: district || undefined });
      return NextResponse.json({ options });
    }

    const result = await getMandiPrices({
      commodity,
      state,
      market,
      district: district || undefined,
      variety: variety || undefined,
      grade: grade || undefined,
    });

    if (!result.data.length) {
      return NextResponse.json({ data: [], lastUpdated: null });
    }

    return NextResponse.json(result);
  } catch (err) {
    return mandiErrorResponse(err);
  }
}
