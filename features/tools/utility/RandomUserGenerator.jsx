'use client';
import { useState, useRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Copy, Check, RefreshCw, Download, Trash2, Mail, Users } from 'lucide-react';
import { copyToClipboard, downloadText } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';
import namesData from '@/data/names.json';

const ROW_HEIGHT = 44;

const COUNTRIES = [
  { value: 'international', label: 'International' },
  { value: 'india', label: 'India' },
  { value: 'united_states', label: 'United States' },
  { value: 'united_kingdom', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'japan', label: 'Japan' },
  { value: 'south_korea', label: 'South Korea' },
  { value: 'china', label: 'China' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'uae', label: 'United Arab Emirates' },
  { value: 'saudi_arabia', label: 'Saudi Arabia' },
];

const GENDERS = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unisex', label: 'Unisex' },
];

const GENDER_LABELS = { male: 'Male', female: 'Female', unisex: 'Unisex' };
const ALL_COUNTRY_KEYS = COUNTRIES.map((c) => c.value).filter((v) => v !== 'international');
const EMAIL_DOMAINS = ['example.com', 'mail.com', 'outlook.com', 'gmail.com'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sanitizeForId(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function buildEmailLocalPart(first, last, includeLastName) {
  const f = sanitizeForId(first);
  const l = includeLastName ? sanitizeForId(last) : '';
  const suffix = Math.random() < 0.75 ? String(Math.floor(Math.random() * 99) + 1) : '';

  if (!l) {
    return `${f}${suffix ? `_${suffix}` : Math.floor(Math.random() * 9999)}`;
  }

  const templates = [
    () => `${f}.${l}${suffix}`,
    () => `${f}${l}${suffix}`,
    () => `${f}_${l}${suffix}`,
    () => `${f}.${l}`,
  ];
  return pickRandom(templates)();
}

function buildUniqueValue(buildFn, usedSet, domain) {
  for (let attempt = 0; attempt < 25; attempt++) {
    const value = domain ? `${buildFn()}@${pickRandom(EMAIL_DOMAINS)}` : buildFn();
    if (!usedSet.has(value)) return value;
  }
  const fallback = `${buildFn()}${Math.floor(100000 + Math.random() * 900000)}`;
  return domain ? `${fallback}@${pickRandom(EMAIL_DOMAINS)}` : fallback;
}

function buildUsername(first, last, includeLastName) {
  const f = sanitizeForId(first);
  const l = includeLastName ? sanitizeForId(last) : '';
  const num = Math.floor(Math.random() * 999);
  const templates = l
    ? [() => `${f}.${l}${num}`, () => `${f}_${l}`, () => `${f}${l}${num}`]
    : [() => `${f}${num}`, () => `${f}_${num}`];
  return pickRandom(templates)();
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateRecords({
  country,
  gender,
  quantity,
  includeLastName,
  generateEmail,
  generateUsername,
  generateUuid,
  preventDuplicateUsers,
}) {
  const usedNames = new Set();
  const usedEmails = new Set();
  const usedUsernames = new Set();
  const records = [];
  const maxAttempts = quantity * 60;
  let attempts = 0;

  while (records.length < quantity && attempts < maxAttempts) {
    attempts++;

    const countryKey = country === 'international' ? pickRandom(ALL_COUNTRY_KEYS) : country;
    const countryData = namesData[countryKey];
    const effectiveGender = gender === 'any' ? pickRandom(['male', 'female', 'unisex']) : gender;

    const firstPool = countryData[effectiveGender];
    if (!firstPool || firstPool.length === 0) continue;

    const first = pickRandom(firstPool);
    const last = includeLastName ? pickRandom(countryData.lastNames) : '';
    const fullName = includeLastName ? `${first} ${last}` : first;
    const nameKey = `${fullName}|${effectiveGender}|${countryKey}`;

    if (preventDuplicateUsers && usedNames.has(nameKey)) continue;

    const email = generateEmail
      ? buildUniqueValue(() => buildEmailLocalPart(first, last, includeLastName), usedEmails, true)
      : '';
    if (generateEmail && preventDuplicateUsers && usedEmails.has(email)) continue;

    const username = generateUsername
      ? buildUniqueValue(() => buildUsername(first, last, includeLastName), usedUsernames, false)
      : '';
    if (generateUsername && preventDuplicateUsers && usedUsernames.has(username)) continue;

    const uuid = generateUuid ? generateUUID() : '';

    usedNames.add(nameKey);
    if (generateEmail) usedEmails.add(email);
    if (generateUsername) usedUsernames.add(username);

    records.push({
      firstName: first,
      lastName: last,
      fullName,
      gender: GENDER_LABELS[effectiveGender],
      country: countryData.country,
      email,
      username,
      uuid,
    });
  }

  return { records, shortage: records.length < quantity };
}

const Row = memo(function Row({ record, index, gridTemplate, columns, copied, onCopyEmail }) {
  return (
    <div
      className={`grid items-center border-b border-border hover:bg-muted/30 transition-colors ${
        index % 2 === 1 ? 'bg-muted/10' : ''
      }`}
      style={{ gridTemplateColumns: gridTemplate, height: ROW_HEIGHT }}
    >
      <div className="px-4 text-sm font-medium truncate">{record.fullName}</div>
      <div className="px-4 text-sm text-muted-foreground truncate">{record.gender}</div>
      <div className="px-4 text-sm text-muted-foreground truncate">{record.country}</div>
      {columns.email && (
        <>
          <div className="px-4 text-xs font-mono truncate" title={record.email}>{record.email}</div>
          <div className="px-2 flex items-center justify-center">
            <button
              onClick={() => onCopyEmail(record.email, index)}
              title="Copy email"
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </>
      )}
      {columns.username && <div className="px-4 text-xs font-mono truncate">{record.username}</div>}
      {columns.uuid && <div className="px-4 text-xs font-mono truncate" title={record.uuid}>{record.uuid}</div>}
    </div>
  );
});

function ResultsTable({ results, columns, copiedEmailIndex, onCopyEmail }) {
  const parentRef = useRef(null);

  const segments = ['minmax(160px,1.3fr)', 'minmax(90px,0.7fr)', 'minmax(130px,1fr)'];
  if (columns.email) segments.push('minmax(220px,1.8fr)', '56px');
  if (columns.username) segments.push('minmax(140px,1fr)');
  if (columns.uuid) segments.push('minmax(220px,1.6fr)');
  const gridTemplate = segments.join(' ');
  const minWidth = 480 + (columns.email ? 280 : 0) + (columns.username ? 140 : 0) + (columns.uuid ? 220 : 0);

  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  if (results.length === 0) {
    return (
      <div className="h-[420px] sm:h-[500px] lg:h-[600px] rounded-2xl border border-border bg-muted/10 flex flex-col items-center justify-center gap-2 text-center px-6">
        <Users className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No users generated yet. Choose a country and click Generate.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div ref={parentRef} className="h-[420px] sm:h-[500px] lg:h-[600px] overflow-auto">
        <div style={{ minWidth }}>
          <div
            className="sticky top-0 z-10 grid bg-muted/40 backdrop-blur border-b border-border"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="px-4 py-2.5 text-sm font-medium truncate">Full Name</div>
            <div className="px-4 py-2.5 text-sm font-medium truncate">Gender</div>
            <div className="px-4 py-2.5 text-sm font-medium truncate">Country</div>
            {columns.email && (
              <>
                <div className="px-4 py-2.5 text-sm font-medium truncate">Email</div>
                <div className="px-2 py-2.5 text-sm font-medium text-center">Actions</div>
              </>
            )}
            {columns.username && <div className="px-4 py-2.5 text-sm font-medium truncate">Username</div>}
            {columns.uuid && <div className="px-4 py-2.5 text-sm font-medium truncate">UUID</div>}
          </div>
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const record = results[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <Row
                    record={record}
                    index={virtualRow.index}
                    gridTemplate={gridTemplate}
                    columns={columns}
                    copied={copiedEmailIndex === virtualRow.index}
                    onCopyEmail={onCopyEmail}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RandomUserGenerator() {
  const [country, setCountry] = useState('international');
  const [gender, setGender] = useState('any');
  const [quantity, setQuantity] = useState('10');
  const [includeLastName, setIncludeLastName] = useState(true);
  const [generateEmail, setGenerateEmail] = useState(true);
  const [generateUsername, setGenerateUsername] = useState(false);
  const [generateUuid, setGenerateUuid] = useState(false);
  const [preventDuplicateUsers, setPreventDuplicateUsers] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedEmailIndex, setCopiedEmailIndex] = useState(null);

  const columns = { email: generateEmail, username: generateUsername, uuid: generateUuid };

  const validate = () => {
    const qty = Number(quantity);
    if (quantity === '' || Number.isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      return 'Quantity must be a whole number of at least 1';
    }
    if (qty > 5000) {
      return 'Quantity cannot exceed 5,000';
    }
    return '';
  };

  const generate = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    const { records, shortage } = generateRecords({
      country,
      gender,
      quantity: Number(quantity),
      includeLastName,
      generateEmail,
      generateUsername,
      generateUuid,
      preventDuplicateUsers,
    });

    if (records.length === 0) {
      const msg = 'No users match this filter. Try a different gender or country.';
      setError(msg);
      setResults([]);
      toast.error(msg);
      return;
    }

    setError('');
    setResults(records);
    trackToolUsage('random-user-generator', 'Random User Generator');
    if (shortage) {
      toast.success(`Only ${records.length} unique user${records.length > 1 ? 's' : ''} available for this filter`);
    } else {
      toast.success(`Generated ${records.length} user${records.length > 1 ? 's' : ''}!`);
    }
  };

  const clear = () => {
    setResults([]);
    setError('');
  };

  const copyEmail = async (email, index) => {
    if (!email) return;
    await copyToClipboard(email);
    setCopiedEmailIndex(index);
    toast.success('Email copied!');
    setTimeout(() => setCopiedEmailIndex(null), 2000);
  };

  const copyAllEmails = async () => {
    if (!results.length) return;
    await copyToClipboard(results.map((r) => r.email).filter(Boolean).join('\n'));
    setCopiedAll(true);
    toast.success('All emails copied!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyTable = async () => {
    if (!results.length) return;
    const header = ['Full Name', 'Gender', 'Country', 'Email', 'Username', 'UUID'].join('\t');
    const rows = results.map((r) => [r.fullName, r.gender, r.country, r.email, r.username, r.uuid].join('\t'));
    await copyToClipboard([header, ...rows].join('\n'));
    setCopiedTable(true);
    toast.success('Table copied!');
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const downloadTxt = () => {
    const lines = results.map((r) =>
      [r.fullName, r.gender, r.country, r.email, r.username, r.uuid].filter(Boolean).join(' | ')
    );
    downloadText('random-users.txt', lines.join('\n'), 'text/plain');
  };

  const downloadCsv = () => {
    const escape = (v) => (/[",\n]/.test(v || '') ? `"${v.replace(/"/g, '""')}"` : v || '');
    const header = ['First Name', 'Last Name', 'Full Name', 'Gender', 'Country', 'Email', 'Username', 'UUID'].join(',');
    const rows = results.map((r) =>
      [r.firstName, r.lastName, r.fullName, r.gender, r.country, r.email, r.username, r.uuid].map(escape).join(',')
    );
    downloadText('random-users.csv', [header, ...rows].join('\n'), 'text/csv');
  };

  const downloadJson = () => {
    downloadText('random-users.json', JSON.stringify(results, null, 2), 'application/json');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="ruser-country" className="text-sm font-medium">Country</label>
          <select
            id="ruser-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="ruser-gender" className="text-sm font-medium">Gender</label>
          <select
            id="ruser-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="ruser-qty" className="text-sm font-medium">Number of Users</label>
          <input
            id="ruser-qty"
            type="number"
            min={1}
            max={5000}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={includeLastName}
            onChange={(e) => setIncludeLastName(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm">Include last name</span>
        </label>
        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={generateEmail}
            onChange={(e) => setGenerateEmail(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm">Generate email</span>
        </label>
        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={generateUsername}
            onChange={(e) => setGenerateUsername(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm">Generate username</span>
        </label>
        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={generateUuid}
            onChange={(e) => setGenerateUuid(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm">Generate UUID</span>
        </label>
        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={preventDuplicateUsers}
            onChange={(e) => setPreventDuplicateUsers(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm">Prevent duplicate users</span>
        </label>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-2 h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Generate Users
      </button>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-medium">Results ({results.length})</label>
          {results.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={copyTable} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                {copiedTable ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                Copy All
              </button>
              {generateEmail && (
                <button onClick={copyAllEmails} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  {copiedAll ? <Check className="w-3 h-3 text-green-500" /> : <Mail className="w-3 h-3" />}
                  Copy Emails Only
                </button>
              )}
              <button onClick={downloadCsv} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Download className="w-3 h-3" /> CSV
              </button>
              <button onClick={downloadTxt} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Download className="w-3 h-3" /> TXT
              </button>
              <button onClick={downloadJson} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Download className="w-3 h-3" /> JSON
              </button>
              <button onClick={generate} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
              <button onClick={clear} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>

        <ResultsTable
          results={results}
          columns={columns}
          copiedEmailIndex={copiedEmailIndex}
          onCopyEmail={copyEmail}
        />
      </div>
    </div>
  );
}
