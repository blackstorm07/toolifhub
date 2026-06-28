// Single source of truth for "is this blog post publicly visible right now".
// A 'scheduled' post becomes visible automatically once its publishedAt
// passes — there's no cron job; visibility is computed at query time, so
// every public-facing query (listing, detail, sitemap, RSS, search,
// category/tag pages, internal links) must use this filter instead of a
// bare `{ status: 'published' }` or scheduled posts would never appear.
export function publishedBlogFilter(extra = {}) {
  return {
    $and: [
      {
        $or: [
          { status: 'published' },
          { status: 'scheduled', publishedAt: { $lte: new Date() } },
        ],
      },
      extra,
    ],
  };
}
