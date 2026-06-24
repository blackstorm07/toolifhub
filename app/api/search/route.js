import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], tools: [], categories: [] });
    }

    const searchRegex = new RegExp(q, 'i');

    const [tools, categories] = await Promise.all([
      Tool.find({
        status: 'active',
        $or: [
          { title: searchRegex },
          { shortDescription: searchRegex },
          { keywords: { $in: [searchRegex] } },
        ],
      })
        .populate('category', 'name slug icon')
        .select('title slug icon shortDescription category')
        .limit(limit)
        .lean(),
      getVisibleCategoriesWithCounts({ extraMatch: { name: searchRegex }, limit: 5 }),
    ]);

    return NextResponse.json({
      tools,
      categories,
      query: q,
      total: tools.length + categories.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
