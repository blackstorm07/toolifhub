import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get('featured') === 'true';

    const categories = await getVisibleCategoriesWithCounts({ featuredOnly });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
