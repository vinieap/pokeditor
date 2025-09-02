import { useState, useEffect, useRef } from 'react';
import { getPokemonIdByName } from '~/lib/pokemon-id-map';
import { getItemSpriteName } from '~/lib/item-sprite-mappings';

interface OptimizedSpriteProps {
  id: string | number;
  alt: string;
  type?: 'pokemon' | 'item' | 'trainer';
  size?: 48 | 96 | 192;
  loading?: 'lazy' | 'eager';
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Centralized optimized sprite URL generator
 */
export function getSpriteUrl(
  id: string | number,
  type: 'pokemon' | 'item' | 'trainer' = 'pokemon',
  size: number = 96,
  format: 'webp' | 'png' | 'avif' = 'webp'
): string {
  switch (type) {
    case 'pokemon':
      return `/sprites/optimized/pokemon/${size}/${format}/${id}.${format}`;
    case 'item':
      // Items use the regular sprite path for now
      const itemName = typeof id === 'string' ? getItemSpriteName(id) : id;
      return `/sprites/items/${itemName}.png`;
    case 'trainer':
      const cleanName = typeof id === 'string' ? id.toLowerCase().replace(/[^a-z0-9]/g, '') : id;
      return `/sprites/trainers/${cleanName}.png`;
    default:
      return '/sprites/unknown.png';
  }
}

/**
 * Get sprite URLs with fallback strategy
 */
export function getSpriteWithFallback(
  id: string | number,
  type: 'pokemon' | 'item' | 'trainer' = 'pokemon',
  size: number = 96
): string[] {
  if (type === 'pokemon') {
    return [
      getSpriteUrl(id, type, size, 'webp'),
      getSpriteUrl(id, type, size, 'png'),
      `/sprites/pokemon/${id}.png`, // Legacy fallback
      '/sprites/unknown.png'
    ];
  }
  
  // For items and trainers, use existing paths for now
  return [
    getSpriteUrl(id, type, size),
    '/sprites/unknown.png'
  ];
}

/**
 * Optimized sprite component with progressive loading and modern formats
 */
export function OptimizedSprite({
  id,
  alt,
  type = 'pokemon',
  size = 96,
  loading = 'lazy',
  className = '',
  priority = false,
  onLoad,
  onError
}: OptimizedSpriteProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('/sprites/unknown.png');
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(loading === 'eager' || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || priority || !('IntersectionObserver' in window)) {
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
      { rootMargin: '50px' } // Start loading before coming into view
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [loading, priority]);
  
  // Progressive image loading
  useEffect(() => {
    if (!isInView) return;
    
    const sources = getSpriteWithFallback(id, type, size);
    let currentSourceIndex = 0;
    
    const tryNextSource = () => {
      if (currentSourceIndex >= sources.length) {
        setCurrentSrc('/sprites/unknown.png');
        setIsLoading(false);
        onError?.();
        return;
      }
      
      const img = new Image();
      const sourceUrl = sources[currentSourceIndex];
      
      img.onload = () => {
        setCurrentSrc(sourceUrl);
        setIsLoading(false);
        onLoad?.();
      };
      
      img.onerror = () => {
        currentSourceIndex++;
        tryNextSource();
      };
      
      img.src = sourceUrl;
    };
    
    tryNextSource();
  }, [id, type, size, isInView, onLoad, onError]);
  
  // Show skeleton while not in view or loading
  if (!isInView || isLoading) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`}
        style={{ width: size, height: size }}
        aria-label={`Loading ${alt}`}
      />
    );
  }
  
  // For Pokemon, use picture element with modern formats
  if (type === 'pokemon') {
    const availableSizes = [48, 96, 192];
    const has2x = availableSizes.includes(size * 2);
    
    return (
      <picture>
        {/* AVIF - Best compression */}
        <source
          type="image/avif"
          srcSet={has2x ? `
            ${getSpriteUrl(id, type, size, 'avif')} 1x,
            ${getSpriteUrl(id, type, size * 2, 'avif')} 2x
          `.trim() : getSpriteUrl(id, type, size, 'avif')}
        />
        
        {/* WebP - Good compression, wide support */}
        <source
          type="image/webp"
          srcSet={has2x ? `
            ${getSpriteUrl(id, type, size, 'webp')} 1x,
            ${getSpriteUrl(id, type, size * 2, 'webp')} 2x
          `.trim() : getSpriteUrl(id, type, size, 'webp')}
        />
        
        {/* PNG fallback */}
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={has2x ? `
            ${getSpriteUrl(id, type, size, 'png')} 1x,
            ${getSpriteUrl(id, type, size * 2, 'png')} 2x
          `.trim() : getSpriteUrl(id, type, size, 'png')}
          alt={alt}
          width={size}
          height={size}
          loading={loading}
          className={className}
        />
      </picture>
    );
  }
  
  // For items and trainers, use regular img element
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      width={size}
      height={size}
      loading={loading}
      className={className}
    />
  );
}

/**
 * Pokemon-specific optimized sprite component
 */
export function OptimizedPokemonSprite({ 
  id,
  name, 
  className = "w-24 h-24", 
  size = 96,
  priority = false,
  onLoad,
  onError
}: { 
  id: string | number;
  name: string; 
  className?: string;
  size?: 48 | 96 | 192;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}) {
  // Convert internal name to ID if needed
  const pokemonId = typeof id === 'string' ? (getPokemonIdByName(id) || id) : id;
  
  return (
    <OptimizedSprite
      id={pokemonId}
      type="pokemon"
      alt={name}
      size={size}
      className={className}
      priority={priority}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

/**
 * Item-specific optimized sprite component
 */
export function OptimizedItemSprite({ 
  internalName, 
  name, 
  className = "w-8 h-8",
  size = 48
}: { 
  internalName: string; 
  name: string; 
  className?: string;
  size?: number;
}) {
  return (
    <OptimizedSprite
      id={internalName}
      type="item"
      alt={name}
      size={size as any}
      className={className}
    />
  );
}

/**
 * Trainer-specific optimized sprite component
 */
export function OptimizedTrainerSprite({ 
  internalName, 
  name, 
  className = "w-16 h-16",
  size = 96
}: { 
  internalName: string; 
  name: string; 
  className?: string;
  size?: number;
}) {
  return (
    <OptimizedSprite
      id={internalName}
      type="trainer"
      alt={name}
      size={size as any}
      className={className}
    />
  );
}