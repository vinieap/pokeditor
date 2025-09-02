import { memo } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
}

/**
 * Base skeleton loader component with configurable dimensions and styling
 */
export const Skeleton = memo(({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  rounded = 'md'
}: SkeletonProps) => {
  const roundedClass = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }[rounded];

  return (
    <div 
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${width} ${height} ${roundedClass} ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}
    />
  );
});

/**
 * Skeleton loader for Pokemon cards in grid view
 */
export const PokemonCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="flex items-center space-x-4">
      {/* Pokemon Sprite Placeholder */}
      <div className="flex-shrink-0">
        <Skeleton width="w-20" height="h-20" rounded="md" />
      </div>

      {/* Pokemon Info Placeholder */}
      <div className="flex-1 space-y-2">
        {/* ID and Name */}
        <div className="flex items-center space-x-2">
          <Skeleton width="w-12" height="h-4" />
          <Skeleton width="w-24" height="h-5" />
        </div>

        {/* Types */}
        <div className="flex space-x-2">
          <Skeleton width="w-16" height="h-6" rounded="md" />
          <Skeleton width="w-16" height="h-6" rounded="md" />
        </div>

        {/* Base Stats Grid */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          <Skeleton width="w-full" height="h-3" />
          <Skeleton width="w-full" height="h-3" />
          <Skeleton width="w-full" height="h-3" />
          <Skeleton width="w-full" height="h-3" />
          <Skeleton width="w-full" height="h-3" />
          <Skeleton width="w-full" height="h-3" />
        </div>
      </div>
    </div>
  </div>
));

/**
 * Skeleton loader for Move cards in grid view
 */
export const MoveCardSkeleton = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
    {/* Header with name and icon */}
    <div className="flex justify-between items-start mb-2">
      <Skeleton width="w-32" height="h-5" />
      <Skeleton width="w-8" height="h-8" rounded="md" />
    </div>
    
    {/* Type and Category badges */}
    <div className="flex gap-2 mb-3">
      <Skeleton width="w-16" height="h-6" rounded="md" />
      <Skeleton width="w-20" height="h-6" rounded="md" />
    </div>
    
    {/* Stats grid */}
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div className="space-y-1">
        <Skeleton width="w-12" height="h-3" />
        <Skeleton width="w-8" height="h-4" />
      </div>
      <div className="space-y-1">
        <Skeleton width="w-16" height="h-3" />
        <Skeleton width="w-10" height="h-4" />
      </div>
      <div className="space-y-1">
        <Skeleton width="w-6" height="h-3" />
        <Skeleton width="w-6" height="h-4" />
      </div>
    </div>
    
    {/* Description */}
    <div className="space-y-1">
      <Skeleton width="w-full" height="h-3" />
      <Skeleton width="w-3/4" height="h-3" />
    </div>
  </div>
));

/**
 * Skeleton loader for Move list items
 */
export const MoveListItemSkeleton = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center gap-4">
      {/* Icon placeholder */}
      <Skeleton width="w-12" height="h-12" rounded="md" />
      
      {/* Move info */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width="w-32" height="h-5" />
          <Skeleton width="w-16" height="h-6" rounded="md" />
          <Skeleton width="w-20" height="h-6" rounded="md" />
        </div>
        <Skeleton width="w-full" height="h-4" />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-1">
          <Skeleton width="w-12" height="h-3" />
          <Skeleton width="w-8" height="h-4" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton width="w-8" height="h-3" />
          <Skeleton width="w-10" height="h-4" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton width="w-6" height="h-3" />
          <Skeleton width="w-6" height="h-4" />
        </div>
      </div>
    </div>
  </div>
));

/**
 * Skeleton loader for Pokemon list items (used in various places)
 */
export const PokemonListItemSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center gap-4">
      {/* Sprite placeholder */}
      <Skeleton width="w-16" height="h-16" rounded="md" />
      
      {/* Pokemon info */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width="w-12" height="h-4" />
          <Skeleton width="w-24" height="h-5" />
        </div>
        <div className="flex gap-2">
          <Skeleton width="w-16" height="h-6" rounded="md" />
          <Skeleton width="w-16" height="h-6" rounded="md" />
        </div>
      </div>
      
      {/* Stats preview */}
      <div className="text-right space-y-1">
        <Skeleton width="w-16" height="h-4" />
        <Skeleton width="w-20" height="h-3" />
      </div>
    </div>
  </div>
));

/**
 * Skeleton for stats summary cards
 */
export const StatsSummarySkeleton = memo(() => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
        <Skeleton width="w-8" height="h-8" className="mx-auto mb-2" />
        <Skeleton width="w-12" height="h-7" className="mx-auto mb-1" />
        <Skeleton width="w-20" height="h-4" className="mx-auto" />
      </div>
    ))}
  </div>
));

/**
 * Skeleton for loading multiple cards in a grid
 */
export const GridSkeletonLoader = memo(({ 
  count = 12, 
  CardSkeleton = PokemonCardSkeleton 
}: { 
  count?: number;
  CardSkeleton?: React.ComponentType;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
));

/**
 * Skeleton for loading multiple items in a list
 */
export const ListSkeletonLoader = memo(({ 
  count = 10, 
  ItemSkeleton = PokemonListItemSkeleton 
}: { 
  count?: number;
  ItemSkeleton?: React.ComponentType;
}) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, index) => (
      <ItemSkeleton key={index} />
    ))}
  </div>
));

/**
 * Skeleton loader for Trainer cards
 */
export const TrainerCardSkeleton = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
    <div className="flex items-start gap-4">
      {/* Trainer avatar/type placeholder */}
      <Skeleton width="w-16" height="h-16" rounded="full" />
      
      {/* Trainer info */}
      <div className="flex-1 space-y-2">
        <Skeleton width="w-32" height="h-5" />
        <Skeleton width="w-20" height="h-4" />
        <Skeleton width="w-24" height="h-4" />
      </div>
    </div>
    
    {/* Team preview */}
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Skeleton width="w-16" height="h-4" className="mb-2" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} width="w-8" height="h-8" rounded="md" />
        ))}
      </div>
    </div>
  </div>
));

/**
 * Skeleton loader for Trainer list items
 */
export const TrainerListItemSkeleton = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center gap-4">
      {/* Trainer avatar */}
      <Skeleton width="w-12" height="h-12" rounded="full" />
      
      {/* Trainer info */}
      <div className="flex-1 space-y-1">
        <Skeleton width="w-40" height="h-5" />
        <Skeleton width="w-24" height="h-4" />
      </div>
      
      {/* Team preview */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width="w-6" height="h-6" rounded="sm" />
        ))}
      </div>
      
      {/* Battle stats */}
      <div className="text-right space-y-1">
        <Skeleton width="w-16" height="h-4" />
        <Skeleton width="w-12" height="h-3" />
      </div>
    </div>
  </div>
));

/**
 * Loading state component with optional message
 */
export const LoadingState = memo(({ 
  message = "Loading...",
  showSpinner = true 
}: {
  message?: string;
  showSpinner?: boolean;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {showSpinner && (
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
    )}
    <p className="text-gray-500 text-lg">{message}</p>
  </div>
));