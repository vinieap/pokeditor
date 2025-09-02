import { Link, useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/encounters._index";
import { loadEncountersData, loadPokemonData } from "~/lib/data-loader-v2";
import type { EncounterData, PokemonData } from "~/lib/types-v2";
import { PokemonSprite } from "~/components/SpriteImage";

export function meta() {
  return [
    { title: "Encounters - Pokeditor" },
    { name: "description", content: "Find locations where specific Pokémon can be encountered" },
  ];
}

// Transform JSON data to match the component's expected structure
interface MapEncounters {
  mapId: string;
  mapName: string;
  encounters: {
    [key: string]: {
      density: number;
      encounters: {
        species: string;
        level: number;
        maxLevel?: number;
        probability: number;
      }[];
    } | undefined;
  };
}

function transformEncounterData(encounter: EncounterData): MapEncounters {
  const transformed: MapEncounters = {
    mapId: encounter.mapId.toString(),
    mapName: encounter.mapName,
    encounters: {}
  };

  // Default densities based on encounter type and rates from data
  const defaultDensities: Record<string, number> = {
    Land: encounter.landRate || 25,
    Cave: encounter.caveRate || 10,
    Water: encounter.waterRate || 10,
    RockSmash: 20,
    OldRod: 25,
    GoodRod: 50,
    SuperRod: 75,
    HeadbuttLow: 20,
    HeadbuttHigh: 20,
    LandMorning: encounter.landRate || 25,
    LandDay: encounter.landRate || 25,
    LandNight: encounter.landRate || 25,
    BugContest: 25,
  };

  encounter.encounters.forEach(enc => {
    // Clean up the type string (remove \r if present)
    const methodType = enc.type.replace(/\r/g, '').trim();
    
    if (!methodType || enc.pokemon.length === 0) return;
    
    transformed.encounters[methodType] = {
      density: defaultDensities[methodType] || 25,
      encounters: enc.pokemon.map(poke => ({
        species: poke.species,
        level: poke.minLevel,
        maxLevel: poke.maxLevel > poke.minLevel ? poke.maxLevel : undefined,
        probability: poke.probability // Use probability directly from JSON
      }))
    };
  });

  return transformed;
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    
    // Load encounters data
    const encountersData = await loadEncountersData(url.origin);
    const encountersList = encountersData?.list.map(transformEncounterData) || [];
    
    // Load Pokemon data for species info
    const pokemonData = await loadPokemonData(url.origin);
    const pokemonList = pokemonData?.list || [];
    
    return { encountersList, pokemonList };
  } catch (error) {
    console.error('Failed to load encounters data:', error);
    return { encountersList: [], pokemonList: [] };
  }
}

const methodIcons: Record<string, string> = {
  Land: '🚶',
  Cave: '⛰️',
  Water: '🌊',
  RockSmash: '🪨',
  OldRod: '🎣',
  GoodRod: '🎣',
  SuperRod: '🎣',
  HeadbuttLow: '🌳',
  HeadbuttHigh: '🌲',
  LandMorning: '🌅',
  LandDay: '☀️',
  LandNight: '🌙',
  BugContest: '🦋',
};

const methodColors: Record<string, string> = {
  Land: 'bg-green-500',
  Cave: 'bg-gray-600',
  Water: 'bg-blue-500',
  RockSmash: 'bg-yellow-700',
  OldRod: 'bg-blue-400',
  GoodRod: 'bg-blue-500',
  SuperRod: 'bg-blue-600',
  HeadbuttLow: 'bg-green-600',
  HeadbuttHigh: 'bg-green-700',
  LandMorning: 'bg-yellow-400',
  LandDay: 'bg-orange-400',
  LandNight: 'bg-purple-600',
  BugContest: 'bg-pink-500',
};

function EncounterCard({ encounter, pokemonList }: { encounter: MapEncounters; pokemonList: PokemonData[] }) {
  const [expandedMethods, setExpandedMethods] = useState<Set<string>>(new Set());

  const toggleMethod = (method: string) => {
    setExpandedMethods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(method)) {
        newSet.delete(method);
      } else {
        newSet.add(method);
      }
      return newSet;
    });
  };

  const methodCount = Object.keys(encounter.encounters).length;
  const totalEncounters = Object.values(encounter.encounters).reduce(
    (sum, method) => sum + (method?.encounters.length || 0), 
    0
  );
  
  // Get unique species count
  const uniqueSpecies = new Set<string>();
  Object.values(encounter.encounters).forEach(method => {
    method?.encounters.forEach(enc => uniqueSpecies.add(enc.species));
  });
  const uniqueCount = uniqueSpecies.size;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{encounter.mapName}</h3>
            <p className="text-sm text-gray-500">ID: {encounter.mapId}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{methodCount} methods</div>
            <div className="text-sm text-gray-500">{uniqueCount} species</div>
            <div className="text-xs text-gray-400">{totalEncounters} total encounters</div>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(encounter.encounters).map(([method, data]) => {
            if (!data) return null;
            const isExpanded = expandedMethods.has(method);
            
            return (
              <div key={method} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleMethod(method)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{methodIcons[method] || '📍'}</span>
                    <span className="font-medium text-gray-900">{method}</span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-xs ${methodColors[method] || 'bg-gray-50 dark:bg-gray-9000'}`}>
                      {new Set(data.encounters.map(e => e.species)).size} species
                    </span>
                    <span className="text-xs text-gray-500">
                      Density: {data.density}%
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-gray-800 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(() => {
                        // Group encounters by species
                        const groupedEncounters = new Map<string, {
                          species: string;
                          levels: number[];
                          maxLevels: number[];
                          totalProbability: number;
                        }>();
                        
                        data.encounters.forEach(enc => {
                          if (!groupedEncounters.has(enc.species)) {
                            groupedEncounters.set(enc.species, {
                              species: enc.species,
                              levels: [],
                              maxLevels: [],
                              totalProbability: 0
                            });
                          }
                          const group = groupedEncounters.get(enc.species)!;
                          group.levels.push(enc.level);
                          if (enc.maxLevel) group.maxLevels.push(enc.maxLevel);
                          group.totalProbability += enc.probability || 0;
                        });
                        
                        return Array.from(groupedEncounters.values()).map((group, idx) => {
                          const pokemon = pokemonList.find(p => 
                            p.internalName === group.species || 
                            p.internalName?.toUpperCase() === group.species.toUpperCase()
                          );
                          
                          // Calculate level range
                          const minLevel = Math.min(...group.levels);
                          const maxLevel = group.maxLevels.length > 0 
                            ? Math.max(...group.maxLevels, ...group.levels)
                            : Math.max(...group.levels);
                          const levelText = minLevel === maxLevel ? `${minLevel}` : `${minLevel}-${maxLevel}`;
                          
                          const displayName = pokemon?.name || group.species.charAt(0).toUpperCase() + group.species.slice(1).toLowerCase();
                          
                          // Determine text size based on name length for single-line display
                          const nameLength = displayName.length;
                          let textSizeClass = 'text-sm'; // Default for short names
                          if (nameLength > 15) {
                            textSizeClass = 'text-[10px]'; // Very small for very long names
                          } else if (nameLength > 12) {
                            textSizeClass = 'text-[11px]'; // Smaller for long names
                          } else if (nameLength > 10) {
                            textSizeClass = 'text-xs'; // Medium-small for medium names
                          }
                          
                          return (
                            <div key={group.species} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border dark:border-gray-700">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 flex-shrink-0">
                                    <PokemonSprite
                                      internalName={group.species}
                                      name={displayName}
                                      pokemonId={pokemon?.id}
                                      className="w-full h-full object-contain pixelated"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-medium ${textSizeClass} text-gray-900 dark:text-gray-100 truncate`} title={displayName}>
                                      {displayName}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                    Lv.{levelText}
                                  </span>
                                  {group.totalProbability > 0 && (
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                      {Math.round(group.totalProbability * 10) / 10}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EncountersIndex() {
  const { encountersList, pokemonList } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedPokemon, setSelectedPokemon] = useState<string>('');

  // Get unique methods and Pokemon across all encounters
  const allMethods = new Set<string>();
  const allPokemon = new Set<string>();
  
  encountersList.forEach(map => {
    Object.keys(map.encounters).forEach(method => allMethods.add(method));
    Object.values(map.encounters).forEach(methodData => {
      methodData?.encounters.forEach(enc => allPokemon.add(enc.species));
    });
  });

  // Filter encounters
  const filteredEncounters = encountersList.filter(encounter => {
    // Search filter - now searches by Pokemon name
    if (searchTerm) {
      const hasPokemonMatch = Object.values(encounter.encounters).some(methodData =>
        methodData?.encounters.some(enc => {
          const pokemon = pokemonList.find(p => 
            p.internalName === enc.species || p.internalName?.toUpperCase() === enc.species.toUpperCase()
          );
          const displayName = pokemon?.name || enc.species.charAt(0).toUpperCase() + enc.species.slice(1).toLowerCase();
          return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 enc.species.toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
      if (!hasPokemonMatch) return false;
    }

    // Method filter
    if (selectedMethod && !encounter.encounters[selectedMethod]) {
      return false;
    }

    // Pokemon filter
    if (selectedPokemon) {
      const hasPokemon = Object.values(encounter.encounters).some(methodData =>
        methodData?.encounters.some(enc => enc.species === selectedPokemon)
      );
      if (!hasPokemon) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wild Encounters</h1>
          <p className="text-gray-600">Search for Pokémon to find their encounter locations</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Pokémon
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Pokémon name..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encounter Method
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800"
              >
                <option value="">All Methods</option>
                {Array.from(allMethods).sort().map(method => (
                  <option key={method} value={method}>
                    {methodIcons[method] || '📍'} {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Find Pokémon
              </label>
              <select
                value={selectedPokemon}
                onChange={(e) => setSelectedPokemon(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800"
              >
                <option value="">All Pokémon</option>
                {Array.from(allPokemon).sort((a, b) => {
                  const pokemonA = pokemonList.find(p => 
                    p.internalName === a || p.internalName?.toUpperCase() === a.toUpperCase()
                  );
                  const pokemonB = pokemonList.find(p => 
                    p.internalName === b || p.internalName?.toUpperCase() === b.toUpperCase()
                  );
                  const nameA = pokemonA?.name || a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
                  const nameB = pokemonB?.name || b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
                  return nameA.localeCompare(nameB);
                }).map(species => {
                  const pokemon = pokemonList.find(p => 
                    p.internalName === species || p.internalName?.toUpperCase() === species.toUpperCase()
                  );
                  const displayName = pokemon?.name || species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
                  return (
                    <option key={species} value={species}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMethod('');
                  setSelectedPokemon('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredEncounters.length} of {encountersList.length} locations
          </div>
        </div>

        {/* Results */}
        {filteredEncounters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No encounters found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEncounters.map((encounter) => (
              <EncounterCard 
                key={encounter.mapId} 
                encounter={encounter} 
                pokemonList={pokemonList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}