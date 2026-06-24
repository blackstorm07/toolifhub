'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UUIDGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = () => {
    trackToolUsage('uuid-generator', 'UUID Generator');
    setUuids(Array.from({ length: count }, () => generateUUID()));
    toast.success(`${count} UUID${count > 1 ? 's' : ''} generated!`);
  };

  const copy = async (uuid, i) => {
    await copyToClipboard(uuid);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied!');
  };

  const copyAll = async () => {
    await copyToClipboard(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success('All UUIDs copied!');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium whitespace-nowrap">Generate:</label>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {[1, 5, 10, 20].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${count === n ? 'bg-brand-500 text-white' : 'hover:bg-muted text-muted-foreground'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" /> Generate UUID{count > 1 ? 's' : ''}
        </button>
      </div>

      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Version 4 UUIDs</span>
            <button onClick={copyAll}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {copiedAll ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              Copy All
            </button>
          </div>
          <div className="space-y-2">
            {uuids.map((uuid, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 bg-muted/30 border border-border rounded-xl hover:border-brand-300 dark:hover:border-brand-700 transition-colors group font-mono">
                <span className="flex-1 text-sm select-all">{uuid}</span>
                <button onClick={() => copy(uuid, i)}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  {copiedIndex === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
