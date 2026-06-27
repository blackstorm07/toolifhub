'use client';

import { useState, useCallback, useRef } from 'react';
import { Download, Zap, ChevronDown, Loader2 } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import ImagePreviewCard from './_shared/ImagePreviewCard';
import { downloadBlob, formatBytes } from './_shared/utils';

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

function smartOptions(originalSizeBytes) {
  const mb = originalSizeBytes / (1024 * 1024);
  if (mb > 8) return { maxSizeMB: 1.2, maxWidthOrHeight: 1920, initialQuality: 0.7 };
  if (mb > 3) return { maxSizeMB: 1, maxWidthOrHeight: 1920, initialQuality: 0.78 };
  return { maxSizeMB: 0.6, maxWidthOrHeight: 1920, initialQuality: 0.85 };
}

export default function ImageOptimizer() {
  const [items, setItems] = useState([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('image-optimizer', 'Image Optimizer');
      trackedRef.current = true;
    }
  }, []);

  const handleFiles = useCallback(
    (files) => {
      track();
      const newItems = files
        .filter((f) => f.type.startsWith('image/'))
        .map((file) => ({
          id: nextId(),
          file,
          name: file.name,
          originalSize: file.size,
          thumbnailUrl: URL.createObjectURL(file),
          status: 'Ready',
          resultBlob: null,
          resultSize: null,
        }));
      setItems((prev) => [...prev, ...newItems]);
    },
    [track]
  );

  const optimizeOne = useCallback(async (item, useAdvanced) => {
    const imageCompression = (await import('browser-image-compression')).default;
    const opts = useAdvanced
      ? { maxSizeMB: 1, maxWidthOrHeight: 1920, initialQuality: quality, useWebWorker: true }
      : { ...smartOptions(item.originalSize), useWebWorker: true };

    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress: 1, status: 'Optimizing…' } : it)));
    try {
      const resultBlob = await imageCompression(item.file, {
        ...opts,
        onProgress: (p) => setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress: p } : it))),
      });
      const url = URL.createObjectURL(resultBlob);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, resultBlob, resultUrl: url, resultSize: resultBlob.size, progress: 100, status: 'Optimized' }
            : it
        )
      );
    } catch (err) {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: `Error: ${err.message}` } : it)));
    }
  }, [quality]);

  const handleOptimizeAll = useCallback(() => {
    track();
    setIsProcessing(true);
    Promise.all(items.map((it) => optimizeOne(it, advancedOpen))).finally(() => setIsProcessing(false));
  }, [items, optimizeOne, advancedOpen, track]);

  const handleRemove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
  const handleDownload = (item) => item.resultBlob && downloadBlob(item.resultBlob, item.name);
  const handleDownloadAll = async () => {
    for (const item of items) {
      if (item.resultBlob) {
        downloadBlob(item.resultBlob, item.name);
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  };

  const totalOriginal = items.reduce((s, it) => s + (it.originalSize || 0), 0);
  const totalResult = items.reduce((s, it) => s + (it.resultSize || 0), 0);
  const anyOptimized = items.some((it) => it.resultBlob);

  return (
    <div className="space-y-5">
      <DropZone
        accept="image/*"
        multiple
        onFiles={handleFiles}
        label="Drag & drop images here, or click to browse"
        hint="One-click optimization for the web — smart defaults, no configuration needed."
      />

      {items.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleOptimizeAll}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Optimize {items.length > 1 ? `All (${items.length})` : 'Image'}
          </button>

          <div className="rounded-xl border border-border bg-muted/30">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded-xl"
            >
              Advanced settings
              <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
            </button>
            {advancedOpen && (
              <div className="px-4 pb-4 space-y-2">
                <label htmlFor="optimizer-quality" className="flex items-center justify-between text-sm font-medium">
                  <span>Quality</span>
                  <span className="text-muted-foreground">{Math.round(quality * 100)}%</span>
                </label>
                <input
                  id="optimizer-quality"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded"
                  aria-label="Quality"
                />
                <p className="text-xs text-muted-foreground">
                  When advanced settings are open, this quality value overrides the automatic smart defaults.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {items.length} file{items.length > 1 ? 's' : ''}
              {anyOptimized && totalResult > 0 && (
                <span className="text-muted-foreground">
                  {' '}— {formatBytes(totalOriginal)} → {formatBytes(totalResult)} (
                  {Math.round((1 - totalResult / totalOriginal) * 100)}% smaller)
                </span>
              )}
            </p>
            {anyOptimized && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <Download className="w-3.5 h-3.5" /> Download All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <ImagePreviewCard
                key={item.id}
                filename={item.name}
                thumbnailUrl={item.thumbnailUrl}
                originalSize={item.originalSize}
                resultSize={item.resultSize}
                progress={item.progress < 100 ? item.progress : undefined}
                status={item.status !== 'Optimized' ? item.status : undefined}
                onDownload={item.resultBlob ? () => handleDownload(item) : undefined}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
