/**
 * @typedef {Object} MandiSelectOption
 * @property {string} value
 * @property {string} label
 */

/**
 * @typedef {Object} MandiMarketOption
 * @property {string} value - Composite key `market::district`
 * @property {string} label
 * @property {string} market
 * @property {string} [district]
 */

/**
 * @typedef {Object} MandiPriceRecord
 * @property {string} commodity
 * @property {string} state
 * @property {string} district
 * @property {string} market
 * @property {string|null} variety
 * @property {string|null} grade
 * @property {string} arrivalDate
 * @property {number|string} minPrice
 * @property {number|string} maxPrice
 * @property {number|string} modalPrice
 */

/**
 * @typedef {Object} DataGovInFilters
 * @property {string} [state]
 * @property {string} [district]
 * @property {string} [market]
 * @property {string} [commodity]
 * @property {string} [variety]
 * @property {string} [grade]
 */

/**
 * @typedef {Object} MandiFetchOptions
 * @property {DataGovInFilters} [filters]
 * @property {number} [offset]
 * @property {number} [limit]
 */

export {};
