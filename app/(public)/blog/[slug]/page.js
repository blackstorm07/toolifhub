import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Breadcrumb from '@/components/tools/Breadcrumb';
import { getTimeAgo, generateSeoTitle } from '@/lib/utils';
import InContentAd from '@/components/ads/InContentAd';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug, status: 'published' }).lean();
    if (!blog) return {};
    // seoTitle already includes "| ToolifHub" — use `absolute` so the root
    // layout's title template doesn't append it a second time.
    return {
      title: { absolute: blog.seoTitle || generateSeoTitle(blog.title) },
      description: blog.seoDescription || blog.excerpt,
      openGraph: { title: blog.title, description: blog.excerpt, images: blog.featuredImage ? [blog.featuredImage] : [] },
    };
  } catch {
    return {};
  }
}

async function getData(slug) {
  await connectDB();
  const blog = await Blog.findOne({ slug, status: 'published' }).lean();
  if (!blog) return null;
  Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();
  const related = await Blog.find({ slug: { $ne: slug }, status: 'published', tags: { $in: blog.tags || [] } })
    .select('-content').limit(3).lean();
  return { blog, related };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  const { blog, related } = data;

  return (
    <div className="container py-12 lg:py-16 max-w-4xl">
      <Breadcrumb items={[{ label: 'Blog', href: '/blog' }, { label: blog.title }]} />

      <article className="mt-8">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags?.map((tag) => (
              <span key={tag} className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{blog.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {getTimeAgo(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
        </div>

        {blog.featuredImage && (
          <div className="aspect-video mb-8 rounded-2xl overflow-hidden bg-muted">
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <InContentAd />

        <div
          className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-500"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r._id} href={`/blog/${r.slug}`} className="group p-4 border border-border rounded-xl hover:border-brand-300 hover:shadow-md transition-all">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">{r.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    </div>
  );
}
