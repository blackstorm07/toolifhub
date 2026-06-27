'use client';

import { useState, useCallback, useRef } from 'react';
import { Download, ShieldCheck, RefreshCw } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import { loadImage, canvasToBlob, downloadBlob, formatBytes } from './_shared/utils';

export default function RemoveExif() {
  const [file, setFile] = useState(null);
  const [hadMetadata, setHadMetadata] = useState(null);
  const [metaCount, setMetaCount] = useState(0);
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('remove-exif', 'Remove EXIF Data');
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
      setResultBlob(null);
      setResultUrl(null);

      try {
        const exifr = (await import('exifr')).default;
        const data = await exifr.parse(f, { tiff: true, xmp: true, icc: true, iptc: true, gps: true }).catch(() => null);
        const count = data ? Object.keys(data).length : 0;
        setHadMetadata(count > 0);
        setMetaCount(count);

        const img = await loadImage(f);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        const isPng = f.type === 'image/png';
        if (!isPng) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const mime = isPng ? 'image/png' : 'image/jpeg';
        const blob = await canvasToBlob(canvas, mime, isPng ? undefined : 0.92);
        setResultBlob(blob);
        setResultUrl(URL.createObjectURL(blob));
      } finally {
        setLoading(false);
      }
    },
    [track]
  );

  const handleDownload = () => {
    if (resultBlob && file) downloadBlob(resultBlob, `clean-${file.name}`);
  };

  const handleReset = () => {
    setFile(null);
    setHadMetadata(null);
    setMetaCount(0);
    setResultBlob(null);
    setResultUrl(null);
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          This tool re-encodes your image on a fresh canvas, which strips all EXIF, IPTC, XMP, and GPS
          metadata — including camera details and location data — before you download it. Processing
          happens entirely in your browser.
        </p>
      </div>

      {!file ? (
        <DropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drag & drop an image here, or click to browse"
          hint="Remove hidden metadata from your photos before sharing them."
        />
      ) : (
        <div className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Processing…</p>}

          {!loading && resultUrl && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1">
                  <p className="text-sm font-semibold">Before</p>
                  <p className="text-xs text-muted-foreground">{file.name} · {formatBytes(file.size)}</p>
                  <p className={`text-xs font-medium ${hadMetadata ? 'text-orange-600' : 'text-green-600'}`}>
                    {hadMetadata ? `Contains metadata (${metaCount} fields)` : 'No metadata detected'}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1">
                  <p className="text-sm font-semibold">After</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(resultBlob?.size || 0)}</p>
                  <p className="text-xs font-medium text-green-600">Metadata removed</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <Download className="w-4 h-4" /> Download Clean File
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
