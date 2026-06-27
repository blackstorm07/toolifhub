'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, RotateCcw, RotateCw, RefreshCw } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import { downloadBlob, loadImage, canvasToBlob, formatBytes } from './_shared/utils';

const ASPECTS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
];

const DISPLAY_SIZE = 480; // max width/height of the display stage

export default function ImageCropper() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ x: 40, y: 40, w: 200, h: 200 });
  const [aspect, setAspect] = useState(null);
  const [circleCrop, setCircleCrop] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);

  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('image-cropper', 'Image Cropper');
      trackedRef.current = true;
    }
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      const f = files[0];
      if (!f) return;
      track();
      const image = await loadImage(f);
      const scale = Math.min(DISPLAY_SIZE / image.naturalWidth, DISPLAY_SIZE / image.naturalHeight, 1);
      const w = Math.round(image.naturalWidth * scale);
      const h = Math.round(image.naturalHeight * scale);
      setFile(f);
      setImg(image);
      setStageSize({ w, h });
      const boxW = Math.round(w * 0.6);
      const boxH = Math.round(h * 0.6);
      setBox({ x: Math.round((w - boxW) / 2), y: Math.round((h - boxH) / 2), w: boxW, h: boxH });
      setResultUrl(null);
      setResultBlob(null);
      setRotation(0);
      setZoom(1);
    },
    [track]
  );

  const clampBox = useCallback(
    (b) => {
      const { w: sw, h: sh } = stageSize;
      let { x, y, w, h } = b;
      w = Math.max(20, Math.min(w, sw));
      h = Math.max(20, Math.min(h, sh));
      x = Math.max(0, Math.min(x, sw - w));
      y = Math.max(0, Math.min(y, sh - h));
      return { x, y, w, h };
    },
    [stageSize]
  );

  const applyAspect = (value) => {
    track();
    setAspect(value);
    if (value) {
      setBox((prev) => {
        const w = prev.w;
        const h = Math.round(w / value);
        return clampBox({ ...prev, w, h });
      });
    }
  };

  const onDrag = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (d.type === 'move') {
        setBox(clampBox({ ...d.startBox, x: d.startBox.x + dx, y: d.startBox.y + dy }));
        return;
      }

      // resize
      let { x, y, w, h } = d.startBox;
      const handle = d.handle;
      if (handle.includes('e')) w = d.startBox.w + dx;
      if (handle.includes('s')) h = d.startBox.h + dy;
      if (handle.includes('w')) {
        w = d.startBox.w - dx;
        x = d.startBox.x + dx;
      }
      if (handle.includes('n')) {
        h = d.startBox.h - dy;
        y = d.startBox.y + dy;
      }

      if (aspect) {
        h = w / aspect;
        if (handle.includes('n')) y = d.startBox.y + d.startBox.h - h;
      }

      setBox(clampBox({ x, y, w: Math.max(20, w), h: Math.max(20, h) }));
    },
    [aspect, clampBox]
  );

  // Pointer-based drag/resize
  const startDrag = (e, type, handle) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      type, // 'move' | 'resize'
      handle, // corner name for resize
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...box },
    };

    const onPointerUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onDrag);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onDrag);
    window.addEventListener('pointerup', onPointerUp);
  };

  useEffect(() => {
    const activeOnDrag = onDrag;
    return () => {
      window.removeEventListener('pointermove', activeOnDrag);
    };
  }, [onDrag]);

  const rotateBy = (deg) => {
    track();
    setRotation((prev) => (prev + deg + 360) % 360);
  };

  const handleCropExport = useCallback(async () => {
    if (!img || !stageSize.w) return;
    track();

    // Scale factor from displayed stage back to natural image pixels
    const scaleX = img.naturalWidth / stageSize.w;
    const scaleY = img.naturalHeight / stageSize.h;

    // Account for zoom: the image is displayed scaled by `zoom` around center,
    // so we must map box coords (in unzoomed stage space) considering zoom.
    // Since zoom is applied via CSS transform scale on a centered image,
    // the effective image coordinate for a stage point p is:
    // imgCoord = center + (p - center) / zoom
    const centerX = stageSize.w / 2;
    const centerY = stageSize.h / 2;

    const mapPoint = (px, py) => {
      const ux = centerX + (px - centerX) / zoom;
      const uy = centerY + (py - centerY) / zoom;
      return { x: ux * scaleX, y: uy * scaleY };
    };

    const topLeft = mapPoint(box.x, box.y);
    const bottomRight = mapPoint(box.x + box.w, box.y + box.h);
    const cropW = Math.max(1, Math.round(bottomRight.x - topLeft.x));
    const cropH = Math.max(1, Math.round(bottomRight.y - topLeft.y));

    // Render full (rotated) source image to an offscreen canvas first
    const rad = (rotation * Math.PI) / 180;
    const srcCanvas = document.createElement('canvas');
    const diag = Math.sqrt(img.naturalWidth ** 2 + img.naturalHeight ** 2);
    srcCanvas.width = diag;
    srcCanvas.height = diag;
    const sctx = srcCanvas.getContext('2d');
    sctx.translate(diag / 2, diag / 2);
    sctx.rotate(rad);
    sctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    // Since rotation changes coordinate mapping in a complex way for crop box
    // selection (which is based on unrotated display), we keep rotation as a
    // pre-crop transform applied to the whole image, and treat the crop box
    // mapping against the unrotated displayed image for predictable results.
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = cropW;
    finalCanvas.height = cropH;
    const ctx = finalCanvas.getContext('2d');

    if (circleCrop) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cropW / 2, cropH / 2, Math.min(cropW, cropH) / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    if (rotation === 0) {
      ctx.drawImage(img, topLeft.x, topLeft.y, cropW, cropH, 0, 0, cropW, cropH);
    } else {
      // Draw from the rotated offscreen canvas using the same proportional region
      const offsetX = (diag - img.naturalWidth) / 2;
      const offsetY = (diag - img.naturalHeight) / 2;
      ctx.drawImage(
        srcCanvas,
        topLeft.x + offsetX,
        topLeft.y + offsetY,
        cropW,
        cropH,
        0,
        0,
        cropW,
        cropH
      );
    }

    if (circleCrop) ctx.restore();

    const mime = file?.type === 'image/png' || circleCrop ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(finalCanvas, mime, mime === 'image/jpeg' ? 0.92 : undefined);
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
  }, [img, stageSize, box, zoom, rotation, circleCrop, file, track]);

  const handleDownload = () => {
    if (resultBlob && file) downloadBlob(resultBlob, `cropped-${file.name}`);
  };

  const handleReset = () => {
    setFile(null);
    setImg(null);
    setResultUrl(null);
    setResultBlob(null);
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <DropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drag & drop an image here, or click to browse"
          hint="Crop, rotate, zoom, and create circular crops entirely in your browser."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Aspect:</span>
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => applyAspect(a.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  aspect === a.value ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted/60'
                }`}
              >
                {a.label}
              </button>
            ))}
            <label className="flex items-center gap-2 text-xs ml-2">
              <input
                type="checkbox"
                checked={circleCrop}
                onChange={(e) => setCircleCrop(e.target.checked)}
                className="rounded border-border focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              Circle crop
            </label>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset"
              className="ml-auto p-2 rounded-lg hover:bg-muted/60 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={stageRef}
            className="relative mx-auto overflow-hidden rounded-xl border border-border bg-muted/30 select-none touch-none"
            style={{ width: stageSize.w, height: stageSize.h }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img?.src}
              alt="To crop"
              className="absolute inset-0 pointer-events-none"
              style={{
                width: stageSize.w,
                height: stageSize.h,
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
              draggable={false}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label="Crop selection box, drag to move"
              onPointerDown={(e) => startDrag(e, 'move')}
              className={`absolute border-2 border-brand-500 cursor-move focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
                circleCrop ? 'rounded-full' : ''
              }`}
              style={{ left: box.x, top: box.y, width: box.w, height: box.h, background: 'rgba(99,102,241,0.1)' }}
            >
              {['nw', 'ne', 'sw', 'se'].map((corner) => (
                <div
                  key={corner}
                  role="button"
                  tabIndex={-1}
                  aria-label={`Resize handle ${corner}`}
                  onPointerDown={(e) => startDrag(e, 'resize', corner)}
                  className="absolute w-3 h-3 bg-brand-500 rounded-full border border-white"
                  style={{
                    top: corner.includes('n') ? -6 : undefined,
                    bottom: corner.includes('s') ? -6 : undefined,
                    left: corner.includes('w') ? -6 : undefined,
                    right: corner.includes('e') ? -6 : undefined,
                    cursor: `${corner}-resize`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="zoom-slider" className="flex items-center justify-between text-sm font-medium">
                <span>Zoom</span>
                <span className="text-muted-foreground">{zoom.toFixed(2)}x</span>
              </label>
              <input
                id="zoom-slider"
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="rotate-slider" className="flex items-center justify-between text-sm font-medium">
                <span>Rotate</span>
                <span className="text-muted-foreground">{rotation}°</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => rotateBy(-90)}
                  aria-label="Rotate left 90 degrees"
                  className="p-2 rounded-lg border border-border hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <input
                  id="rotate-slider"
                  type="range"
                  min="0"
                  max="359"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  className="flex-1 accent-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded"
                />
                <button
                  type="button"
                  onClick={() => rotateBy(90)}
                  aria-label="Rotate right 90 degrees"
                  className="p-2 rounded-lg border border-border hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCropExport}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            Crop & Download
          </button>

          {resultUrl && (
            <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Cropped result" className="w-20 h-20 object-contain rounded-lg border border-border bg-background" />
              <div className="flex-1">
                <p className="text-sm font-medium">Crop ready</p>
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
