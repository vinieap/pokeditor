import { useState, useMemo, memo, useCallback } from "react";
import { Link, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/pokemon._index";
import { loadPokemonData, searchPokemon } from "~/lib/data-loader-v2";
import type { PokemonData } from "~/lib/types-v2";
import { OptimizedPokemonSprite } from "~/components/OptimizedSprite";
import { getTypeColor } from "~/lib/utils/typeColors";
import { useDebouncedSearch } from "~/hooks/useDebounce";
import { Pagination, usePagination } from "~/components/Pagination";
import { 
  PokemonCardSkeleton, 
  PokemonListItemSkeleton, 
  GridSkeletonLoader, 
  ListSkeletonLoader,
  LoadingState 
} from "~/components/SkeletonLoader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pokémon Database - Pokeditor" },
    { name: "description", content: "Browse and view all Pokémon with stats, types, and abilities" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const data = await loadPokemonData(url.origin);
    
    return {
      pokemon: data?.list || []
    };
  } catch (error) {
    console.error('Failed to load Pokemon data:', error);
    return { pokemon: [] };
  }
}

export default function PokemonIndex() {
  const { pokemon } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { searchValue, debouncedSearchValue, setSearchValue, isSearching } = useDebouncedSearch('', 300);
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { currentPage, setPage, getPaginatedData } = usePagination(50);

  // Check if we're loading
  const isLoading = navigation.state === "loading";

  const types = [
    "all", "NORMAL", "FIRE", "WATER", "ELECTRIC", "GRASS", "ICE",
    "FIGHTING", "POISON", "GROUND", "FLYING", "PSYCHIC", "BUG",
    "ROCK", "GHOST", "DRAGON", "DARK", "STEEL", "FAIRY"
  ];

  const filteredPokemon = useMemo(() => {
    return pokemon.filter((p: PokemonData) => {
      const matchesSearch = debouncedSearchValue === "" || 
        (p.displayName || p.internalName).toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        p.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        p.id.toString() === debouncedSearchValue;
      
      const matchesType = selectedType === "all" || 
        p.types[0] === selectedType || 
        (p.types[1] && p.types[1] === selectedType);
      
      return matchesSearch && matchesType;
    });
  }, [pokemon, debouncedSearchValue, selectedType]);

  const paginationData = useMemo(() => 
    getPaginatedData(filteredPokemon), 
    [filteredPokemon, currentPage]
  );

  const PokemonCard = memo(({ poke }: { poke: PokemonData }) => {
    // Memoize expensive type color calculations
    const typeColors = useMemo(() => 
      poke.types.filter(Boolean).map(type => getTypeColor(type)),
      [poke.types]
    );

    return (
    <Link 
      to={`/pokemon/${poke.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 p-4"
    >
      <div className="text-center">
        <div className="relative h-24 w-24 mx-auto mb-2 flex items-center justify-center">
          <OptimizedPokemonSprite
            id={poke.id}
            name={poke.displayName || poke.name}
            size={96}
            className="w-full h-full object-contain pixelated"
          />
        </div>
        <p className="text-gray-500 text-sm">#{String(poke.id).padStart(3, '0')}</p>
        <h3 className="font-semibold text-gray-900 mb-2">{poke.displayName || poke.internalName}</h3>
        <div className="flex gap-1 justify-center flex-wrap">
          {poke.types.filter(Boolean).map((type, i) => (
            <span 
              key={i}
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: typeColors[i] }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </Link>
    );
  });

  const PokemonListItem = memo(({ poke }: { poke: PokemonData }) => (
    <Link 
      to={`/pokemon/${poke.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-center gap-4"
    >
      <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
        <OptimizedPokemonSprite
          id={poke.id}
          name={poke.displayName || poke.name}
          size={48}
          className="w-full h-full object-contain pixelated"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">#{String(poke.id).padStart(3, '0')}</span>
          <h3 className="font-semibold text-gray-900">{poke.displayName || poke.internalName}</h3>
        </div>
        <div className="flex gap-1 mt-1">
          {poke.types.filter(Boolean).map((type, i) => (
            <span 
              key={i}
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: getTypeColor(type) }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right text-sm text-gray-600">
        <div>HP: {poke.stats.hp}</div>
        <div>ATK: {poke.stats.attack}</div>
        <div>DEF: {poke.stats.defense}</div>
      </div>
    </Link>
  ));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pokémon Database</h1>
          <p className="text-gray-600">
            Found {filteredPokemon.length} of {pokemon.length} Pokémon
            {isSearching && (
              <span className="ml-2 text-blue-500 text-sm">(searching...)</span>
            )}
            {debouncedSearchValue && (
              <span className="ml-2 text-gray-500 text-sm">
                - filtered by "{debouncedSearchValue}"
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Search Pokémon by name or ID..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Type Filter */}
            <div className="min-w-[150px]">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Pokémon Grid/List */}
        {isLoading ? (
          // Show skeleton loaders while loading
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              <GridSkeletonLoader count={50} CardSkeleton={() => 
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="text-center">
                    <div className="h-24 w-24 mx-auto mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md" />
                    <div className="h-4 w-12 mx-auto mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
                    <div className="h-5 w-24 mx-auto mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
                    <div className="flex gap-1 justify-center">
                      <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
                      <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              } />
            </div>
          ) : (
            <div className="space-y-2 mb-8">
              <ListSkeletonLoader count={50} ItemSkeleton={PokemonListItemSkeleton} />
            </div>
          )
        ) : paginationData.data.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8" 
            : "space-y-2 mb-8"
          }>
            {paginationData.data.map((poke: PokemonData) => 
              viewMode === "grid" 
                ? <PokemonCard key={poke.id} poke={poke} />
                : <PokemonListItem key={poke.id} poke={poke} />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center mb-8">
            <p className="text-gray-500 text-lg">No Pokémon found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        {paginationData.totalPages > 1 && (
          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.totalItems}
            itemsPerPage={paginationData.itemsPerPage}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}