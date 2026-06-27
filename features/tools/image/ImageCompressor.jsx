'use client';

import { useState, useCallback, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import ImagePreviewCard from './_shared/ImagePreviewCard';
import { downloadBlob, formatBytes } from './_shared/utils';

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

export default function ImageCompressor() {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('image-compressor', 'Image Compressor');
      trackedRef.current = true;
    }
  }, []);

  const compressFile = useCallback(async (item, q) => {
    const imageCompression = (await import('browser-image-compression')).default;
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress: 1, status: 'Compressing…' } : it)));
    try {
      const resultBlob = await imageCompression(item.file, {
        maxSizeMB: 10,
        useWebWorker: true,
        initialQuality: q,
        onProgress: (p) => {
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress: p } : it)));
        },
      });
      const url = URL.createObjectURL(resultBlob);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, resultBlob, resultUrl: url, resultSize: resultBlob.size, progress: 100, status: 'Done' }
            : it
        )
      );
    } catch (err) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: `Error: ${err.message}`, progress: 0 } : it))
      );
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
          progress: 0,
          status: 'Queued',
          resultBlob: null,
          resultUrl: null,
          resultSize: null,
        }));
      setItems((prev) => [...prev, ...newItems]);
      setIsProcessing(true);
      Promise.all(newItems.map((it) => compressFile(it, quality))).finally(() => setIsProcessing(false));
    },
    [compressFile, quality, track]
  );

  const handleRecompressAll = useCallback(() => {
    track();
    setIsProcessing(true);
    Promise.all(items.map((it) => compressFile(it, quality))).finally(() => setIsProcessing(false));
  }, [items, compressFile, quality, track]);

  const handleRemove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const handleDownload = (item) => {
    if (item.resultBlob) downloadBlob(item.resultBlob, item.name);
  };

  const handleDownloadAll = async () => {
    track();
    for (const item of items) {
      if (item.resultBlob) {
        downloadBlob(item.resultBlob, item.name);
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  };

  const totalOriginal = items.reduce((s, it) => s + (it.originalSize || 0), 0);
  const totalResult = items.reduce((s, it) => s + (it.resultSize || 0), 0);

  return (
    <div className="space-y-5">
      <DropZone
        accept="image/png,image/jpeg,image/webp"
        multiple
        onFiles={handleFiles}
        label="Drag & drop images here, or click to browse"
        hint="Supports JPG, PNG, WebP. Compression happens entirely in your browser."
      />

      <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
        <label htmlFor="quality-slider" className="flex items-center justify-between text-sm font-medium">
          <span>Compression Quality</span>
          <span className="text-muted-foreground">{Math.round(quality * 100)}%</span>
        </label>
        <input
          id="quality-slider"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded"
          aria-label="Compression quality"
        />
        <p className="text-xs text-muted-foreground">Lower quality = smaller file size, higher quality = better visual fidelity.</p>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleRecompressAll}
            disabled={isProcessing}
            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Re-compress all at this quality
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {items.length} file{items.length > 1 ? 's' : ''}
              {totalOriginal > 0 && totalResult > 0 && (
                <span className="text-muted-foreground">
                  {' '}— {formatBytes(totalOriginal)} → {formatBytes(totalResult)}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <Download className="w-3.5 h-3.5" /> Download All
            </button>
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
                status={item.status !== 'Done' ? item.status : undefined}
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
