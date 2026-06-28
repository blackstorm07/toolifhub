import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const blog = await Blog.findOneAndUpdate(
      publishedBlogFilter({ slug }),
      { $inc: { likes: 1 } },
      { new: true }
    ).select('likes');
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ likes: blog.likes });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
