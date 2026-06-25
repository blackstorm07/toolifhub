import Category from '@/models/Category';
import Tool from '@/models/Tool';
import { visibilityMongoFilter, canViewCategory } from '@/lib/visibility';

// Single source of truth for "which categories should the public see".
// A category is shown only if it is all of:
//   1. manually visible (Category.visible !== false),
//   2. allowed for the visitor's country (Category.visibility), AND
//   3. has at least one tool that is both status: 'active' AND allowed for
//      the visitor's country (computed live — never cached or hardcoded),
//      so a category that drops to 0 visible tools disappears automatically.
//
// All public-facing surfaces (homepage, /categories, category detail pages,
// search suggestions, sitemap) should go through this helper rather than
// querying Category/Tool directly, so the rule stays consistent everywhere.

/**
 * @param {Object} options
 * @param {boolean} [options.featuredOnly] - only return categories with featured: true
 * @param {number} [options.limit]
 * @param {Object} [options.extraMatch] - additional Category query filters (e.g. name regex for search)
 * @param {string} [options.country] - visitor's country code; omit to skip country filtering (e.g. sitemap)
 * @returns {Promise<Array>} categories with an accurate `toolCount` field, count > 0 only
 */
export async function getVisibleCategoriesWithCounts({ featuredOnly = false, limit, extraMatch, country } = {}) {
  const countryFilter = country ? visibilityMongoFilter(country) : {};
  const match = { visible: { $ne: false }, ...countryFilter, ...extraMatch };
  if (featuredOnly) match.featured = true;

  const pipeline = [
    { $match: match },
    { $sort: { order: 1, name: 1 } },
    {
      $lookup: {
        from: 'tools',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ['$category', '$$categoryId'] }, { $eq: ['$status', 'active'] }] },
              ...countryFilter,
            },
          },
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
 * Checks whether a single category (by slug) is publicly visible to a given
 * country — i.e. visible !== false, allowed for that country, and has at
 * least one visible active tool. Used to gate category detail pages so a
 * hidden/empty/geo-restricted category 404s instead of rendering blank.
 */
export async function getPublicCategoryWithCount(slug, country) {
  const status = await getCategoryVisibilityStatus(slug, country);
  return status.status === 'ok' ? status.category : null;
}

/**
 * Like getPublicCategoryWithCount, but distinguishes *why* a category isn't
 * shown — `not-found` (doesn't exist / admin-hidden / no visible tools) vs
 * `geo-blocked` (exists and has tools, but this visitor's country can't see
 * it). Category pages use this to show a friendly "not available in your
 * region" message instead of a bare 404 for the geo-blocked case.
 */
export async function getCategoryVisibilityStatus(slug, country) {
  const category = await Category.findOne({ slug, visible: { $ne: false } }).lean();
  if (!category) return { status: 'not-found' };

  if (!canViewCategory(category, country)) {
    return { status: 'geo-blocked', category };
  }

  const countryFilter = country ? visibilityMongoFilter(country) : {};
  const toolCount = await Tool.countDocuments({ category: category._id, status: 'active', ...countryFilter });
  if (toolCount === 0) return { status: 'not-found' };

  return { status: 'ok', category: { ...category, toolCount } };
}

/**
 * Slugs of all categories that should be publicly reachable — used by
 * generateStaticParams and the sitemap so hidden/empty categories are never
 * pre-rendered or listed. No country is passed here on purpose: this is for
 * route enumeration, not per-visitor personalization (the page itself
 * re-checks visibility per request via getPublicCategoryWithCount).
 */
export async function getVisibleCategorySlugs() {
  const categories = await getVisibleCategoriesWithCounts();
  return categories.map((c) => c.slug);
}
