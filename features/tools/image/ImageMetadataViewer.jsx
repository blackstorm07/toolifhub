'use client';

import { useState, useCallback, useRef } from 'react';
import { Copy, Download, MapPin, Check } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import { loadImage, downloadBlob, formatBytes } from './_shared/utils';

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-right truncate max-w-[60%]">{String(value)}</span>
    </div>
  );
}

export default function ImageMetadataViewer() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [basics, setBasics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('image-metadata-viewer', 'Image Metadata Viewer');
      trackedRef.current = true;
    }
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      const f = files[0];
      if (!f) return;
      track();
      setFile(f);
      setLoading(true);
      setMeta(null);
      setCopied(false);

      try {
        const img = await loadImage(f);
        setBasics({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: f.type || 'unknown',
          size: f.size,
        });

        const exifr = (await import('exifr')).default;
        const data = await exifr.parse(f, { tiff: true, xmp: true, icc: true, iptc: true, gps: true }).catch(() => null);
        setMeta(data || {});
      } catch {
        setMeta({});
      } finally {
        setLoading(false);
      }
    },
    [track]
  );

  const gps = meta && meta.latitude && meta.longitude ? { lat: meta.latitude, lng: meta.longitude } : null;

  const buildExportObject = () => ({
    file: { name: file?.name, size: file?.size, type: file?.type },
    dimensions: basics ? { width: basics.width, height: basics.height } : null,
    exif: meta || {},
  });

  const handleCopy = async () => {
    track();
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildExportObject(), null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadJson = () => {
    track();
    const blob = new Blob([JSON.stringify(buildExportObject(), null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${(file?.name || 'image').replace(/\.[^/.]+$/, '')}-metadata.json`);
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <DropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drag & drop an image here, or click to browse"
          hint="Extracts EXIF, IPTC, XMP, and GPS metadata locally — nothing leaves your browser."
        />
      ) : (
        <div className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Reading metadata…</p>}

          {!loading && meta && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-sm font-semibold mb-2">File &amp; Dimensions</p>
                  <InfoRow label="File name" value={file.name} />
                  <InfoRow label="File size" value={formatBytes(basics?.size)} />
                  <InfoRow label="Dimensions" value={basics ? `${basics.width} × ${basics.height}px` : null} />
                  <InfoRow label="Format" value={basics?.format} />
                  <InfoRow label="Resolution (DPI)" value={meta.XResolution ? `${meta.XResolution} dpi` : null} />
                  <InfoRow label="Color profile" value={meta.ColorSpace || meta.ProfileDescription} />
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-sm font-semibold mb-2">Camera</p>
                  <InfoRow label="Make" value={meta.Make} />
                  <InfoRow label="Model" value={meta.Model} />
                  <InfoRow label="Lens" value={meta.LensModel} />
                  <InfoRow label="Exposure" value={meta.ExposureTime ? `1/${Math.round(1 / meta.ExposureTime)}s` : null} />
                  <InfoRow label="ISO" value={meta.ISO} />
                  <InfoRow label="Focal length" value={meta.FocalLength ? `${meta.FocalLength}mm` : null} />
                  <InfoRow label="Aperture" value={meta.FNumber ? `f/${meta.FNumber}` : null} />
                  <InfoRow label="Date taken" value={meta.DateTimeOriginal ? new Date(meta.DateTimeOriginal).toLocaleString() : null} />
                </div>
              </div>

              {gps && (
                <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">GPS Location</p>
                    <p className="text-xs text-muted-foreground">
                      {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View on map
                  </a>
                </div>
              )}

              {Object.keys(meta).length === 0 && (
                <p className="text-sm text-muted-foreground p-4 rounded-xl border border-border bg-muted/20">
                  No EXIF/IPTC/XMP metadata was found in this image.
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy metadata as JSON'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <Download className="w-4 h-4" /> Download as JSON
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
