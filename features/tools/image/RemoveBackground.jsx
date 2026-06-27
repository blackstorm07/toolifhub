'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { trackToolUsage } from '@/lib/analytics';
import DropZone from './_shared/DropZone';
import ProgressBar from './_shared/ProgressBar';
import { downloadBlob, replaceExtension } from './_shared/utils';

function checkSupport() {
  if (typeof window === 'undefined') return false;
  // WebAssembly is the only hard requirement — @imgly/background-removal runs
  // single-threaded (slower) without SharedArrayBuffer/cross-origin isolation,
  // but it does not fail. Requiring SAB here was over-strict and caused the
  // tool to report "unsupported" on browsers (including current Chrome) that
  // simply aren't cross-origin isolated.
  return typeof WebAssembly === 'object';
}

function checkFastPath() {
  if (typeof window === 'undefined') return false;
  return window.crossOriginIsolated === true && typeof SharedArrayBuffer !== 'undefined';
}

export default function RemoveBackground() {
  const isSupported = useMemo(() => checkSupport(), []);
  const isFastPath = useMemo(() => checkFastPath(), []);
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const trackedRef = useRef(false);

  const track = useCallback(() => {
    if (!trackedRef.current) {
      trackToolUsage('remove-background', 'Remove Background');
      trackedRef.current = true;
    }
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      const f = files[0];
      if (!f) return;
      track();
      setFile(f);
      setOriginalUrl(URL.createObjectURL(f));
      setResultUrl(null);
      setResultBlob(null);
      setProgress(0);
      setStatus('processing');
      setErrorMsg('');

      try {
        const { removeBackground } = await import('@imgly/background-removal');
        const blob = await removeBackground(f, {
          progress: (key, current, total) => {
            if (total > 0) setProgress(Math.round((current / total) * 100));
          },
        });
        setResultBlob(blob);
        setResultUrl(URL.createObjectURL(blob));
        setStatus('done');
      } catch (err) {
        setErrorMsg(err?.message || 'Failed to remove background.');
        setStatus('error');
      }
    },
    [track]
  );

  const handleDownload = () => {
    if (resultBlob && file) downloadBlob(resultBlob, replaceExtension(file.name, 'png'));
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setProgress(0);
    setStatus('idle');
    setErrorMsg('');
  };

  if (!isSupported) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-border bg-muted/20 text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto" />
        <p className="font-medium">Your browser doesn&apos;t support this tool</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Background removal requires WebAssembly and SharedArrayBuffer support, which is unavailable in
          this browser or context (some privacy modes and older browsers disable it). Please try the
          latest version of Chrome, Edge, or Firefox.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!file ? (
        <DropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drag & drop an image here, or click to browse"
          hint={
            isFastPath
              ? 'AI background removal runs fully in your browser — nothing is uploaded.'
              : 'AI background removal runs fully in your browser — nothing is uploaded. (Running in compatibility mode; processing may be slower on this page.)'
          }
        />
      ) : (
        <div className="space-y-4">
          {status === 'processing' && (
            <ProgressBar value={progress} label="Removing background…" />
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Original</p>
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalUrl} alt="Original" className="w-full h-auto object-contain max-h-80" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Result</p>
              <div
                className="rounded-xl border border-border overflow-hidden flex items-center justify-center min-h-[120px]"
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(#80808022 0% 25%, transparent 0% 50%)',
                  backgroundSize: '20px 20px',
                }}
              >
                {resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Background removed" className="w-full h-auto object-contain max-h-80" />
                ) : (
                  <p className="text-xs text-muted-foreground p-6">Processing…</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resultBlob && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
