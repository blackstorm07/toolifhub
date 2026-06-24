import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Blog from '@/models/Blog';
import Category from '@/models/Category';

const BLOG_CATEGORY_MAP = {
  'ai-tools': ['ai', 'artificial intelligence', 'machine learning'],
  'seo-tools': ['seo', 'search engine', 'marketing', 'keyword'],
  'developer-tools': ['developer', 'programming', 'code', 'javascript'],
  'youtube-tools': ['youtube', 'video', 'creator', 'channel'],
  'productivity-tools': ['productivity', 'workflow', 'efficiency', 'focus'],
};

export async function getRelatedBlogsForTool(tool, limit = 3) {
  try {
    await connectDB();
    const categorySlug = tool.category?.slug;
    const tags = BLOG_CATEGORY_MAP[categorySlug] || tool.keywords?.slice(0, 2) || [];
    if (!tags.length) return [];

    const blogs = await Blog.find({
      status: 'published',
      $or: tags.map((tag) => ({ tags: { $regex: tag, $options: 'i' } })),
    })
      .select('title slug excerpt featuredImage publishedAt')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return blogs;
  } catch {
    return [];
  }
}

export async function getRelatedBlogsForBlog(blog, limit = 3) {
  try {
    await connectDB();
    const blogs = await Blog.find({
      slug: { $ne: blog.slug },
      status: 'published',
      tags: { $in: blog.tags || [] },
    })
      .select('title slug excerpt featuredImage publishedAt')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return blogs;
  } catch {
    return [];
  }
}

export async function getRelatedToolsForBlog(blog, limit = 6) {
  try {
    await connectDB();
    const tags = (blog.tags || []).join(' ').toLowerCase();

    let categorySlug = null;
    for (const [slug, keywords] of Object.entries(BLOG_CATEGORY_MAP)) {
      if (keywords.some((k) => tags.includes(k))) {
        categorySlug = slug;
        break;
      }
    }

    if (!categorySlug) {
      return Tool.find({ status: 'active', featured: true })
        .select('title slug icon shortDescription category')
        .populate('category', 'name slug')
        .limit(limit)
        .lean();
    }

    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (!category) return [];

    return Tool.find({ category: category._id, status: 'active' })
      .select('title slug icon shortDescription category')
      .populate('category', 'name slug')
      .sort({ featured: -1, views: -1 })
      .limit(limit)
      .lean();
  } catch {
    return [];
  }
}

export async function getCategoryToolsForBlog(blog) {
  try {
    await connectDB();
    const tags = (blog.tags || []).join(' ').toLowerCase();
    for (const [slug, keywords] of Object.entries(BLOG_CATEGORY_MAP)) {
      if (keywords.some((k) => tags.includes(k))) {
        const category = await Category.findOne({ slug }).select('name slug icon description').lean();
        if (category) return category;
      }
    }
    return null;
  } catch {
    return null;
  }
}
