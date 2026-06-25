import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (query.length < 3) {
    return NextResponse.json({ error: 'Enter at least 3 characters to search' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Post office search service is unavailable right now' }, { status: 502 });
    }

    const [result] = await upstream.json();

    if (result?.Status !== 'Success' || !result?.PostOffice?.length) {
      return NextResponse.json({ error: 'No post offices found matching that search' }, { status: 404 });
    }

    return NextResponse.json({
      data: result.PostOffice.map((po) => ({
        name: po.Name,
        pincode: po.Pincode,
        state: po.State,
        district: po.District,
        division: po.Division,
        taluka: po.Block !== 'NA' ? po.Block : po.Division,
        branchType: po.BranchType,
        deliveryStatus: po.DeliveryStatus,
      })),
    });
  } catch (err) {
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
    return NextResponse.json(
      { error: timedOut ? 'Post office search timed out, please try again' : 'Failed to fetch post office data' },
      { status: timedOut ? 504 : 502 }
    );
  }
}
