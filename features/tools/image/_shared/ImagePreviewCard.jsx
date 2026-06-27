'use client';

import { Download, X, ImageIcon } from 'lucide-react';
import { formatBytes } from './utils';
import ProgressBar from './ProgressBar';

export default function ImagePreviewCard({
  filename,
  thumbnailUrl,
  originalSize,
  resultSize,
  progress,
  onDownload,
  onRemove,
  status,
  extra,
}) {
  const hasReduction =
    typeof originalSize === 'number' &&
    typeof resultSize === 'number' &&
    originalSize > 0;
  const reductionPct = hasReduction
    ? Math.round((1 - resultSize / originalSize) * 100)
    : null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
      <div className="w-14 h-14 rounded-lg bg-muted/40 border border-border flex items-center justify-center overflow-hidden shrink-0">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt={filename || 'preview'} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{filename}</p>
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
          {typeof originalSize === 'number' && <span>{formatBytes(originalSize)}</span>}
          {hasReduction && (
            <>
              <span aria-hidden="true">&rarr;</span>
              <span>{formatBytes(resultSize)}</span>
              {reductionPct !== null && reductionPct !== 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    reductionPct > 0
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-orange-500/10 text-orange-600'
                  }`}
                >
                  {reductionPct > 0 ? `-${reductionPct}%` : `+${Math.abs(reductionPct)}%`}
                </span>
              )}
            </>
          )}
        </div>
        {extra && <div className="mt-1">{extra}</div>}
        {typeof progress === 'number' && progress >= 0 && progress < 100 && (
          <div className="mt-2">
            <ProgressBar value={progress} />
          </div>
        )}
        {status && <p className="text-xs text-muted-foreground mt-1">{status}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            aria-label={`Download ${filename}`}
            className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${filename}`}
            className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
