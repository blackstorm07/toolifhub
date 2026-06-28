import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import JsonLd, { buildWebPageSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { publishedBlogFilter } from '@/lib/seo/blogVisibility';
import BlogCard from '@/components/blog/BlogCard';
import BlogPagination from '@/components/blog/BlogPagination';
import { FileText, Hash } from 'lucide-react';

const PAGE_SIZE = 9;

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  return buildPageMetadata({
    title: `#${name} — ToolifHub Blog`,
    description: `Browse all ToolifHub blog articles tagged "${name}".`,
    path: `/blog/tag/${tag}`,
    keywords: [
      name, `${name} articles`, `${name} blog posts`, `${name} guide`, `${name} tutorial`,
      `${name} tips`, `toolifhub ${name}`, 'ToolifHub',
    ],
  });
}

async function getTagPosts(tag, page) {
  await connectDB();
  const filter = publishedBlogFilter({ tags: tag });
  const [total, posts] = await Promise.all([
    Blog.countDocuments(filter),
    Blog.find(filter)
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return { posts, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export default async function BlogTagPage({ params, searchParams }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const { posts, totalPages } = await getTagPosts(tag, page);
  if (page === 1 && posts.length === 0) notFound();
  const pageUrl = buildCanonical(`/blog/tag/${rawTag}`);

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            name: `#${tag} — ToolifHub Blog`,
            description: `Browse all ToolifHub blog articles tagged "${tag}".`,
            url: pageUrl,
          }),
          buildBreadcrumbSchema([
            { label: 'Blog', href: '/blog' },
            { label: `#${tag}`, href: `/blog/tag/${rawTag}` },
          ]),
        ]}
      />
      <div className="page">
        <div className="mb-6">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2">
            <Hash className="w-4 h-4" aria-hidden="true" /> Tag
          </p>
          <h1 className="text-4xl font-bold">#{tag}</h1>
          <p className="text-muted-foreground mt-3 text-lg">Articles tagged &ldquo;{tag}&rdquo; on the ToolifHub blog.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-4" aria-hidden="true" />
            <p className="font-medium text-lg">No articles with this tag</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
            <BlogPagination currentPage={page} totalPages={totalPages} basePath={`/blog/tag/${rawTag}`} />
          </>
        )}
      </div>
    </>
  );
}
