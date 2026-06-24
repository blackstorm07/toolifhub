import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getPublicCategoryWithCount } from '@/lib/categories';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    // getPublicCategoryWithCount returns null for hidden categories AND for
    // categories with 0 active tools, so empty categories 404 here too.
    const category = await getPublicCategoryWithCount(slug);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const skip = (page - 1) * limit;

    const [tools, total] = await Promise.all([
      Tool.find({ category: category._id, status: 'active' })
        .sort({ featured: -1, views: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tool.countDocuments({ category: category._id, status: 'active' }),
    ]);

    return NextResponse.json({
      category,
      tools,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/categories/[slug] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
