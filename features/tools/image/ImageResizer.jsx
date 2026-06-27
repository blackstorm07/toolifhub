'use client';

import { useState, useCallback, useRef } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import { downloadBlob, loadImage, canvasToBlob, formatBytes } from './_shared/utils';

const PRESETS = [
  { label: '1920×1080 (HD)', width: 1920, height: 1080 },
  { label: '1280×720 (HD)', width: 1280, height: 720 },
  { label: '1080×1080 (IG Square)', width: 1080, height: 1080 },
  { label: '1200×630 (OG Image)', width: 1200, height: 630 },
  { label: '800×600', width: 800, height: 600 },
];

export default function ImageResizer() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [mode, setMode] = useState('dimensions'); // 'dimensions' | 'percentage'
  const [percentage, setPercentage] = useState(100);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const aspectRef = useRef(1);
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('image-resizer', 'Image Resizer');
      trackedRef.current = true;
    }
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      const f = files[0];
      if (!f) return;
      track();
      const image = await loadImage(f);
      setFile(f);
      setImg(image);
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);
      aspectRef.current = image.naturalWidth / image.naturalHeight;
      setResultBlob(null);
      setResultUrl(null);
    },
    [track]
  );

  const handleWidthChange = (val) => {
    const w = parseInt(val, 10) || 0;
    setWidth(w);
    if (maintainAspect && aspectRef.current) {
      setHeight(Math.round(w / aspectRef.current));
    }
  };

  const handleHeightChange = (val) => {
    const h = parseInt(val, 10) || 0;
    setHeight(h);
    if (maintainAspect && aspectRef.current) {
      setWidth(Math.round(h * aspectRef.current));
    }
  };

  const applyPreset = (preset) => {
    track();
    setMode('dimensions');
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const computeTargetDims = () => {
    if (mode === 'percentage' && img) {
      const factor = percentage / 100;
      return {
        w: Math.max(1, Math.round(img.naturalWidth * factor)),
        h: Math.max(1, Math.round(img.naturalHeight * factor)),
      };
    }
    return { w: Math.max(1, parseInt(width, 10) || 1), h: Math.max(1, parseInt(height, 10) || 1) };
  };

  const handleResize = useCallback(async () => {
    if (!img || !file) return;
    track();
    const { w, h } = computeTargetDims();
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(canvas, mime, mime === 'image/jpeg' ? 0.92 : undefined);
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, file, width, height, mode, percentage, track]);

  const handleDownload = () => {
    if (resultBlob && file) downloadBlob(resultBlob, file.name);
  };

  const handleReset = () => {
    setFile(null);
    setImg(null);
    setResultBlob(null);
    setResultUrl(null);
  };

  const targetDims = img ? computeTargetDims() : null;

  return (
    <div className="space-y-5">
      {!file ? (
        <DropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drag & drop an image here, or click to browse"
          hint="Resize images to exact dimensions or by percentage."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl border border-border overflow-hidden bg-muted/30 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img?.src} alt={file.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                Original: {img?.naturalWidth}×{img?.naturalHeight} · {formatBytes(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset"
              className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2" role="radiogroup" aria-label="Resize mode">
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'dimensions'}
              onClick={() => setMode('dimensions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                mode === 'dimensions' ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted/60'
              }`}
            >
              By Dimensions
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'percentage'}
              onClick={() => setMode('percentage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                mode === 'percentage' ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted/60'
              }`}
            >
              By Percentage
            </button>
          </div>

          {mode === 'dimensions' ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="resize-width" className="text-xs font-medium text-muted-foreground block mb-1">
                  Width (px)
                </label>
                <input
                  id="resize-width"
                  type="number"
                  min="1"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label htmlFor="resize-height" className="text-xs font-medium text-muted-foreground block mb-1">
                  Height (px)
                </label>
                <input
                  id="resize-height"
                  type="number"
                  min="1"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="rounded border-border focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                Maintain aspect ratio
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="resize-pct" className="flex items-center justify-between text-sm font-medium">
                <span>Scale</span>
                <span className="text-muted-foreground">{percentage}%</span>
              </label>
              <input
                id="resize-pct"
                type="range"
                min="1"
                max="200"
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded"
              />
              {targetDims && (
                <p className="text-xs text-muted-foreground">Result: {targetDims.w}×{targetDims.h}px</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground block">Common Presets</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleResize}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            Resize Image
          </button>

          {resultUrl && (
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Resized result" className="w-20 h-20 object-contain rounded-lg border border-border bg-background" />
              <div className="flex-1">
                <p className="text-sm font-medium">Resized successfully</p>
                <p className="text-xs text-muted-foreground">{formatBytes(resultBlob?.size || 0)}</p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
