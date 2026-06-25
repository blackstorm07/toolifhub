'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';

const STATE_CODES = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
  '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
  '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
  '34': 'Puducherry', '35': 'Andaman & Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh',
  '38': 'Ladakh', '97': 'Other Territory',
};

const CHAR_VALUES = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function computeChecksum(gstin14) {
  const factors = [1, 2];
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const value = CHAR_VALUES.indexOf(gstin14[i]);
    const product = value * factors[i % 2];
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checksumValue = (36 - (sum % 36)) % 36;
  return CHAR_VALUES[checksumValue];
}

function validateGSTIN(raw) {
  const gstin = raw.trim().toUpperCase();
  const formatOk = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);

  if (!formatOk) {
    return { gstin, formatOk: false, checksumOk: false, stateCode: null, panSegment: null };
  }

  const stateCode = gstin.slice(0, 2);
  const expectedChecksum = computeChecksum(gstin.slice(0, 14));
  const checksumOk = expectedChecksum === gstin[14];

  return {
    gstin,
    formatOk: true,
    checksumOk,
    stateCode,
    stateName: STATE_CODES[stateCode] || 'Unknown',
    panSegment: gstin.slice(2, 12),
    entityCode: gstin[12],
  };
}

export default function GSTINValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const handleValidate = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    trackToolUsage('gstin-validator', 'GSTIN Validator');
    setResult(validateGSTIN(input));
  };

  const isValid = result?.formatOk && result?.checksumOk;

  return (
    <div className="space-y-5">
      <form onSubmit={handleValidate} className="flex flex-col sm:flex-row gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 27AAPFU0939F1ZV"
          maxLength={15}
          className="flex-1 h-11 px-4 rounded-xl border border-border bg-background uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center justify-center gap-2 h-11 px-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          Validate
        </button>
      </form>

      {result && (
        <div className={`rounded-xl border p-4 sm:p-5 space-y-3 ${isValid ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10'}`}>
          <div className="flex items-center gap-2">
            {isValid ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
            <span className={`font-semibold ${isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isValid ? 'Valid GSTIN' : 'Invalid GSTIN'}
            </span>
          </div>

          {!result.formatOk && (
            <p className="text-sm text-muted-foreground">
              GSTIN must be 15 characters: 2-digit state code, 10-character PAN, entity code, &quot;Z&quot;, and a checksum digit.
            </p>
          )}

          {result.formatOk && !result.checksumOk && (
            <p className="text-sm text-muted-foreground">Format looks correct, but the checksum digit doesn&apos;t match — double-check for typos.</p>
          )}

          {result.formatOk && (
            <div className="grid grid-cols-2 gap-3 text-sm pt-1">
              <div><span className="text-muted-foreground">State Code</span><p className="font-mono font-medium">{result.stateCode}</p></div>
              <div><span className="text-muted-foreground">State</span><p className="font-medium">{result.stateName}</p></div>
              <div><span className="text-muted-foreground">PAN Segment</span><p className="font-mono font-medium">{result.panSegment}</p></div>
              <div><span className="text-muted-foreground">Entity Code</span><p className="font-mono font-medium">{result.entityCode}</p></div>
            </div>
          )}
        </div>
      )}

      {!result && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Enter a 15-character GSTIN to check its format, checksum, and issuing state. This validates structure only — it does not check live GST registration status.
        </p>
      )}
    </div>
  );
}
