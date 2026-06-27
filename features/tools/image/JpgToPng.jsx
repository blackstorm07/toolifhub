'use client';

import { useState, useCallback, useRef } from 'react';
import { Download } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import ImagePreviewCard from './_shared/ImagePreviewCard';
import { downloadBlob, loadImage, canvasToBlob, replaceExtension } from './_shared/utils';

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

export default function JpgToPng() {
  const [items, setItems] = useState([]);
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('jpg-to-png', 'JPG to PNG Converter');
      trackedRef.current = true;
    }
  }, []);

  const convert = useCallback(async (item) => {
    try {
      const img = await loadImage(item.file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
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
        .filter((f) => f.type === 'image/jpeg' || /\.(jpe?g)$/i.test(f.name))
        .map((file) => ({
          id: nextId(),
          file,
          name: replaceExtension(file.name, 'png'),
          originalSize: file.size,
          thumbnailUrl: URL.createObjectURL(file),
          status: 'Converting…',
          resultBlob: null,
          resultSize: null,
        }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((it) => convert(it));
    },
    [convert, track]
  );

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
        accept="image/jpeg"
        multiple
        onFiles={handleFiles}
        label="Drag & drop JPG images here, or click to browse"
        hint="Converts JPG/JPEG to lossless PNG entirely in your browser, preserving resolution."
      />

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
