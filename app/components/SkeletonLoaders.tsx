import { cn } from '~/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <Skeleton className="w-24 h-24 mx-auto mb-3 rounded-lg" />
      <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-3 w-1/2 mx-auto mb-3" />
      <div className="flex justify-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function PokemonDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="w-64 h-64 mx-auto rounded-lg" />
            <Skeleton className="h-8 w-48 mx-auto mt-4" />
            <Skeleton className="h-4 w-32 mx-auto mt-2" />
          </div>
          
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-24 mb-3" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            </div>
            
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton className="h-4 w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t dark:border-gray-700">
              {[...Array(cols)].map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(count)].map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}