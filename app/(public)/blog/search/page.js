import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';
import BlogCard from '@/components/blog/BlogCard';
import BlogSearchForm from '@/components/blog/BlogSearchForm';
import BlogPagination from '@/components/blog/BlogPagination';
import { Search } from 'lucide-react';

const PAGE_SIZE = 9;

// Internal search-results pages are intentionally noindex — Google's own
// guidance is that on-site search results are thin/duplicate content and
// shouldn't be submitted for indexing; the real articles they link to are
// indexed normally via /blog, /blog/category/*, and /blog/tag/*.
export const metadata = buildPageMetadata({
  title: 'Search Results — ToolifHub Blog',
  description: 'Search the ToolifHub blog for articles, guides, and tutorials.',
  path: '/blog/search',
  noIndex: true,
});

async function searchBlogs(q, page) {
  if (!q || q.trim().length < 2) return { posts: [], totalPages: 1 };
  try {
    await connectDB();
    const filter = publishedBlogFilter({ $text: { $search: q } });
    const [total, posts] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter, { score: { $meta: 'textScore' } })
        .select('-content')
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
    ]);
    return { posts, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
  } catch {
    return { posts: [], totalPages: 1 };
  }
}

export default async function BlogSearchPage({ searchParams }) {
  const { q = '', page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const { posts, totalPages } = await searchBlogs(q, page);
  const basePath = `/blog/search?q=${encodeURIComponent(q)}`;

  return (
    <div className="page">
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">Search</p>
        <h1 className="text-4xl font-bold">Blog Search</h1>
      </div>

      <BlogSearchForm defaultValue={q} />

      {q.trim().length < 2 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-4 opacity-30" aria-hidden="true" />
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium text-lg">No results for &ldquo;{q}&rdquo;</p>
          <p className="text-sm mt-2">Try a different search term.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">Results for &ldquo;{q}&rdquo;</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
          </div>
          <BlogPagination currentPage={page} totalPages={totalPages} basePath={basePath} />
        </>
      )}
    </div>
  );
}
