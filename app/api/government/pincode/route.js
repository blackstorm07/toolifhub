import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pincode = (searchParams.get('pincode') || '').trim();

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: 'Enter a valid 6-digit PIN code' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'PIN code lookup service is unavailable right now' }, { status: 502 });
    }

    const [result] = await upstream.json();

    if (result?.Status !== 'Success' || !result?.PostOffice?.length) {
      return NextResponse.json({ error: 'No records found for this PIN code' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        pincode,
        postOffices: result.PostOffice.map((po) => ({
          name: po.Name,
          state: po.State,
          district: po.District,
          division: po.Division,
          taluka: po.Block !== 'NA' ? po.Block : po.Division,
          branchType: po.BranchType,
          deliveryStatus: po.DeliveryStatus,
        })),
      },
    });
  } catch (err) {
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
    return NextResponse.json(
      { error: timedOut ? 'PIN code lookup timed out, please try again' : 'Failed to fetch PIN code data' },
      { status: timedOut ? 504 : 502 }
    );
  }
}
