import { Link, useLoaderData, useSearchParams } from "react-router";
import { useState, useMemo, useCallback } from "react";
import type { Route } from "./+types/pokemon._index";
import { loadPokemonData, searchPokemon } from "~/lib/data-loader";
import type { PokemonData } from "~/lib/types";
import { getTypeColor } from "~/lib/utils/typeColors";
import { GridSkeleton } from "~/components/SkeletonLoaders";
import { ProgressiveLoader, VirtualizedList, LazyImage } from "~/components/ProgressiveLoader";

export function meta() {
  return [
    { title: "Pokémon List - Pokeditor" },
    { name: "description", content: "Browse and search all Pokémon" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const origin = url.origin;
  
  try {
    const data = await loadPokemonData(origin);
    const searchQuery = url.searchParams.get('search') || '';
    
    let pokemonList = data.list;
    
    if (searchQuery) {
      pokemonList = searchPokemon(searchQuery);
    }
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 24;
    const totalPages = Math.ceil(pokemonList.length / pageSize);
    
    const paginatedList = pokemonList.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    
    return {
      pokemon: paginatedList,
      totalPokemon: pokemonList.length,
      currentPage: page,
      totalPages,
      searchQuery
    };
  } catch (error) {
    console.error('Failed to load Pokemon data:', error);
    throw error;
  }
}

function PokemonCard({ pokemon, index }: { pokemon: PokemonData; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
        opacity: 0
      }}
    >
      <div className="relative">
        <LazyImage
          src={`/sprites/optimized/96/webp/${pokemon.id}.webp`}
          alt={pokemon.name}
          width={96}
          height={96}
          className="mx-auto mb-3"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-center mb-1">{pokemon.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
        #{String(pokemon.id).padStart(3, '0')}
      </p>
      
      <div className="flex justify-center gap-2">
        {pokemon.types.map(type => (
          <span
            key={type}
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: getTypeColor(type) }}
          >
            {type}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function PokemonIndex() {
  const { pokemon, totalPokemon, currentPage, totalPages, searchQuery } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch) {
      params.set('search', localSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  }, [localSearch, searchParams, setSearchParams]);
  
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo(0, 0);
  }, [searchParams, setSearchParams]);
  
  const renderPokemonItem = useCallback((pokemon: PokemonData, index: number) => {
    if (viewMode === 'list') {
      return (
        <Link
          to={`/pokemon/${pokemon.id}`}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
        >
          <LazyImage
            src={`/sprites/optimized/48/webp/${pokemon.id}.webp`}
            alt={pokemon.name}
            width={48}
            height={48}
            className="rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{pokemon.name}</h3>
            <p className="text-sm text-gray-500">#{String(pokemon.id).padStart(3, '0')}</p>
          </div>
          <div className="flex gap-2">
            {pokemon.types.map(type => (
              <span
                key={type}
                className="px-2 py-1 rounded text-white text-xs"
                style={{ backgroundColor: getTypeColor(type) }}
              >
                {type}
              </span>
            ))}
          </div>
        </Link>
      );
    }
    
    return <PokemonCard pokemon={pokemon} index={index} />;
  }, [viewMode]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Pokémon Database</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search Pokémon by name or number..."
                className="w-full px-4 py-2 pr-10 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                🔍
              </button>
            </div>
          </form>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Showing {pokemon.length} of {totalPokemon} Pokémon
        </p>
      </div>
      
      <ProgressiveLoader
        fallback={<GridSkeleton count={24} />}
        delay={100}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pokemon.map((p: PokemonData, index: number) => (
              <PokemonCard key={p.id} pokemon={p} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {pokemon.length > 50 ? (
              <VirtualizedList
                items={pokemon}
                itemHeight={80}
                renderItem={renderPokemonItem}
                className="h-[600px]"
              />
            ) : (
              pokemon.map((p: PokemonData, index: number) => (
                <div key={p.id}>
                  {renderPokemonItem(p, index)}
                </div>
              ))
            )}
          </div>
        )}
      </ProgressiveLoader>
      
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  pageNum === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {totalPages > 5 && (
            <>
              <span className="px-2 py-2">...</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .sprite-skeleton {
    background: linear-gradient(
      90deg,
      rgba(229, 231, 235, 1) 0%,
      rgba(243, 244, 246, 1) 50%,
      rgba(229, 231, 235, 1) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
document.head.appendChild(style);