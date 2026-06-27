'use client';

import { useState, useCallback, useRef } from 'react';
import { Download } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import ImagePreviewCard from './_shared/ImagePreviewCard';
import { downloadBlob, loadImage, canvasToBlob, replaceExtension } from './_shared/utils';

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

export default function PngToJpg() {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(0.92);
  const [bgColor, setBgColor] = useState('#ffffff');
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('png-to-jpg', 'PNG to JPG Converter');
      trackedRef.current = true;
    }
  }, []);

  const convert = useCallback(async (item, q, bg) => {
    try {
      const img = await loadImage(item.file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/jpeg', q);
      const url = URL.createObjectURL(blob);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, resultBlob: blob, resultUrl: url, resultSize: blob.size, status: 'Done' }
            : it
        )
      );
    } catch (err) {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: `Error: ${err.message}` } : it)));
    }
  }, []);

  const handleFiles = useCallback(
    (files) => {
      track();
      const newItems = files
        .filter((f) => f.type === 'image/png' || f.name.toLowerCase().endsWith('.png'))
        .map((file) => ({
          id: nextId(),
          file,
          name: replaceExtension(file.name, 'jpg'),
          originalSize: file.size,
          thumbnailUrl: URL.createObjectURL(file),
          status: 'Converting…',
          resultBlob: null,
          resultSize: null,
        }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((it) => convert(it, quality, bgColor));
    },
    [convert, quality, bgColor, track]
  );

  const handleReconvertAll = () => {
    track();
    setItems((prev) => prev.map((it) => ({ ...it, status: 'Converting…' })));
    items.forEach((it) => convert(it, quality, bgColor));
  };

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

  return (
    <div className="space-y-5">
      <DropZone
        accept="image/png"
        multiple
        onFiles={handleFiles}
        label="Drag & drop PNG images here, or click to browse"
        hint="Converts PNG to JPG entirely in your browser."
      />

      <div className="p-4 rounded-xl border border-border bg-muted/30 grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="png-jpg-quality" className="flex items-center justify-between text-sm font-medium">
            <span>JPG Quality</span>
            <span className="text-muted-foreground">{Math.round(quality * 100)}%</span>
          </label>
          <input
            id="png-jpg-quality"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded"
            aria-label="JPG quality"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bg-color" className="text-sm font-medium block">
            Background Color (for transparency)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="bg-color"
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-9 rounded-lg border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Background color"
            />
            <span className="text-xs text-muted-foreground">{bgColor}</span>
          </div>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleReconvertAll}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            Re-convert all with these settings
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{items.length} file{items.length > 1 ? 's' : ''}</p>
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
