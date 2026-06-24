import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Category from '@/models/Category';
import Blog from '@/models/Blog';
import User from '@/models/User';
import ToolUsage from '@/models/ToolUsage';
import { verifyApiAuth } from '@/lib/auth';

function requireAdmin(request) {
  const session = verifyApiAuth(request);
  return session?.role === 'admin' ? session : null;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();

    const [
      totalTools,
      activeTools,
      totalCategories,
      totalBlogs,
      totalUsers,
      totalUsage,
      topTools,
      recentUsage,
    ] = await Promise.all([
      Tool.countDocuments(),
      Tool.countDocuments({ status: 'active' }),
      Category.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      User.countDocuments(),
      ToolUsage.countDocuments(),
      Tool.find({ status: 'active' })
        .sort({ views: -1 })
        .limit(10)
        .select('title slug views icon')
        .lean(),
      ToolUsage.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('toolId', 'title slug')
        .lean(),
    ]);

    return NextResponse.json({
      stats: {
        totalTools,
        activeTools,
        totalCategories,
        totalBlogs,
        totalUsers,
        totalUsage,
      },
      topTools,
      recentUsage,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
