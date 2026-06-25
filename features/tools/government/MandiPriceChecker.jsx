'use client';
import { useState, useEffect, useCallback, useId, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sprout, AlertCircle, PackageSearch, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';
import SearchableSelect from '@/components/ui/SearchableSelect';

function SelectSkeleton() {
  return <div className="h-11 w-full rounded-xl border border-border bg-muted/40 animate-pulse" />;
}

function ResultsSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading mandi prices">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 rounded-xl border border-border bg-muted/30 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <PackageSearch className="w-8 h-8 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{message}</p>
    </div>
  );
}

function Field({ id, label, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-2">
        {label}
        {optional && <span className="text-muted-foreground/60 font-normal"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

export default function MandiPriceChecker() {
  return (
    <Suspense fallback={<SelectSkeleton />}>
      <MandiPriceCheckerInner />
    </Suspense>
  );
}

function MandiPriceCheckerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = {
    commodity: useId(),
    state: useId(),
    market: useId(),
    district: useId(),
    variety: useId(),
    grade: useId(),
  };

  const [commodity, setCommodity] = useState(searchParams.get('commodity') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [market, setMarket] = useState(searchParams.get('market') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [variety, setVariety] = useState(searchParams.get('variety') || '');
  const [grade, setGrade] = useState(searchParams.get('grade') || '');

  const [commodities, setCommodities] = useState([]);
  const [states, setStates] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [grades, setGrades] = useState([]);

  const [commoditiesLoading, setCommoditiesLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(true);
  const [marketsLoading, setMarketsLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [configError, setConfigError] = useState('');
  const [marketsError, setMarketsError] = useState('');
  const [priceError, setPriceError] = useState('');

  const [results, setResults] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const syncUrl = useCallback((next) => {
    const params = new URLSearchParams();
    if (next.commodity) params.set('commodity', next.commodity);
    if (next.state) params.set('state', next.state);
    if (next.market) params.set('market', next.market);
    if (next.district) params.set('district', next.district);
    if (next.variety) params.set('variety', next.variety);
    if (next.grade) params.set('grade', next.grade);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    setCommoditiesLoading(true);
    fetch('/api/mandi/commodities')
      .then(async (res) => {
        const json = await res.json();
        if (res.status === 503) throw new Error(json.error || 'Data.gov.in API key is not configured.');
        if (!res.ok) throw new Error(json.error || 'Failed to load commodities');
        return json.data || [];
      })
      .then((data) => { if (!cancelled) setCommodities(data); })
      .catch((err) => { if (!cancelled) setConfigError(err.message); })
      .finally(() => { if (!cancelled) setCommoditiesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatesLoading(true);
    fetch('/api/mandi/states')
      .then(async (res) => {
        const json = await res.json();
        if (res.status === 503) throw new Error(json.error || 'Data.gov.in API key is not configured.');
        if (!res.ok) throw new Error(json.error || 'Failed to load states');
        return json.data || [];
      })
      .then((data) => { if (!cancelled) setStates(data); })
      .catch((err) => {
        if (!cancelled) {
          setConfigError(err.message);
          setStates([]);
        }
      })
      .finally(() => { if (!cancelled) setStatesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!state) {
      setMarkets([]);
      setDistricts([]);
      return undefined;
    }

    let cancelled = false;
    setMarketsLoading(true);
    setMarketsError('');
    const params = new URLSearchParams({ state });
    if (commodity) params.set('commodity', commodity);

    fetch(`/api/mandi/markets?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load markets');
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setMarkets(json.data || []);
        setDistricts(json.districts || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setMarkets([]);
        setDistricts([]);
        setMarketsError(err.message);
      })
      .finally(() => { if (!cancelled) setMarketsLoading(false); });

    return () => { cancelled = true; };
  }, [state, commodity]);

  useEffect(() => {
    if (!commodity || !state || !market) {
      setVarieties([]);
      setGrades([]);
      return undefined;
    }

    let cancelled = false;
    setOptionsLoading(true);
    const params = new URLSearchParams({ commodity, state, market });
    if (district) params.set('district', district);

    fetch(`/api/mandi/filter-options?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load filter options');
        return json.data || { varieties: [], grades: [] };
      })
      .then((opts) => {
        if (cancelled) return;
        setVarieties(opts.varieties || []);
        setGrades(opts.grades || []);
        if (variety && !(opts.varieties || []).some((v) => v.value === variety)) setVariety('');
        if (grade && !(opts.grades || []).some((g) => g.value === grade)) setGrade('');
      })
      .catch(() => {
        if (!cancelled) {
          setVarieties([]);
          setGrades([]);
        }
      })
      .finally(() => { if (!cancelled) setOptionsLoading(false); });

    return () => { cancelled = true; };
  }, [commodity, state, market, district, variety, grade]);

  const fetchPrices = useCallback(() => {
    if (!commodity || !state || !market) return undefined;

    let cancelled = false;
    setPriceLoading(true);
    setPriceError('');
    trackToolUsage('mandi-price-checker', 'Mandi Price Checker');

    const params = new URLSearchParams({ commodity, state, market });
    if (district) params.set('district', district);
    if (variety) params.set('variety', variety);
    if (grade) params.set('grade', grade);

    fetch(`/api/mandi/prices?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch prices');
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setResults(json.data || []);
        setLastUpdated(json.lastUpdated || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setResults(null);
        setPriceError(err.message);
        toast.error(err.message);
      })
      .finally(() => { if (!cancelled) setPriceLoading(false); });

    return () => { cancelled = true; };
  }, [commodity, state, market, district, variety, grade]);

  useEffect(() => {
    if (!commodity || !state || !market) {
      setResults(null);
      setLastUpdated(null);
      setPriceError('');
      return undefined;
    }
    return fetchPrices();
  }, [commodity, state, market, district, variety, grade, fetchPrices]);

  const handleCommodityChange = (val) => {
    setCommodity(val);
    setMarket('');
    setDistrict('');
    setVariety('');
    setGrade('');
    syncUrl({ commodity: val, state, market: '', district: '', variety: '', grade: '' });
  };

  const handleStateChange = (val) => {
    setState(val);
    setMarket('');
    setDistrict('');
    setVariety('');
    setGrade('');
    syncUrl({ commodity, state: val, market: '', district: '', variety: '', grade: '' });
  };

  const handleMarketChange = (val) => {
    const selected = markets.find((m) => m.value === val);
    const nextDistrict = selected?.district || '';
    setMarket(val);
    setDistrict(nextDistrict);
    setVariety('');
    setGrade('');
    syncUrl({ commodity, state, market: val, district: nextDistrict, variety: '', grade: '' });
  };

  const handleDistrictChange = (val) => {
    setDistrict(val);
    setVariety('');
    setGrade('');
    syncUrl({ commodity, state, market, district: val, variety: '', grade: '' });
  };

  const handleVarietyChange = (val) => {
    setVariety(val);
    syncUrl({ commodity, state, market, district, variety: val, grade });
  };

  const handleGradeChange = (val) => {
    setGrade(val);
    syncUrl({ commodity, state, market, district, variety, grade: val });
  };

  const handleReset = () => {
    setCommodity('');
    setState('');
    setMarket('');
    setDistrict('');
    setVariety('');
    setGrade('');
    setResults(null);
    setPriceError('');
    setMarketsError('');
    router.replace('?', { scroll: false });
  };

  const canCheckPrices = Boolean(commodity && state && market);

  if (configError) {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 p-5 text-sm text-amber-700 dark:text-amber-400" role="alert">
        {configError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters card */}
      <section
        aria-label="Mandi price filters"
        className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-4"
      >
        <div>
          <h2 className="text-sm font-semibold">Find mandi prices</h2>
          <p className="text-xs text-muted-foreground mt-1">Select a commodity, state, and market to see the latest prices.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field id={ids.commodity} label="1. Commodity">
            <SearchableSelect
              id={ids.commodity}
              value={commodity}
              onChange={handleCommodityChange}
              options={commodities}
              loading={commoditiesLoading}
              placeholder="Select commodity"
              emptyMessage="No commodities available from AGMARKNET"
            />
          </Field>
          <Field id={ids.state} label="2. State">
            <SearchableSelect
              id={ids.state}
              value={state}
              onChange={handleStateChange}
              options={states}
              loading={statesLoading}
              placeholder="Select state"
              emptyMessage="No states available from AGMARKNET"
            />
          </Field>
          <Field id={ids.market} label="3. Market">
            <SearchableSelect
              id={ids.market}
              value={market}
              onChange={handleMarketChange}
              options={markets}
              loading={marketsLoading}
              disabled={!state}
              disabledMessage="Select a state first"
              placeholder="Select market"
              emptyMessage={marketsError || 'No markets reporting for this state'}
            />
          </Field>
        </div>

        {market && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <Field id={ids.district} label="District" optional>
              <SearchableSelect
                id={ids.district}
                value={district}
                onChange={handleDistrictChange}
                options={districts}
                loading={marketsLoading}
                placeholder="All districts"
                emptyMessage="No districts for this state"
              />
            </Field>
            <Field id={ids.variety} label="Variety" optional>
              <SearchableSelect
                id={ids.variety}
                value={variety}
                onChange={handleVarietyChange}
                options={varieties}
                loading={optionsLoading}
                placeholder="All varieties"
                emptyMessage="No varieties for this selection"
              />
            </Field>
            <Field id={ids.grade} label="Grade" optional>
              <SearchableSelect
                id={ids.grade}
                value={grade}
                onChange={handleGradeChange}
                options={grades}
                loading={optionsLoading}
                placeholder="All grades"
                emptyMessage="No grades for this selection"
              />
            </Field>
          </div>
        )}

        {!state && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Select a state to load its available markets from AGMARKNET.
          </p>
        )}

        {marketsError && state && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-xl text-sm text-amber-700 dark:text-amber-400" role="alert">
            {marketsError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={fetchPrices}
            disabled={!canCheckPrices || priceLoading}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            {priceLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            ) : (
              <Search className="w-4 h-4" aria-hidden="true" />
            )}
            Check Prices
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Filters
          </button>
        </div>
      </section>

      {/* Results card */}
      <section aria-label="Mandi price results" className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6">
        {priceError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400" role="alert">
            {priceError}
          </div>
        )}

        {priceLoading && <ResultsSkeleton />}

        {!priceLoading && !priceError && results && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {results.length} record{results.length > 1 ? 's' : ''} found
              {lastUpdated ? ` · latest arrival ${lastUpdated}` : ''}
            </p>
            <div className="overflow-x-auto rounded-xl border border-border -mx-1 px-1 sm:mx-0 sm:px-0">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-muted/30 text-left">
                  <tr>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium">Commodity</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium">State</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium">District</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium">Market</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium">Variety</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium">Grade</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium">Arrival Date</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium text-right">Min Price</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium text-right">Max Price</th>
                    <th scope="col" className="px-3 sm:px-4 py-2.5 font-medium text-right">Modal Price</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={`${r.commodity}-${r.market}-${r.arrivalDate}-${i}`} className="border-t border-border">
                      <td className="px-3 sm:px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Sprout className="w-3.5 h-3.5 text-green-600 flex-shrink-0" aria-hidden="true" />
                          {r.commodity}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5">{r.state}</td>
                      <td className="px-3 sm:px-4 py-2.5">{r.district || '—'}</td>
                      <td className="px-3 sm:px-4 py-2.5">{r.market}</td>
                      <td className="px-3 sm:px-4 py-2.5">{r.variety || '—'}</td>
                      <td className="px-3 sm:px-4 py-2.5">{r.grade || '—'}</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap">{r.arrivalDate}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-right font-mono">{r.minPrice}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-right font-mono">{r.maxPrice}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-right font-mono font-semibold">{r.modalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">Prices in ₹ per quintal · sourced live from data.gov.in AGMARKNET</p>
          </div>
        )}

        {!priceLoading && !priceError && results && results.length === 0 && (
          <EmptyState message="No mandi price records found for this selection. Try a different market or remove optional filters." />
        )}

        {!priceLoading && !priceError && !results && (
          <EmptyState message="Select a commodity, then a state, then a market to see the latest mandi prices from AGMARKNET." />
        )}
      </section>
    </div>
  );
}
