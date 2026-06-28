import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const skip = (page - 1) * limit;

    const extra = {};
    if (featured === 'true') extra.featured = true;
    if (category) extra.category = category;
    if (tag) extra.tags = tag;
    const query = publishedBlogFilter(extra);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select('-content')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
