import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const blog = await Blog.findOne(publishedBlogFilter({ slug })).lean();
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Increment views
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

    // Related blogs by tags
    const related = await Blog.find(publishedBlogFilter({ slug: { $ne: slug }, tags: { $in: blog.tags } }))
      .select('-content')
      .limit(3)
      .lean();

    return NextResponse.json({ blog, related });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
