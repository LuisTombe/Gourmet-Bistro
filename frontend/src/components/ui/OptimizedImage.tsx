import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

/**
 * Convierte URLs de imágenes (Unsplash / CDN) a variantes AVIF y WebP con <picture> y fallback,
 * aplica lazy loading fuera de pantalla y fija dimensiones explícitas (width/height) para CLS = 0.
 */
function buildFormatUrl(rawUrl: string, format: 'avif' | 'webp', width: number): string {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('fm', format);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '78');
      url.searchParams.set('fit', 'crop');
      return url.toString();
    }
  } catch {
    // URL local o relativa
  }
  return rawUrl;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(
  ({ src, alt, width, height, priority = false, className = '', ...rest }) => {
    const avifSrc = buildFormatUrl(src, 'avif', width);
    const webpSrc = buildFormatUrl(src, 'webp', width);

    return (
      <picture className="block w-full h-full">
        <source srcSet={avifSrc} type="image/avif" />
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={className}
          {...rest}
        />
      </picture>
    );
  }
);

