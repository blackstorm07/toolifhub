'use client';

import { useState } from 'react';
import Image from 'next/image';

const FALLBACK_SRC = '/og-image.svg';

export default function OptimizedImage({
  src,
  alt,
  width = 1200,
  height = 630,
  className = '',
  priority = false,
  fill = false,
  sizes,
  fallbackSrc = FALLBACK_SRC,
}) {
  const [failed, setFailed] = useState(false);

  if (!src) return null;

  const resolvedSrc = failed ? fallbackSrc : src;
  const isLocal = resolvedSrc.startsWith('/') && !resolvedSrc.startsWith('//');
  const isRemote = resolvedSrc.startsWith('http');
  const handleError = () => {
    if (!failed) setFailed(true);
  };

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt || ''}
        fill
        className={className}
        loading={priority ? undefined : 'lazy'}
        priority={priority}
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
        unoptimized={!isLocal && !isRemote}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt || ''}
      width={width}
      height={height}
      className={className}
      loading={priority ? undefined : 'lazy'}
      priority={priority}
      unoptimized={!isLocal && !isRemote}
      onError={handleError}
    />
  );
}
