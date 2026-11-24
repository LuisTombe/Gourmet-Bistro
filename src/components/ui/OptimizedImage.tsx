import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = '/assets/dishes/entradas.svg';

/**
 * Componente de imagen optimizado para Intranet (IPv4 local) y Web:
 * - Si la ruta es local (.svg, /assets/...) sirve directamente <img> con lazy loading y 0 peticiones externas.
 * - Si es un CDN externo compatible (Unsplash), negocia AVIF/WebP comprimido.
 * - Incluye fallback automático ante fallo de red o bloqueo de intranet para evitar iconos de imagen rota.
 */
function buildFormatUrl(rawUrl: string, format: 'avif' | 'webp', width: number): string {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('fm', format);
      url.searchParams.set('w', String(Math.min(width, 360)));
      url.searchParams.set('q', '60');
      url.searchParams.set('fit', 'crop');
      return url.toString();
    }
  } catch {
    // URL local o relativa
  }
  return rawUrl;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(
  ({
    src,
    alt,
    width,
    height,
    priority = false,
    className = '',
    fallbackSrc = DEFAULT_FALLBACK,
    ...rest
  }) => {
    const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

    useEffect(() => {
      setCurrentSrc(src || fallbackSrc);
    }, [src, fallbackSrc]);

    const isLocalOrSvg =
      currentSrc.startsWith('/') ||
      currentSrc.startsWith('data:') ||
      currentSrc.endsWith('.svg');

    const handleError = () => {
      if (currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    };

    if (isLocalOrSvg) {
      return (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={handleError}
          className={className}
          {...rest}
        />
      );
    }

    const avifSrc = buildFormatUrl(currentSrc, 'avif', width);
    const webpSrc = buildFormatUrl(currentSrc, 'webp', width);

    return (
      <picture className="block w-full h-full">
        <source srcSet={avifSrc} type="image/avif" />
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={handleError}
          className={className}
          {...rest}
        />
      </picture>
    );
  }
);
