import { NextResponse } from 'next/server';
import { getDataGovInConfig, toMandiErrorResponse } from './dataGovInService';

export function mandiConfigGuard() {
  const { configured } = getDataGovInConfig();
  if (!configured) {
    return NextResponse.json(
      { error: 'Data.gov.in API key is not configured.' },
      { status: 503 }
    );
  }
  return null;
}

/** @param {unknown} err */
export function mandiErrorResponse(err) {
  const { message, status } = toMandiErrorResponse(err);
  return NextResponse.json({ error: message }, { status });
}

/** @param {URLSearchParams} searchParams @param {string} key */
export function getQueryParam(searchParams, key) {
  return (searchParams.get(key) || '').trim();
}
