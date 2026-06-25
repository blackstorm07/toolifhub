'use client';
import { useState, useEffect } from 'react';
import { Copy, Check, ShieldAlert } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function base64UrlDecode(segment) {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const decoded = atob(padded + padding);
  return decodeURIComponent(
    Array.from(decoded).map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  );
}

function decodeJWT(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('A JWT must have 3 parts separated by dots: header.payload.signature');
  }
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload, signature: parts[2] };
}

function formatClaimDate(value) {
  if (typeof value !== 'number') return null;
  return new Date(value * 1000).toString();
}

function JsonBlock({ title, data }) {
  const [copied, setCopied] = useState(false);
  const pretty = JSON.stringify(data, null, 2);
  const copy = async () => {
    await copyToClipboard(pretty);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{title}</label>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          Copy
        </button>
      </div>
      <pre className="w-full p-4 rounded-xl border border-border bg-muted/30 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">
        {pretty}
      </pre>
    </div>
  );
}

export default function JWTDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token.trim()) { setDecoded(null); setError(''); return; }
    try {
      const result = decodeJWT(token);
      setDecoded(result);
      setError('');
      trackToolUsage('jwt-decoder', 'JWT Decoder');
    } catch (e) {
      setDecoded(null);
      setError(e.message || 'Invalid JWT');
    }
  }, [token]);

  const exp = decoded ? formatClaimDate(decoded.payload.exp) : null;
  const iat = decoded ? formatClaimDate(decoded.payload.iat) : null;
  const isExpired = decoded?.payload.exp ? Date.now() / 1000 > decoded.payload.exp : null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          Decoding only — this tool does not verify the signature. Everything runs in your browser.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {decoded && (
        <>
          {(exp || iat) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {iat && (
                <div className="px-4 py-3 rounded-xl border border-border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Issued At</p>
                  <p className="text-sm font-medium">{iat}</p>
                </div>
              )}
              {exp && (
                <div className={`px-4 py-3 rounded-xl border ${isExpired ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' : 'border-border bg-muted/20'}`}>
                  <p className="text-xs text-muted-foreground">Expires At {isExpired ? '(expired)' : ''}</p>
                  <p className={`text-sm font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : ''}`}>{exp}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <JsonBlock title="Header" data={decoded.header} />
            <JsonBlock title="Payload" data={decoded.payload} />
          </div>
        </>
      )}

      {!decoded && !error && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Paste a JWT above to decode its header and payload. Decoding happens entirely client-side.
        </p>
      )}
    </div>
  );
}
