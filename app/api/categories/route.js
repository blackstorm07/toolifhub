import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
import { getCountryFromHeaders } from '@/lib/geo';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get('featured') === 'true';
    const country = getCountryFromHeaders(request.headers);

    const categories = await getVisibleCategoriesWithCounts({ featuredOnly, country });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
