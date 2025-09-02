import { useState, useMemo } from "react";
import { Link, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/trainers._index";
import { loadTrainersData, loadTrainerTypesData, loadPokemonData } from "~/lib/data-loader-v2";
import { PokemonSprite } from "~/components/SpriteImage";
import { getTypeColor } from "~/lib/utils/typeColors";
import { useDebouncedSearch } from "~/hooks/useDebounce";
import { Pagination, usePagination } from "~/components/Pagination";
import { 
  GridSkeletonLoader, 
  ListSkeletonLoader,
  LoadingState,
  TrainerCardSkeleton,
  TrainerListItemSkeleton,
  StatsSummarySkeleton
} from "~/components/SkeletonLoader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trainer Database - Pokeditor" },
    { name: "description", content: "Browse and manage trainer teams and configurations" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    
    // Load all data in parallel using JSON loaders
    const [trainersData, trainerTypesData, pokemonData] = await Promise.all([
      loadTrainersData(url.origin),
      loadTrainerTypesData(url.origin),
      loadPokemonData(url.origin)
    ]);
    
    // Map party to team for compatibility with existing component
    const trainersWithTeam = trainersData.list.map((trainer: any) => ({
      ...trainer,
      trainerType: trainer.type,
      team: trainer.party || []
    }));
    
    return { 
      trainers: trainersWithTeam, 
      trainerTypes: trainerTypesData.list, 
      pokemonList: pokemonData?.list || [] 
    };
  } catch (error) {
    console.error('Failed to load trainers data:', error);
    return { trainers: [], trainerTypes: [], pokemonList: [] };
  }
}

export default function TrainersIndex() {
  const { trainers, trainerTypes, pokemonList } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { searchValue, debouncedSearchValue, setSearchValue, isSearching } = useDebouncedSearch('', 300);
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Check if we're loading
  const isLoading = navigation.state === "loading";
  const { currentPage, setPage, getPaginatedData } = usePagination(50);

  // Get unique trainer classes
  const trainerClasses = useMemo(() => {
    const classes = new Set<string>();
    trainers.forEach(trainer => classes.add(trainer.trainerType));
    return ['all', ...Array.from(classes).sort()];
  }, [trainers]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter(trainer => {
      const matchesSearch = debouncedSearchValue === "" || 
        trainer.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        trainer.trainerType.toLowerCase().includes(debouncedSearchValue.toLowerCase());
      
      const matchesType = selectedType === "all" || trainer.trainerType === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [trainers, debouncedSearchValue, selectedType]);

  const paginationData = useMemo(() => 
    getPaginatedData(filteredTrainers), 
    [filteredTrainers, currentPage]
  );


  const getDifficultyColor = (trainer: Trainer) => {
    const avgLevel = trainer.team.reduce((sum, p) => sum + p.level, 0) / trainer.team.length;
    if (avgLevel >= 70) return 'bg-red-100 border-red-300';
    if (avgLevel >= 50) return 'bg-orange-100 border-orange-300';
    if (avgLevel >= 30) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const getDifficultyLabel = (trainer: Trainer) => {
    const avgLevel = trainer.team.reduce((sum, p) => sum + p.level, 0) / trainer.team.length;
    if (avgLevel >= 70) return '⚡ Elite';
    if (avgLevel >= 50) return '🔥 Advanced';
    if (avgLevel >= 30) return '💪 Intermediate';
    return '🌱 Beginner';
  };

  const TrainerCard = ({ trainer }: { trainer: Trainer }) => {
    const typeInfo = trainerTypes.find(t => t.id === trainer.trainerType);
    
    return (
      <Link 
        to={`/trainers/${trainer.id}`}
        className={`block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all p-4 border-2 ${getDifficultyColor(trainer)}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{trainer.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{trainer.trainerType}</p>
          </div>
          <span className="text-sm font-medium">{getDifficultyLabel(trainer)}</span>
        </div>
        
        <div className="space-y-2 mb-3">
          {trainer.team.slice(0, 6).map((pokemon, idx) => {
            const pokemonData = pokemonList.find(p => p.internalName === pokemon.species);
            const displayName = pokemonData?.name || pokemon.species;
            return (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="relative h-12 w-12 flex-shrink-0">
                  <PokemonSprite
                    internalName={pokemon.species}
                    name={displayName}
                    pokemonId={pokemonData?.id}
                    className="w-full h-full object-contain pixelated"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{displayName}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Lv.{pokemon.level}</span>
                  </div>
                  {pokemonData && pokemonData.types && (
                    <div className="flex gap-1">
                      {pokemonData.types.filter(Boolean).map((type, typeIdx) => (
                        <span 
                          key={typeIdx}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(type || '')}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {trainer.items && trainer.items.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {trainer.items.map((item, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                {item}
              </span>
            ))}
          </div>
        )}
      </Link>
    );
  };

  const TrainerListItem = ({ trainer }: { trainer: Trainer }) => {
    return (
      <Link 
        to={`/trainers/${trainer.id}`}
        className={`block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4 border-l-4 ${getDifficultyColor(trainer)}`}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{trainer.name}</h3>
              <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{trainer.trainerType}</span>
              <span className="text-sm font-medium">{getDifficultyLabel(trainer)}</span>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="flex -space-x-2">
                {trainer.team.map((pokemon, idx) => {
                  const pokemonData = pokemonList.find(p => p.internalName === pokemon.species);
                  const displayName = pokemonData?.name || pokemon.species;
                  return (
                    <div key={idx} className="relative h-8 w-8 border-2 border-white rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                      <PokemonSprite
                        internalName={pokemon.species}
                        name={displayName}
                        pokemonId={pokemonData?.id}
                        className="w-full h-full object-contain pixelated"
                      />
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Team: {trainer.team.map(p => {
                    const pokemonData = pokemonList.find(pd => pd.internalName === p.species);
                    const displayName = pokemonData?.name || p.species;
                    return `${displayName} (Lv.${p.level})`;
                  }).join(', ')}
                </div>
                <div className="flex flex-wrap gap-1">
                  {trainer.team.slice(0, 6).map((pokemon, pokemonIdx) => {
                    const pokemonData = pokemonList.find(pd => pd.internalName === pokemon.species);
                    return pokemonData && pokemonData.types ? (
                      <div key={pokemonIdx} className="flex gap-1">
                        {pokemonData.types.filter(Boolean).map((type, typeIdx) => (
                          <span 
                            key={`${pokemonIdx}-${typeIdx}`}
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTypeColor(type || '')}`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Trainer Database</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Found {filteredTrainers.length} of {trainers.length} trainers
            {isSearching && (
              <span className="ml-2 text-blue-500 text-sm">(searching...)</span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Search trainers by name or class..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            <div className="min-w-[150px]">
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {trainerClasses.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'all' ? 'All Trainers' : cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "cards" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() => setViewMode("cards")}
              >
                Cards
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Trainer Type Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
                <div className="h-3 w-16 mx-auto mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
                <div className="h-6 w-8 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
            {Array.from(new Set(trainers.map(t => t.trainerType))).slice(0, 6).map(type => {
              const count = trainers.filter(t => t.trainerType === type).length;
              return (
                <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{type}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Trainers Display */}
        {isLoading ? (
          // Show skeleton loaders while loading
          viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <GridSkeletonLoader count={50} CardSkeleton={TrainerCardSkeleton} />
            </div>
          ) : (
            <div className="space-y-2 mb-8">
              <ListSkeletonLoader count={50} ItemSkeleton={TrainerListItemSkeleton} />
            </div>
          )
        ) : paginationData.data.length > 0 ? (
          viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {paginationData.data.map(trainer => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
          ) : (
            <div className="space-y-2 mb-8">
              {paginationData.data.map(trainer => (
                <TrainerListItem key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center mb-8">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No trainers found matching your criteria</p>
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