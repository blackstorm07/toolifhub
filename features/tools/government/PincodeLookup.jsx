'use client';
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';

export default function PincodeLookup() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    trackToolUsage('pin-code-lookup', 'PIN Code Lookup');
    try {
      const res = await fetch(`/api/government/pincode?pincode=${encodeURIComponent(pincode.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lookup failed');
      setData(json.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="e.g. 110001"
          inputMode="numeric"
          className="flex-1 h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="flex items-center justify-center gap-2 h-11 px-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">PIN Code <span className="font-mono font-semibold text-foreground">{data.pincode}</span> · {data.postOffices.length} post office{data.postOffices.length > 1 ? 's' : ''}</p>
          </div>
          {data.postOffices.map((po, i) => (
            <div key={i} className="rounded-xl border border-border p-4 sm:p-5">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <p className="font-semibold">{po.name} S.O</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-muted-foreground">State</span><p className="font-medium">{po.state}</p></div>
                <div><span className="text-muted-foreground">District</span><p className="font-medium">{po.district}</p></div>
                <div><span className="text-muted-foreground">Taluka</span><p className="font-medium">{po.taluka}</p></div>
                <div><span className="text-muted-foreground">Branch Type</span><p className="font-medium">{po.branchType}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!data && !error && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Enter any 6-digit Indian PIN code to find its state, district, taluka, and serving post offices.
        </p>
      )}
    </div>
  );
}
