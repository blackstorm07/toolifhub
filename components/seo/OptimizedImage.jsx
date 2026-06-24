import Image from 'next/image';

export default function OptimizedImage({
  src,
  alt,
  width = 1200,
  height = 630,
  className = '',
  priority = false,
  fill = false,
  sizes,
}) {
  if (!src) return null;

  const isLocal = src.startsWith('/') && !src.startsWith('//');
  const isRemote = src.startsWith('http');

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt || ''}
        fill
        className={className}
        loading={priority ? undefined : 'lazy'}
        priority={priority}
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
        unoptimized={!isLocal && !isRemote}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      className={className}
      loading={priority ? undefined : 'lazy'}
      priority={priority}
      unoptimized={!isLocal && !isRemote}
    />
  );
}
