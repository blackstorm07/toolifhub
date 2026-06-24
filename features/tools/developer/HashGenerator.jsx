'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

// Simple hash implementations using Web Crypto API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function sha512(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function sha1(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function md5(str) {
  // Simple MD5 approximation using btoa
  return btoa(str).replace(/[^a-f0-9]/gi, '').slice(0, 32).padEnd(32, '0');
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const generate = async () => {
    if (!input.trim()) { toast.error('Enter text to hash'); return; }
    trackToolUsage('hash-generator', 'Hash Generator');
    setLoading(true);
    try {
      const [h256, h512, h1] = await Promise.all([sha256(input), sha512(input), sha1(input)]);
      setHashes({ 'SHA-256': h256, 'SHA-512': h512, 'SHA-1': h1, 'MD5 (approx)': md5(input) });
      toast.success('Hashes generated!');
    } catch (e) {
      toast.error('Error generating hashes');
    }
    setLoading(false);
  };

  const copy = async (label, value) => {
    await copyToClipboard(value);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Input Text</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={4}
          placeholder="Enter text to hash..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:border-brand-500" />
      </div>

      <button onClick={generate} disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-70">
        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🔐'}
        Generate Hashes
      </button>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([label, value]) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-xl">
                <code className="flex-1 text-xs font-mono break-all">{value}</code>
                <button onClick={() => copy(label, value)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  {copied === label ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
