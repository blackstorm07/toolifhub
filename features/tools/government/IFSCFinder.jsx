'use client';
import { useState } from 'react';
import { Search, Building2, Phone, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackToolUsage } from '@/lib/analytics';

export default function IFSCFinder() {
  const [ifsc, setIfsc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (ifsc.trim().length !== 11) return;
    setLoading(true);
    setError('');
    setData(null);
    trackToolUsage('ifsc-code-finder', 'IFSC Code Finder');
    try {
      const res = await fetch(`/api/government/ifsc?ifsc=${encodeURIComponent(ifsc.trim())}`);
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

  const features = data ? [
    { label: 'NEFT', enabled: data.neft },
    { label: 'RTGS', enabled: data.rtgs },
    { label: 'IMPS', enabled: data.imps },
    { label: 'UPI', enabled: data.upi },
  ] : [];

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
          placeholder="e.g. SBIN0001234"
          className="flex-1 h-11 px-4 rounded-xl border border-border bg-background uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || ifsc.trim().length !== 11}
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
        <div className="rounded-xl border border-border p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-2">
            <Building2 className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{data.bank}</p>
              <p className="text-sm text-muted-foreground">{data.branch} Branch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="sm:col-span-2"><span className="text-muted-foreground">Address</span><p className="font-medium">{data.address}</p></div>
            <div><span className="text-muted-foreground">City</span><p className="font-medium">{data.city}</p></div>
            <div><span className="text-muted-foreground">District</span><p className="font-medium">{data.district}</p></div>
            <div><span className="text-muted-foreground">State</span><p className="font-medium">{data.state}</p></div>
            <div><span className="text-muted-foreground">IFSC</span><p className="font-mono font-medium">{data.ifsc}</p></div>
            {data.micr && <div><span className="text-muted-foreground">MICR</span><p className="font-mono font-medium">{data.micr}</p></div>}
            {data.contact && (
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                <div><span className="text-muted-foreground">Contact</span><p className="font-medium">{data.contact}</p></div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {features.map((f) => (
              <span
                key={f.label}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${f.enabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}
              >
                {f.label} {f.enabled ? <Check className="w-3 h-3" aria-hidden="true" /> : <X className="w-3 h-3" aria-hidden="true" />}
              </span>
            ))}
          </div>
        </div>
      )}

      {!data && !error && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Enter an 11-character IFSC code to find the bank, branch, address, and supported transfer modes.
        </p>
      )}
    </div>
  );
}
