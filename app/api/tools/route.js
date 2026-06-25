import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import Category from '@/models/Category';
import { getCountryFromHeaders } from '@/lib/geo';
import { visibilityMongoFilter, blockedVisibilitiesForCountry } from '@/lib/visibility';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const recent = searchParams.get('recent');
    const status = searchParams.get('status') || 'active';

    const country = getCountryFromHeaders(request.headers);
    const countryFilter = visibilityMongoFilter(country);

    const query = { status, ...countryFilter };
    if (featured === 'true') query.featured = true;
    if (trending === 'true') query.trending = true;

    // Category visibility overrides tool visibility — exclude tools whose
    // category is blocked for this country, even if the tool itself is
    // worldwide. Resolved as a Mongo-level category id exclusion (rather
    // than post-fetch JS filtering) so pagination/count stay accurate.
    const blockedVisibilities = blockedVisibilitiesForCountry(country);
    let blockedCategoryIds = [];
    if (blockedVisibilities.length) {
      const blockedCategories = await Category.find({ visibility: { $in: blockedVisibilities } })
        .select('_id')
        .lean();
      blockedCategoryIds = blockedCategories.map((c) => String(c._id));
    }

    if (category) {
      // An explicit category was requested — if it's blocked for this
      // country, return an empty result instead of leaking its tools.
      query.category = blockedCategoryIds.includes(category) ? null : category;
    } else if (blockedCategoryIds.length) {
      query.category = { $nin: blockedCategoryIds };
    }

    let sortOption = { createdAt: -1 };
    if (trending === 'true') sortOption = { views: -1 };
    if (featured === 'true') sortOption = { views: -1 };

    const skip = (page - 1) * limit;

    const [tools, total] = await Promise.all([
      Tool.find(query)
        .populate('category', 'name slug icon')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Tool.countDocuments(query),
    ]);

    return NextResponse.json({
      tools,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/tools error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
