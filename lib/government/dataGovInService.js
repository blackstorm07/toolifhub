/**
 * Server-side integration with data.gov.in AGMARKNET mandi price API.
 * Dataset: Current Daily Price of Various Commodities from Various Markets (Mandi)
 */

const DEFAULT_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource';
const PAGE_SIZE = 1000;
const FETCH_TIMEOUT_MS = 15000;
const CACHE_TTL = {
  commodities: 6 * 60 * 60 * 1000,
  states: 6 * 60 * 60 * 1000,
  markets: 60 * 60 * 1000,
  filterOptions: 30 * 60 * 1000,
};

/** @type {Map<string, { expires: number, value: unknown }>} */
const cache = new Map();

/** @type {Map<string, Promise<unknown>>} */
const inflight = new Map();

export class DataGovInError extends Error {
  /** @param {string} message @param {number} [status] @param {string} [code] */
  constructor(message, status = 502, code = 'UPSTREAM_ERROR') {
    super(message);
    this.name = 'DataGovInError';
    this.status = status;
    this.code = code;
  }
}

export function getDataGovInConfig() {
  const apiKey = process.env.DATA_GOV_IN_API_KEY?.trim();
  const resourceId = process.env.DATA_GOV_IN_RESOURCE_ID?.trim() || DEFAULT_RESOURCE_ID;
  return { apiKey, resourceId, configured: Boolean(apiKey) };
}

export function assertDataGovInConfigured() {
  const { configured } = getDataGovInConfig();
  if (!configured) {
    throw new DataGovInError('Data.gov.in API key is not configured.', 503, 'NOT_CONFIGURED');
  }
}

/**
 * @template T
 * @param {string} key
 * @param {number} ttlMs
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return /** @type {T} */ (hit.value);

  let pending = inflight.get(key);
  if (!pending) {
    pending = fn().then((value) => {
      cache.set(key, { value, expires: Date.now() + ttlMs });
      inflight.delete(key);
      return value;
    }).catch((err) => {
      inflight.delete(key);
      throw err;
    });
    inflight.set(key, pending);
  }
  return /** @type {Promise<T>} */ (pending);
}

/**
 * @param {import('./mandiTypes').DataGovInFilters} filters
 * @returns {Record<string, string>}
 */
function buildFilterParams(filters = {}) {
  const params = {};
  if (filters.state) params['filters[state.keyword]'] = filters.state;
  if (filters.district) params['filters[district]'] = filters.district;
  if (filters.market) params['filters[market]'] = filters.market;
  if (filters.commodity) params['filters[commodity]'] = filters.commodity;
  if (filters.variety) params['filters[variety]'] = filters.variety;
  if (filters.grade) params['filters[grade]'] = filters.grade;
  return params;
}

/**
 * @param {import('./mandiTypes').MandiFetchOptions} [options]
 */
export async function fetchMandiResource({ filters = {}, offset = 0, limit = PAGE_SIZE } = {}) {
  assertDataGovInConfigured();
  const { apiKey, resourceId } = getDataGovInConfig();

  const url = new URL(`${BASE_URL}/${resourceId}`);
  url.searchParams.set('api-key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('limit', String(limit));
  for (const [key, value] of Object.entries(buildFilterParams(filters))) {
    url.searchParams.set(key, value);
  }

  const upstream = await fetch(url.toString(), {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: 3600 },
  });

  if (upstream.status === 429) {
    throw new DataGovInError(
      'Data.gov.in rate limit reached. Please wait a moment and try again.',
      429,
      'RATE_LIMIT'
    );
  }

  if (!upstream.ok) {
    throw new DataGovInError('Mandi price service is unavailable right now.', 502, 'UPSTREAM_HTTP');
  }

  const json = await upstream.json();
  if (json.error) {
    throw new DataGovInError(json.error, 502, 'UPSTREAM_API');
  }

  return {
    records: json.records || [],
    total: typeof json.total === 'number' ? json.total : (json.records || []).length,
  };
}

/**
 * @param {import('./mandiTypes').DataGovInFilters} [filters]
 */
async function fetchAllMandiRecords(filters = {}) {
  const all = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const page = await fetchMandiResource({ filters, offset, limit: PAGE_SIZE });
    all.push(...page.records);
    total = page.total;
    if (!page.records.length) break;
    offset += page.records.length;
    if (page.records.length < PAGE_SIZE) break;
  }

  return all;
}

/**
 * @param {Record<string, unknown>} record
 * @returns {import('./mandiTypes').MandiPriceRecord}
 */
export function normalizeMandiRecord(record) {
  return {
    commodity: String(record.commodity || ''),
    state: String(record.state || ''),
    district: String(record.district || ''),
    market: String(record.market || ''),
    variety: record.variety ? String(record.variety) : null,
    grade: record.grade ? String(record.grade) : null,
    arrivalDate: String(record.arrival_date || ''),
    minPrice: record.min_price ?? '',
    maxPrice: record.max_price ?? '',
    modalPrice: record.modal_price ?? '',
  };
}

/** @returns {Promise<import('./mandiTypes').MandiSelectOption[]>} */
export async function getUniqueCommodities() {
  return cached('mandi:commodities', CACHE_TTL.commodities, async () => {
    const records = await fetchAllMandiRecords();
    const unique = [...new Set(records.map((r) => r.commodity).filter(Boolean))];
    return unique.sort((a, b) => a.localeCompare(b)).map((name) => ({ value: name, label: name }));
  });
}

/** @returns {Promise<import('./mandiTypes').MandiSelectOption[]>} */
export async function getUniqueStates() {
  return cached('mandi:states', CACHE_TTL.states, async () => {
    const records = await fetchAllMandiRecords();
    const unique = [...new Set(records.map((r) => r.state).filter(Boolean))];
    return unique.sort((a, b) => a.localeCompare(b)).map((name) => ({ value: name, label: name }));
  });
}

/**
 * @param {string} state
 * @param {{ commodity?: string }} [options]
 * @returns {Promise<{ markets: import('./mandiTypes').MandiMarketOption[], districts: import('./mandiTypes').MandiSelectOption[] }>}
 */
export async function getMarketsForState(state, { commodity } = {}) {
  const cacheKey = `mandi:markets:${state}:${commodity || ''}`;
  return cached(cacheKey, CACHE_TTL.markets, async () => {
    const filters = { state };
    if (commodity) filters.commodity = commodity;
    const records = await fetchAllMandiRecords(filters);

    /** @type {Map<string, import('./mandiTypes').MandiMarketOption>} */
    const marketsMap = new Map();
    /** @type {Set<string>} */
    const districtsSet = new Set();

    for (const r of records) {
      if (!r.market) continue;
      const district = r.district ? String(r.district) : '';
      if (district) districtsSet.add(district);
      const key = `${r.market}::${district}`;
      if (!marketsMap.has(key)) {
        marketsMap.set(key, {
          value: key,
          market: String(r.market),
          district: district || undefined,
          label: district ? `${r.market} (${district})` : String(r.market),
        });
      }
    }

    const markets = Array.from(marketsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    const districts = Array.from(districtsSet).sort((a, b) => a.localeCompare(b))
      .map((d) => ({ value: d, label: d }));

    return { markets, districts };
  });
}

/**
 * @param {string} compositeValue
 */
export function parseMarketValue(compositeValue) {
  const [market, district = ''] = compositeValue.split('::');
  return { market, district };
}

/**
 * @param {string} state
 * @param {string} marketComposite
 */
export async function validateMarketForState(state, marketComposite) {
  const { market, district } = parseMarketValue(marketComposite);
  const { markets } = await getMarketsForState(state);
  const valid = markets.some((m) => m.value === marketComposite);
  if (!valid) {
    throw new DataGovInError('Selected market does not belong to the chosen state.', 400, 'INVALID_MARKET');
  }
  return { market, district };
}

/**
 * @param {{ state: string, commodity: string, market: string, district?: string }} params
 */
export async function getFilterOptions({ state, commodity, market, district }) {
  const cacheKey = `mandi:opts:${state}:${commodity}:${market}:${district || ''}`;
  return cached(cacheKey, CACHE_TTL.filterOptions, async () => {
    const filters = { state, commodity, market };
    if (district) filters.district = district;
    const records = await fetchAllMandiRecords(filters);

    const varieties = [...new Set(records.map((r) => r.variety).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));

    const grades = [...new Set(records.map((r) => r.grade).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .map((g) => ({ value: g, label: g }));

    return { varieties, grades };
  });
}

/**
 * @param {{ commodity: string, state: string, market: string, district?: string, variety?: string, grade?: string }} params
 */
export async function getMandiPrices({ commodity, state, market, district, variety, grade }) {
  await validateMarketForState(state, market);
  const { market: marketName, district: marketDistrict } = parseMarketValue(market);
  const resolvedDistrict = district || marketDistrict;

  const filters = {
    state,
    commodity,
    market: marketName,
  };
  if (resolvedDistrict) filters.district = resolvedDistrict;
  if (variety) filters.variety = variety;
  if (grade) filters.grade = grade;

  const records = await fetchAllMandiRecords(filters);
  const data = records
    .map(normalizeMandiRecord)
    .sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));

  return {
    data,
    lastUpdated: data[0]?.arrivalDate || null,
  };
}

/**
 * @param {unknown} err
 */
export function toMandiErrorResponse(err) {
  if (err instanceof DataGovInError) {
    return { message: err.message, status: err.status, code: err.code };
  }
  if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
    return { message: 'Request timed out. Please try again.', status: 504, code: 'TIMEOUT' };
  }
  return { message: 'Failed to fetch mandi price data.', status: 502, code: 'UNKNOWN' };
}
