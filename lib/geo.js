import { headers } from 'next/headers';

export const DEFAULT_COUNTRY = 'XX'; // unknown — treated as "not India" for safety

/**
 * Reads the visitor's country code from geo headers on a Headers-like object
 * (works with both the Web Fetch `Headers` from a Route Handler's `request`
 * and the `ReadonlyHeaders` returned by `headers()` in a Server Component).
 *
 * Vercel/most edge platforms inject `x-vercel-ip-country`. `x-country-code`
 * is a generic fallback for other proxies/CDNs (e.g. Cloudflare can be
 * configured to forward its `cf-ipcountry` header under this name).
 */
export function getCountryFromHeaders(headerList) {
  return (
    headerList.get('x-vercel-ip-country') ||
    headerList.get('x-country-code') ||
    headerList.get('cf-ipcountry') ||
    DEFAULT_COUNTRY
  ).toUpperCase();
}

/**
 * Server Component helper — reads the country of the current request.
 * Calling this opts the page out of full static rendering (Next.js treats
 * `headers()` as a dynamic API), which is correct here since the response
 * genuinely varies per visitor's location.
 */
export async function getRequestCountry() {
  const headerList = await headers();
  return getCountryFromHeaders(headerList);
}
