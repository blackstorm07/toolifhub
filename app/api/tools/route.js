import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const recent = searchParams.get('recent');
    const status = searchParams.get('status') || 'active';

    const query = { status };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (trending === 'true') query.trending = true;

    let sortOption = { createdAt: -1 };
    if (trending === 'true') sortOption = { views: -1 };
    if (featured === 'true') sortOption = { views: -1 };

    const skip = (page - 1) * limit;

    const [tools, total] = await Promise.all([
      Tool.find(query)
        .populate('category', 'name slug icon')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Tool.countDocuments(query),
    ]);

    return NextResponse.json({
      tools,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/tools error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
