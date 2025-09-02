import { useMemo } from 'react';
import { getTypeColor } from '~/lib/utils/typeColors';
import type { PokemonData, Move } from '~/lib/types-v2';

/**
 * Memoized selector hooks for expensive computations
 */

/**
 * Memoize type colors for a Pokemon or Move
 */
export function useTypeColors(types: string[]) {
  return useMemo(() => 
    types.filter(Boolean).map(type => getTypeColor(type)),
    [types]
  );
}

/**
 * Memoize Pokemon stats calculations
 */
export function usePokemonStats(pokemon: PokemonData) {
  return useMemo(() => {
    const stats = pokemon.stats;
    const total = Object.values(stats).reduce((sum, val) => sum + (val || 0), 0);
    const maxStat = Math.max(...Object.values(stats));
    const minStat = Math.min(...Object.values(stats));
    
    return {
      total,
      maxStat,
      minStat,
      average: Math.round(total / Object.keys(stats).length),
      statEntries: Object.entries(stats).map(([key, value]) => ({
        key,
        value,
        percentage: (value / maxStat) * 100
      }))
    };
  }, [pokemon.stats]);
}

/**
 * Memoize move power/accuracy display values
 */
export function useMoveDisplayValues(move: Move) {
  return useMemo(() => ({
    powerDisplay: move.power > 0 ? move.power : '—',
    accuracyDisplay: move.accuracy > 0 ? `${move.accuracy}%` : '—',
    priorityDisplay: move.priority > 0 ? `+${move.priority}` : move.priority.toString(),
    effectChanceDisplay: move.effectChance > 0 ? `${move.effectChance}%` : null
  }), [move.power, move.accuracy, move.priority, move.effectChance]);
}

/**
 * Memoize filtered and sorted arrays
 */
export function useFilteredData<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number
) {
  return useMemo(() => {
    let filtered = data.filter(filterFn);
    if (sortFn) {
      filtered = filtered.sort(sortFn);
    }
    return filtered;
  }, [data, filterFn, sortFn]);
}

/**
 * Memoize search results
 */
export function useSearchResults<T>(
  data: T[],
  searchTerm: string,
  searchFields: (item: T) => string[]
) {
  return useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const normalizedSearch = searchTerm.toLowerCase();
    return data.filter(item => 
      searchFields(item).some(field => 
        field.toLowerCase().includes(normalizedSearch)
      )
    );
  }, [data, searchTerm, searchFields]);
}