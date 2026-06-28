import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import { canViewTool, canViewCategory, visibilityMongoFilter } from '@/lib/visibility';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';

const BLOG_CATEGORY_MAP = {
  'ai-tools': ['ai', 'artificial intelligence', 'machine learning'],
  'seo-tools': ['seo', 'search engine', 'marketing', 'keyword'],
  'developer-tools': ['developer', 'programming', 'code', 'javascript'],
  'youtube-tools': ['youtube', 'video', 'creator', 'channel'],
  'productivity-tools': ['productivity', 'workflow', 'efficiency', 'focus'],
};

// Blog content topic (lib/blog/categories.js) → Tool/Category product slug.
// Used to find related tools when the post has a real `category` field set
// — more reliable than scanning tags for keywords (the BLOG_CATEGORY_MAP
// fallback below, kept for older posts that predate the category field).
const BLOG_TO_TOOL_CATEGORY = {
  ai: 'ai-tools',
  seo: 'seo-tools',
  marketing: 'seo-tools',
  developer: 'developer-tools',
  programming: 'developer-tools',
  pdf: 'pdf-tools',
  image: 'image-tools',
  text: 'text-tools',
  youtube: 'youtube-tools',
  productivity: 'productivity-tools',
  calculators: 'calculators',
  security: 'security-tools',
  converters: 'converters',
  utilities: 'utility-tools',
};

export async function getRelatedBlogsForTool(tool, limit = 3) {
  try {
    await connectDB();
    const categorySlug = tool.category?.slug;
    const tags = BLOG_CATEGORY_MAP[categorySlug] || tool.keywords?.slice(0, 2) || [];
    if (!tags.length) return [];

    const blogs = await Blog.find(
      publishedBlogFilter({ $or: tags.map((tag) => ({ tags: { $regex: tag, $options: 'i' } })) })
    )
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
    const orConditions = [{ tags: { $in: blog.tags || [] } }];
    if (blog.category) orConditions.push({ category: blog.category });

    const blogs = await Blog.find(publishedBlogFilter({ slug: { $ne: blog.slug }, $or: orConditions }))
      .select('title slug excerpt featuredImage publishedAt')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return blogs;
  } catch {
    return [];
  }
}

export async function getRelatedToolsForBlog(blog, limit = 6, country) {
  try {
    await connectDB();
    const tags = (blog.tags || []).join(' ').toLowerCase();
    const countryFilter = visibilityMongoFilter(country);

    let categorySlug = blog.category ? BLOG_TO_TOOL_CATEGORY[blog.category] : null;
    if (!categorySlug) {
      for (const [slug, keywords] of Object.entries(BLOG_CATEGORY_MAP)) {
        if (keywords.some((k) => tags.includes(k))) {
          categorySlug = slug;
          break;
        }
      }
    }

    if (!categorySlug) {
      const tools = await Tool.find({ status: 'active', featured: true, ...countryFilter })
        .select('title slug icon shortDescription category')
        .populate('category', 'name slug visibility')
        .limit(limit * 2)
        .lean();
      return tools.filter((t) => canViewTool(t, t.category, country)).slice(0, limit);
    }

    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (!category || !canViewCategory(category, country)) return [];

    return Tool.find({ category: category._id, status: 'active', ...countryFilter })
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
