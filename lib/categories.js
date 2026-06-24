import Category from '@/models/Category';
import Tool from '@/models/Tool';

// Single source of truth for "which categories should the public see".
// A category is shown only if it is both:
//   1. manually visible (Category.visible !== false), AND
//   2. has at least one tool with status: 'active' (computed live — never
//      cached or hardcoded), so a category that drops to 0 active tools
//      disappears automatically without any code change.
//
// All public-facing surfaces (homepage, /categories, category detail pages,
// search suggestions) should go through this helper rather than querying
// Category/Tool directly, so the rule stays consistent everywhere.

/**
 * @param {Object} options
 * @param {boolean} [options.featuredOnly] - only return categories with featured: true
 * @param {number} [options.limit]
 * @param {Object} [options.extraMatch] - additional Category query filters (e.g. name regex for search)
 * @returns {Promise<Array>} categories with an accurate `toolCount` field, count > 0 only
 */
export async function getVisibleCategoriesWithCounts({ featuredOnly = false, limit, extraMatch } = {}) {
  const match = { visible: { $ne: false }, ...extraMatch };
  if (featuredOnly) match.featured = true;

  const pipeline = [
    { $match: match },
    { $sort: { order: 1, name: 1 } },
    {
      $lookup: {
        from: 'tools',
        let: { categoryId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$category', '$$categoryId'] }, { $eq: ['$status', 'active'] }] } } },
          { $count: 'count' },
        ],
        as: 'toolCountResult',
      },
    },
    {
      $addFields: {
        toolCount: { $ifNull: [{ $arrayElemAt: ['$toolCountResult.count', 0] }, 0] },
      },
    },
    { $match: { toolCount: { $gt: 0 } } },
    { $project: { toolCountResult: 0 } },
  ];

  if (limit) pipeline.push({ $limit: limit });

  const categories = await Category.aggregate(pipeline);
  return categories;
}

/**
 * Checks whether a single category (by slug) is publicly visible — i.e.
 * visible !== false AND has at least one active tool. Used to gate category
 * detail pages so an empty/hidden category 404s instead of rendering blank.
 */
export async function getPublicCategoryWithCount(slug) {
  const category = await Category.findOne({ slug, visible: { $ne: false } }).lean();
  if (!category) return null;

  const toolCount = await Tool.countDocuments({ category: category._id, status: 'active' });
  if (toolCount === 0) return null;

  return { ...category, toolCount };
}

/**
 * Slugs of all categories that should be publicly reachable — used by
 * generateStaticParams and the sitemap so empty/hidden categories are never
 * pre-rendered or listed.
 */
export async function getVisibleCategorySlugs() {
  const categories = await getVisibleCategoriesWithCounts();
  return categories.map((c) => c.slug);
}
