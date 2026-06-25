import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import RelatedBlogs from '@/components/seo/RelatedBlogs';
import RelatedTools from '@/components/tools/RelatedTools';
import OptimizedImage from '@/components/seo/OptimizedImage';
import InContentAd from '@/components/ads/InContentAd';
import JsonLd, { buildArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata, buildCanonical } from '@/lib/seo/metadata';
import { calculateReadingTime } from '@/lib/seo/readingTime';
import { getRelatedBlogsForBlog, getRelatedToolsForBlog } from '@/lib/seo/internalLinks';
import { getRequestCountry } from '@/lib/geo';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ArticleHero from '@/components/blog/ArticleHero';
import ArticleWithToc from '@/components/blog/ArticleWithToc';
import AuthorCard from '@/components/blog/AuthorCard';
import ArticleNav from '@/components/blog/ArticleNav';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug, status: 'published' }).lean();
    if (!blog) return {};
    const title = blog.seoTitle || `${blog.title} | ToolifHub`;
    return buildPageMetadata({
      title,
      description: blog.seoDescription || blog.excerpt,
      path: `/blog/${slug}`,
      keywords: blog.tags,
      ogImage: blog.featuredImage || undefined,
      ogType: 'article',
      absoluteTitle: !!blog.seoTitle,
    });
  } catch {
    return {};
  }
}

async function getData(slug, country) {
  await connectDB();
  const blog = await Blog.findOne({ slug, status: 'published' }).populate('author', 'name avatar').lean();
  if (!blog) return null;
  Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

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
  const data = await getData(slug, country);
  if (!data) notFound();
  const { blog, related, relatedTools, prev, next } = data;

  const pageUrl = buildCanonical(`/blog/${slug}`);
  const authorName = blog.author?.name || 'ToolifHub Team';
  const publishedAt = blog.publishedAt || blog.createdAt;
  const readingTime = calculateReadingTime(blog.content);

  const schemas = [
    buildBreadcrumbSchema([
      { label: 'Blog', href: '/blog' },
      { label: blog.title, href: `/blog/${slug}` },
    ]),
    buildArticleSchema({
      title: blog.title,
      description: blog.excerpt,
      url: pageUrl,
      image: blog.featuredImage,
      datePublished: new Date(publishedAt).toISOString(),
      dateModified: new Date(blog.updatedAt || publishedAt).toISOString(),
      authorName,
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
              <InContentAd />
            </div>
            <div className="hidden xl:block" />
          </div>

          <ArticleWithToc html={blog.content} />

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
