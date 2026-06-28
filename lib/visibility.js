// Country-based visibility for Categories and Tools.
//
// To add a new country-restricted visibility (e.g. "us_only"), just add an
// entry to VISIBILITY_COUNTRY_MAP and VISIBILITY_OPTIONS below — every
// helper, Mongo filter, admin form, and analytics call in this file and its
// callers picks it up automatically with no other code changes.

export const VISIBILITY_COUNTRY_MAP = {
  worldwide: null, // null = no restriction, visible to every country
  india_only: ['IN'],
};

// Drives the admin radio-group UI (label + help text) for both Category and
// Tool forms.
export const VISIBILITY_OPTIONS = [
  {
    value: 'worldwide',
    label: 'Worldwide',
    help: 'Visible to everyone, regardless of location.',
  },
  {
    value: 'india_only',
    label: 'India Only',
    helpCategory: 'India Only categories will only be visible to users located in India.',
    helpTool: 'India Only tools will only be visible to users located in India.',
  },
];

export const VISIBILITY_VALUES = Object.keys(VISIBILITY_COUNTRY_MAP);
export const DEFAULT_VISIBILITY = 'worldwide';

export function isIndiaUser(country) {
  return country === 'IN';
}

/** Is `visibility` allowed to be seen by a visitor from `country`? */
export function isVisibleToCountry(visibility, country) {
  const allowedCountries = VISIBILITY_COUNTRY_MAP[visibility];
  if (!allowedCountries) return true; // worldwide, or an unrecognized value — default open
  return allowedCountries.includes(country);
}

/**
 * Can this visitor see the category at all?
 * `category` only needs a `visibility` field.
 */
export function canViewCategory(category, country) {
  if (!category) return false;
  return isVisibleToCountry(category.visibility || DEFAULT_VISIBILITY, country);
}

/**
 * Can this visitor see this tool?
 * Rule 1: category visibility overrides tool visibility — an India Only
 * category hides every tool inside it, regardless of the tool's own setting.
 * Rule 2: if the category is worldwide, fall back to the tool's own
 * visibility.
 */
export function canViewTool(tool, category, country) {
  if (!tool) return false;
  const resolvedCategory = category || tool.category;
  if (resolvedCategory && !canViewCategory(resolvedCategory, country)) return false;
  return isVisibleToCountry(tool.visibility || DEFAULT_VISIBILITY, country);
}

/** Visibility values that are NOT allowed for `country`, e.g. ['india_only'] for a US visitor. */
export function blockedVisibilitiesForCountry(country) {
  return Object.entries(VISIBILITY_COUNTRY_MAP)
    .filter(([, allowedCountries]) => allowedCountries && !allowedCountries.includes(country))
    .map(([visibility]) => visibility);
}

/**
 * Mongo $match fragment that excludes documents whose `visibility` is not
 * allowed for `country`. Spread this into any Category/Tool query's filter.
 * Returns `{}` (no-op) when nothing needs to be excluded for this country.
 */
export function visibilityMongoFilter(country) {
  const blocked = blockedVisibilitiesForCountry(country);
  if (!blocked.length) return {};
  return { visibility: { $nin: blocked } };
}

/** Mongo $match fragment for sitemap generation — sitemaps serve a single,
 * unpersonalized response, so only fully worldwide content belongs in them. */
export function worldwideOnlyMongoFilter() {
  return { visibility: DEFAULT_VISIBILITY };
}
