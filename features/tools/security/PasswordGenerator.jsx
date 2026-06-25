'use client';
import { useState, useCallback, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function generatePassword(length, options) {
  const pool = Object.entries(CHAR_SETS)
    .filter(([key]) => options[key])
    .map(([, chars]) => chars)
    .join('');
  if (!pool) return '';

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (n) => pool[n % pool.length]).join('');
}

function getStrength(password, options) {
  if (!password) return { label: '', score: 0, color: 'bg-muted' };
  const poolSize = Object.entries(CHAR_SETS)
    .filter(([key]) => options[key])
    .reduce((sum, [, chars]) => sum + chars.length, 0) || 1;
  const entropy = password.length * Math.log2(poolSize);

  if (entropy < 40) return { label: 'Weak', score: 1, color: 'bg-red-500' };
  if (entropy < 60) return { label: 'Fair', score: 2, color: 'bg-amber-500' };
  if (entropy < 80) return { label: 'Strong', score: 3, color: 'bg-green-500' };
  return { label: 'Very Strong', score: 4, color: 'bg-emerald-600' };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const hasAnyOption = Object.values(options).some(Boolean);
    if (!hasAnyOption) {
      toast.error('Select at least one character type');
      return;
    }
    trackToolUsage('password-generator', 'Password Generator');
    setPassword(generatePassword(length, options));
  }, [length, options]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copy = async () => {
    if (!password) return;
    await copyToClipboard(password);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(password, options);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Generated Password</label>
        <div className="flex items-center gap-2 p-4 rounded-xl border border-border bg-muted/30">
          <span className="flex-1 font-mono text-lg break-all select-all">{password || '—'}</span>
          <button
            onClick={generate}
            title="Regenerate"
            className="flex-shrink-0 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={copy}
            title="Copy"
            className="flex-shrink-0 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < strength.score ? strength.color : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strength.label}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Length</label>
            <span className="text-sm font-mono text-muted-foreground">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted accent-brand-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'uppercase', label: 'Uppercase (A-Z)' },
            { key: 'lowercase', label: 'Lowercase (a-z)' },
            { key: 'numbers', label: 'Numbers (0-9)' },
            { key: 'symbols', label: 'Symbols (!@#$)' },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={options[opt.key]}
                onChange={() => toggleOption(opt.key)}
                className="w-4 h-4 rounded accent-brand-500"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-2 h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Generate Password
      </button>
    </div>
  );
}
