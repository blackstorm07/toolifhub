import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ifsc = (searchParams.get('ifsc') || '').trim().toUpperCase();

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    return NextResponse.json({ error: 'Enter a valid 11-character IFSC code (e.g. SBIN0001234)' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`https://ifsc.razorpay.com/${ifsc}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 604800 },
    });

    if (upstream.status === 404) {
      return NextResponse.json({ error: 'No bank branch found for this IFSC code' }, { status: 404 });
    }
    if (!upstream.ok) {
      return NextResponse.json({ error: 'IFSC lookup service is unavailable right now' }, { status: 502 });
    }

    const result = await upstream.json();

    return NextResponse.json({
      data: {
        ifsc: result.IFSC,
        bank: result.BANK,
        branch: result.BRANCH,
        address: result.ADDRESS,
        city: result.CITY,
        district: result.DISTRICT,
        state: result.STATE,
        contact: result.CONTACT || null,
        micr: result.MICR || null,
        neft: !!result.NEFT,
        rtgs: !!result.RTGS,
        imps: !!result.IMPS,
        upi: !!result.UPI,
      },
    });
  } catch (err) {
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
    return NextResponse.json(
      { error: timedOut ? 'IFSC lookup timed out, please try again' : 'Failed to fetch IFSC data' },
      { status: timedOut ? 504 : 502 }
    );
  }
}
