import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
import { getCountryFromHeaders } from '@/lib/geo';
import { canViewTool, visibilityMongoFilter } from '@/lib/visibility';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '10');
    const country = getCountryFromHeaders(request.headers);
    const countryFilter = visibilityMongoFilter(country);

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], tools: [], categories: [] });
    }

    const searchRegex = new RegExp(q, 'i');

    const [toolsRaw, categories] = await Promise.all([
      Tool.find({
        status: 'active',
        ...countryFilter,
        $or: [
          { title: searchRegex },
          { shortDescription: searchRegex },
          { keywords: { $in: [searchRegex] } },
        ],
      })
        .populate('category', 'name slug icon visibility')
        .select('title slug icon shortDescription category')
        .limit(limit * 2)
        .lean(),
      getVisibleCategoriesWithCounts({ extraMatch: { name: searchRegex }, limit: 5, country }),
    ]);

    // Mongo filter can't express the category-override rule, so finish the
    // check in JS (a worldwide tool inside an india_only category).
    const tools = toolsRaw.filter((t) => canViewTool(t, t.category, country)).slice(0, limit);

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
