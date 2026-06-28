import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import RelatedBlogs from '@/components/seo/RelatedBlogs';
import RelatedTools from '@/components/tools/RelatedTools';
import OptimizedImage from '@/components/seo/OptimizedImage';
import BlogTopAd from '@/components/ads/BlogTopAd';
import BlogMiddleAd from '@/components/ads/BlogMiddleAd';
import SidebarAd from '@/components/ads/SidebarAd';
import { splitBlogContent } from '@/lib/ads/splitBlogContent';
import JsonLd, { buildBlogPostingSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import { generateBlogKeywords } from '@/lib/seo/keywords';
import { BLOG_KEYWORD_POOL, mergeKeywords } from '@/lib/seo/keywordStrategy';
import { calculateReadingTime } from '@/lib/seo/readingTime';
import { getRelatedBlogsForBlog, getRelatedToolsForBlog } from '@/lib/seo/internalLinks';
import { getRequestCountry } from '@/lib/geo';
import { isIndiaUser } from '@/lib/visibility';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ArticleHero from '@/components/blog/ArticleHero';
import ArticleWithToc from '@/components/blog/ArticleWithToc';
import AuthorCard from '@/components/blog/AuthorCard';
import ArticleNav from '@/components/blog/ArticleNav';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug, status: 'published' }).populate('author', 'name').lean();
    if (!blog) return {};
    const title = blog.seoTitle || `${blog.title} | ToolifHub`;
    const lowerTitle = blog.title.toLowerCase();
    const relevantPool = BLOG_KEYWORD_POOL.filter((kw) => {
      const k = kw.toLowerCase();
      if (k.includes('ai') && lowerTitle.includes('ai')) return true;
      if (k.includes('developer') && (lowerTitle.includes('develop') || lowerTitle.includes('code'))) return true;
      if (k === 'how to' && lowerTitle.startsWith('how to')) return true;
      if (k === 'tutorials' || k === 'tool guides') return true;
      return false;
    }).slice(0, 2);
    const keywords = mergeKeywords(
      relevantPool,
      generateBlogKeywords({ title: blog.title, tags: blog.tags || [] })
    );
    const publishedAt = blog.publishedAt || blog.createdAt;
    return buildPageMetadata({
      title,
      description: blog.seoDescription || blog.excerpt,
      path: `/blog/${slug}`,
      keywords,
      ogImage:
        blog.featuredImage ||
        `${buildCanonical('/api/og')}?title=${encodeURIComponent(blog.title)}&subtitle=${encodeURIComponent('ToolifHub Blog')}`,
      ogType: 'article',
      absoluteTitle: !!blog.seoTitle,
      articlePublishedTime: new Date(publishedAt).toISOString(),
      articleModifiedTime: new Date(blog.updatedAt || publishedAt).toISOString(),
      articleAuthor: blog.author?.name,
    });
  } catch {
    return {};
  }
}

// Cached per visibility bucket (IN vs everyone else — only two buckets
// exist, see lib/visibility.js) since getRelatedToolsForBlog is country-
// dependent. This removes the Mongo round trip from the critical path on
// cache hits. The view-increment write is kept out of this cached function
// (see the page component below) so it still fires every request.
const getCachedBlogData = unstable_cache(
  async (slug, bucket) => fetchBlogData(slug, bucket),
  ['blog-data'],
  { revalidate: 120, tags: ['blog'] }
);

async function fetchBlogData(slug, country) {
  await connectDB();
  const blog = await Blog.findOne({ slug, status: 'published' }).populate('author', 'name avatar').lean();
  if (!blog) return null;

  const publishedAt = blog.publishedAt || blog.createdAt;

  const [related, relatedTools, prev, next] = await Promise.all([
    getRelatedBlogsForBlog(blog),
    getRelatedToolsForBlog(blog, 6, country),
    Blog.findOne({ status: 'published', slug: { $ne: blog.slug }, publishedAt: { $lt: publishedAt } })
      .sort({ publishedAt: -1 })
      .select('title slug')
      .lean(),
    Blog.findOne({ status: 'published', slug: { $ne: blog.slug }, publishedAt: { $gt: publishedAt } })
      .sort({ publishedAt: 1 })
      .select('title slug')
      .lean(),
  ]);

  return { blog, related, relatedTools, prev, next };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const country = await getRequestCountry();
  const bucket = isIndiaUser(country) ? 'IN' : 'WORLD';
  const data = await getCachedBlogData(slug, bucket);
  if (!data) notFound();
  const { blog, related, relatedTools, prev, next } = data;

  await connectDB();
  Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

  const pageUrl = buildCanonical(`/blog/${slug}`);
  const authorName = blog.author?.name || 'ToolifHub Team';
  const publishedAt = blog.publishedAt || blog.createdAt;
  const readingTime = calculateReadingTime(blog.content);
  const { before: contentBefore, after: contentAfter } = splitBlogContent(blog.content);

  const schemas = [
    buildBreadcrumbSchema([
      { label: 'Blog', href: '/blog' },
      { label: blog.title, href: `/blog/${slug}` },
    ]),
    buildBlogPostingSchema({
      title: blog.title,
      description: blog.excerpt,
      url: pageUrl,
      image: blog.featuredImage,
      datePublished: new Date(publishedAt).toISOString(),
      dateModified: new Date(blog.updatedAt || publishedAt).toISOString(),
      authorName,
      tags: blog.tags || [],
      wordCount: readingTime.wordCount,
    }),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <ReadingProgress />

      <ArticleHero
        blog={blog}
        authorName={authorName}
        publishedAt={publishedAt}
        readingMinutes={readingTime.minutes}
        pageUrl={pageUrl}
      />

      {blog.featuredImage && (
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 -mt-2 lg:-mt-4">
          <div className="relative aspect-[16/8] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-muted shadow-lg">
            <OptimizedImage
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 960px) 100vw, 960px"
            />
          </div>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 lg:mt-14 pb-20">
        <article>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_16rem] gap-12">
            <div className="max-w-[820px] w-full mx-auto xl:mx-0">
              <BlogTopAd />
            </div>
            <aside className="hidden xl:block">
              <SidebarAd />
            </aside>
          </div>

          <ArticleWithToc
            beforeHtml={contentBefore}
            afterHtml={contentAfter}
            midContent={contentAfter ? <BlogMiddleAd /> : null}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_16rem] gap-12">
            <div className="max-w-[820px] w-full mx-auto xl:mx-0">
              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-10">
                <AuthorCard name={authorName} avatar={blog.author?.avatar} />
              </div>
            </div>
            <div className="hidden xl:block" />
          </div>
        </article>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_16rem] gap-12 mt-12">
          <div className="max-w-[820px] w-full mx-auto xl:mx-0 space-y-16">
            {relatedTools.length > 0 && <RelatedTools tools={relatedTools} />}
            {related.length > 0 && <RelatedBlogs blogs={related} />}

            <ArticleNav prev={prev} next={next} />
          </div>
          <div className="hidden xl:block" />
        </div>
      </div>
    </>
  );
}
