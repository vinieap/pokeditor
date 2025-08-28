import { useEffect, useState, Suspense } from 'react';
import type { ReactNode } from 'react';
import { useNavigation } from 'react-router';

interface ProgressiveLoaderProps {
  children: ReactNode;
  fallback: ReactNode;
  delay?: number;
  showProgress?: boolean;
}

export function ProgressiveLoader({
  children,
  fallback,
  delay = 200,
  showProgress = true
}: ProgressiveLoaderProps) {
  const [showFallback, setShowFallback] = useState(false);
  const navigation = useNavigation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  const isLoading = navigation.state === 'loading';
  
  if (isLoading && showProgress) {
    return (
      <>
        {showFallback && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-blue-600 animate-pulse" />
          </div>
        )}
        <Suspense fallback={showFallback ? fallback : null}>
          {children}
        </Suspense>
      </>
    );
  }
  
  return (
    <Suspense fallback={showFallback ? fallback : null}>
      {children}
    </Suspense>
  );
}

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  onLoad,
  onError
}: LazyImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isInView, setIsInView] = useState(loading === 'eager');
  
  useEffect(() => {
    if (loading === 'eager' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }
    
    const img = document.querySelector(`img[data-src="${src}"]`);
    if (!img) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    observer.observe(img);
    
    return () => observer.disconnect();
  }, [src, loading]);
  
  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };
  
  const handleError = () => {
    setImageState('error');
    onError?.();
  };
  
  if (!isInView) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
        style={{ width, height }}
        data-src={src}
      />
    );
  }
  
  return (
    <>
      {imageState === 'loading' && (
        <div
          className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${imageState === 'loading' ? 'hidden' : ''}`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
      {imageState === 'error' && (
        <div
          className={`bg-red-100 dark:bg-red-900 flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <span className="text-red-600 dark:text-red-400 text-sm">Failed to load</span>
        </div>
      )}
    </>
  );
}

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  useEffect(() => {
    const container = document.querySelector('.virtual-list-container');
    if (!container) return;
    
    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };
    
    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };
    
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div
      className={`virtual-list-container overflow-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}