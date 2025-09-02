import { useState, useEffect, useRef } from 'react';

interface SpriteImageProps {
  id: string;
  alt: string;
  size?: 48 | 96 | 192;
  loading?: 'lazy' | 'eager';
  fallback?: string;
  className?: string;
}

export function ResponsiveSpriteImage({
  id,
  alt,
  size = 96,
  loading = 'lazy',
  fallback = '/sprites/unknown.png',
  className = ''
}: SpriteImageProps) {
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (loading === 'eager' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [loading]);
  
  if (error) {
    return (
      <img
        ref={imgRef}
        src={fallback}
        alt={alt}
        width={size}
        height={size}
        className={className}
      />
    );
  }
  
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`${className} sprite-skeleton`}
        style={{ width: size, height: size }}
        aria-label={alt}
      />
    );
  }
  
  // Only use 2x images if the next size up exists (48->96, 96->192, but not 192->384)
  const availableSizes = [48, 96, 192];
  const has2x = availableSizes.includes(size * 2);

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={has2x ? `
          /sprites/optimized/pokemon/${size}/avif/${id}.avif 1x,
          /sprites/optimized/pokemon/${size * 2}/avif/${id}.avif 2x
        `.trim() : `/sprites/optimized/pokemon/${size}/avif/${id}.avif`}
      />
      <source
        type="image/webp"
        srcSet={has2x ? `
          /sprites/optimized/pokemon/${size}/webp/${id}.webp 1x,
          /sprites/optimized/pokemon/${size * 2}/webp/${id}.webp 2x
        `.trim() : `/sprites/optimized/pokemon/${size}/webp/${id}.webp`}
      />
      <img
        ref={imgRef}
        src={`/sprites/optimized/pokemon/${size}/png/${id}.png`}
        srcSet={has2x ? `
          /sprites/optimized/pokemon/${size}/png/${id}.png 1x,
          /sprites/optimized/pokemon/${size * 2}/png/${id}.png 2x
        `.trim() : `/sprites/optimized/pokemon/${size}/png/${id}.png`}
        alt={alt}
        width={size}
        height={size}
        loading={loading}
        onError={() => setError(true)}
        className={className}
      />
    </picture>
  );
}

