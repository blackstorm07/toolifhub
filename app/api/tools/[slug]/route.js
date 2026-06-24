import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const tool = await Tool.findOne({ slug, status: 'active' })
      .populate('category', 'name slug icon')
      .lean();

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Increment views asynchronously
    Tool.findByIdAndUpdate(tool._id, { $inc: { views: 1 } }).exec();

    // Get related tools
    let relatedTools = [];
    if (tool.relatedTools?.length) {
      relatedTools = await Tool.find({
        slug: { $in: tool.relatedTools },
        status: 'active',
      })
        .select('title slug icon shortDescription category')
        .populate('category', 'name slug')
        .limit(6)
        .lean();
    } else {
      // Auto-fetch from same category
      relatedTools = await Tool.find({
        category: tool.category._id,
        slug: { $ne: slug },
        status: 'active',
      })
        .select('title slug icon shortDescription category')
        .populate('category', 'name slug')
        .limit(6)
        .lean();
    }

    return NextResponse.json({ tool, relatedTools });
  } catch (error) {
    console.error('GET /api/tools/[slug] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
