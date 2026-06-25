import { NextResponse } from 'next/server';
import { getUniqueStates } from '@/lib/government/dataGovInService';
import { mandiConfigGuard, mandiErrorResponse } from '@/lib/government/mandiRouteUtils';

export const revalidate = 21600;

export async function GET() {
  const guard = mandiConfigGuard();
  if (guard) return guard;

  try {
    const data = await getUniqueStates();
    return NextResponse.json({ data });
  } catch (err) {
    return mandiErrorResponse(err);
  }
}
