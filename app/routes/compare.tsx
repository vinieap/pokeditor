import { useState, useMemo, useRef, useEffect } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/compare";
import { loadPokemonData } from "~/lib/data-loader-v2";
import { PokemonSprite } from "~/components/SpriteImage";

const typeColors: Record<string, string> = {
  // Handle both uppercase and proper case
  'NORMAL': 'bg-gray-400',
  'Normal': 'bg-gray-400',
  'FIGHTING': 'bg-red-700',
  'Fighting': 'bg-red-700',
  'FLYING': 'bg-blue-400', 
  'Flying': 'bg-blue-400',
  'POISON': 'bg-purple-500',
  'Poison': 'bg-purple-500',
  'GROUND': 'bg-yellow-600',
  'Ground': 'bg-yellow-600',
  'ROCK': 'bg-yellow-800',
  'Rock': 'bg-yellow-800',
  'BUG': 'bg-green-400',
  'Bug': 'bg-green-400',
  'GHOST': 'bg-purple-700',
  'Ghost': 'bg-purple-700',
  'STEEL': 'bg-gray-500',
  'Steel': 'bg-gray-500',
  'FIRE': 'bg-red-500',
  'Fire': 'bg-red-500',
  'WATER': 'bg-blue-500',
  'Water': 'bg-blue-500',
  'GRASS': 'bg-green-500',
  'Grass': 'bg-green-500',
  'ELECTRIC': 'bg-yellow-400',
  'Electric': 'bg-yellow-400',
  'PSYCHIC': 'bg-pink-500',
  'Psychic': 'bg-pink-500',
  'ICE': 'bg-blue-300',
  'Ice': 'bg-blue-300',
  'DRAGON': 'bg-purple-600',
  'Dragon': 'bg-purple-600',
  'DARK': 'bg-gray-700',
  'Dark': 'bg-gray-700',
  'FAIRY': 'bg-pink-300',
  'Fairy': 'bg-pink-300',
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Compare Pokémon - Pokeditor" },
    { name: "description", content: "Compare multiple Pokémon side by side" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const pokemonData = await loadPokemonData(url.origin);
    return { pokemonList: pokemonData?.list || [] };
  } catch (error) {
    console.error('Failed to load Pokemon data:', error);
    return { pokemonList: [] };
  }
}

// Ensure Tailwind includes these classes - DO NOT REMOVE
// text-green-600 text-blue-600 text-red-600 text-gray-600 font-bold

export default function Compare() {
  const { pokemonList } = useLoaderData<typeof loader>();
  const [selectedPokemon, setSelectedPokemon] = useState<string[]>(["", ""]);
  const [searchTerms, setSearchTerms] = useState<string[]>(["", ""]);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const searchRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addComparisonSlot = () => {
    if (selectedPokemon.length < 6) {
      setSelectedPokemon([...selectedPokemon, ""]);
      setSearchTerms([...searchTerms, ""]);
    }
  };

  const removeComparisonSlot = (index: number) => {
    if (selectedPokemon.length > 2) {
      setSelectedPokemon(selectedPokemon.filter((_, i) => i !== index));
      setSearchTerms(searchTerms.filter((_, i) => i !== index));
    }
  };

  // Get Pokemon objects for selected IDs
  const selectedPokemonData = useMemo(() => {
    return selectedPokemon.map(id => {
      if (!id) return null;
      return pokemonList.find(p => p.internalName === id);
    });
  }, [selectedPokemon, pokemonList]);

  // Filter Pokemon for search dropdown
  const getFilteredPokemon = (searchTerm: string, index: number) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const filtered = pokemonList
      .filter(p => {
        const displayName = p.displayName || p.internalName;
        return (
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedPokemon.includes(p.internalName)
        );
      })
      .slice(0, 5);
    return filtered;
  };

  // Calculate stat ranking and colors
  const getStatRanking = (statKey: string) => {
    const values = selectedPokemonData
      .map((p, originalIdx) => ({
        value: p ? (p.stats?.[statKey as keyof typeof p.stats] || 0) : 0,
        index: originalIdx,
        hasData: !!p
      }))
      .filter(item => item.hasData)
      .sort((a, b) => b.value - a.value);
    
    const ranking: Record<number, number> = {};
    let currentRank = 1;
    values.forEach((item, idx) => {
      if (idx > 0 && item.value < values[idx - 1].value) {
        currentRank++;
      }
      ranking[item.index] = currentRank;
    });
    return ranking;
  };

  const getStatStyle = (value: number | undefined, ranking: number | undefined, totalCompared: number) => {
    const baseClasses = "px-4 py-3 text-center text-sm";
    
    if (value === undefined || value === null || ranking === undefined) {
      return { className: `${baseClasses} text-gray-600`, style: {} };
    }
    if (totalCompared <= 1) {
      return { className: `${baseClasses} text-gray-600`, style: {} };
    }
    if (ranking === 1) {
      return { 
        className: `${baseClasses} font-bold`, 
        style: { color: '#16a34a' } // green-600
      };
    }
    if (ranking === 2 && totalCompared > 2) {
      return { 
        className: baseClasses, 
        style: { color: '#2563eb' } // blue-600
      };
    }
    if (ranking === totalCompared && totalCompared > 2) {
      return { 
        className: baseClasses, 
        style: { color: '#dc2626' } // red-600
      };
    }
    return { className: `${baseClasses} text-gray-600`, style: {} };
  };

  const stats = [
    { name: "HP", key: "hp" },
    { name: "Attack", key: "attack" },
    { name: "Defense", key: "defense" },
    { name: "Sp. Attack", key: "spAttack" },
    { name: "Sp. Defense", key: "spDefense" },
    { name: "Speed", key: "speed" },
  ];

  const getMaxStat = (statKey: string) => {
    const values = selectedPokemonData
      .filter(p => p)
      .map(p => p?.stats?.[statKey as keyof typeof p.stats] || 0);
    return Math.max(...values, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Compare Pokémon</h1>
          <p className="text-gray-600">Compare stats, types, and abilities side by side</p>
        </div>

        {/* Comparison Slots */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {selectedPokemon.map((pokemonId, index) => {
              const pokemon = selectedPokemonData[index];
              const searchTerm = searchTerms[index];
              const filteredPokemon = getFilteredPokemon(searchTerm, index);
              
              return (
                <div key={index} className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[200px] flex flex-col justify-center">
                    <div className="relative">
                      <input
                        ref={el => { searchRefs.current[index] = el; }}
                        type="text"
                        placeholder="Search Pokémon..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2 text-gray-900 bg-white dark:bg-gray-800"
                        value={searchTerm}
                        onChange={(e) => {
                          const updated = [...searchTerms];
                          updated[index] = e.target.value;
                          setSearchTerms(updated);
                          // Reset highlight when search changes
                          const newHighlight = [...highlightedIndices];
                          newHighlight[index] = 0;
                          setHighlightedIndices(newHighlight);
                        }}
                        onKeyDown={(e) => {
                          const filtered = getFilteredPokemon(searchTerm, index);
                          const currentHighlight = highlightedIndices[index];
                          
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const newHighlight = [...highlightedIndices];
                            newHighlight[index] = Math.min(currentHighlight + 1, filtered.length - 1);
                            setHighlightedIndices(newHighlight);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const newHighlight = [...highlightedIndices];
                            newHighlight[index] = Math.max(currentHighlight - 1, 0);
                            setHighlightedIndices(newHighlight);
                          } else if (e.key === 'Enter' && filtered.length > 0) {
                            e.preventDefault();
                            const selected = filtered[currentHighlight];
                            if (selected) {
                              const updatedIds = [...selectedPokemon];
                              updatedIds[index] = selected.internalName;
                              setSelectedPokemon(updatedIds);
                              const updatedSearch = [...searchTerms];
                              updatedSearch[index] = "";
                              setSearchTerms(updatedSearch);
                            }
                          } else if (e.key === 'Escape') {
                            const updatedSearch = [...searchTerms];
                            updatedSearch[index] = "";
                            setSearchTerms(updatedSearch);
                          }
                        }}
                      />
                      {filteredPokemon.length > 0 && (
                        <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 rounded mt-1 shadow-lg max-h-48 overflow-y-auto">
                          {filteredPokemon.map((p, idx) => (
                            <button
                              key={p.internalName}
                              className={`w-full text-left px-2 py-1 text-sm text-gray-900 transition-colors ${
                                idx === highlightedIndices[index]
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              onMouseEnter={() => {
                                const newHighlight = [...highlightedIndices];
                                newHighlight[index] = idx;
                                setHighlightedIndices(newHighlight);
                              }}
                              onClick={() => {
                                const updatedIds = [...selectedPokemon];
                                updatedIds[index] = p.internalName;
                                setSelectedPokemon(updatedIds);
                                const updatedSearch = [...searchTerms];
                                updatedSearch[index] = "";
                                setSearchTerms(updatedSearch);
                              }}
                            >
                              #{p.id.toString().padStart(3, '0')} {p.displayName || p.internalName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {pokemon ? (
                      <>
                        <div className="w-24 h-24 mx-auto mb-2">
                          <PokemonSprite
                            internalName={pokemon.internalName}
                            name={pokemon.displayName || pokemon.internalName}
                            pokemonId={pokemon.id}
                            className="w-full h-full object-contain pixelated"
                          />
                        </div>
                        <p className="font-semibold text-gray-900">{pokemon.displayName || pokemon.internalName}</p>
                        <p className="text-xs text-gray-500">#{pokemon.id.toString().padStart(3, '0')}</p>
                      </>
                    ) : (
                      <>
                        <div className="aspect-square bg-gray-100 rounded mb-2 w-24 h-24 mx-auto"></div>
                        <p className="text-sm text-gray-500">Slot {index + 1}</p>
                      </>
                    )}
                  </div>
                  {selectedPokemon.length > 2 && (
                    <button
                      onClick={() => removeComparisonSlot(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
            
            {selectedPokemon.length < 6 && (
              <button
                onClick={addComparisonSlot}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[200px] flex items-center justify-center hover:bg-gray-50 dark:bg-gray-900 transition-colors"
              >
                <span className="text-gray-400 text-4xl">+</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Attribute</th>
                {selectedPokemon.map((_, index) => (
                  <th key={index} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Slot {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Types Row */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">Type</td>
                {selectedPokemonData.map((pokemon, index) => (
                  <td key={index} className="px-4 py-3 text-center text-sm">
                    {pokemon ? (
                      <div className="flex justify-center gap-1">
                        {pokemon.types.map(type => {
                          const cleanType = type.replace(/\r/g, '').trim();
                          const typeKey = cleanType.charAt(0).toUpperCase() + cleanType.slice(1).toLowerCase();
                          return (
                            <span
                              key={type}
                              className={`px-2 py-1 rounded text-xs text-white font-medium ${
                                typeColors[typeKey] || typeColors[cleanType] || 'bg-gray-500'
                              }`}
                            >
                              {cleanType}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      "--"
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Stats Rows */}
              {stats.map(stat => {
                const ranking = getStatRanking(stat.key);
                const totalCompared = selectedPokemonData.filter(p => p).length;
                return (
                  <tr key={stat.name}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{stat.name}</td>
                    {selectedPokemonData.map((pokemon, index) => {
                      const value = pokemon?.stats?.[stat.key as keyof typeof pokemon.stats];
                      const rank = ranking[index];
                      const statStyle = getStatStyle(value, rank, totalCompared);
                      return (
                        <td 
                          key={index} 
                          className={statStyle.className}
                          style={statStyle.style}
                        >
                          {value || "--"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              
              {/* Total Row */}
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="px-4 py-3 text-sm font-bold text-gray-700">Total</td>
                {selectedPokemonData.map((pokemon, index) => {
                  const total = pokemon ? 
                    Object.values(pokemon.stats).reduce((sum, val) => sum + val, 0) : 
                    null;
                  const totals = selectedPokemonData
                    .map((p, idx) => ({
                      value: p ? Object.values(p.stats).reduce((sum, val) => sum + val, 0) : 0,
                      index: idx,
                      hasData: !!p
                    }))
                    .filter(t => t.hasData)
                    .sort((a, b) => b.value - a.value);
                  
                  const totalRanking: Record<number, number> = {};
                  let currentRank = 1;
                  totals.forEach((item, idx) => {
                    if (idx > 0 && item.value < totals[idx - 1].value) {
                      currentRank++;
                    }
                    totalRanking[item.index] = currentRank;
                  });
                  
                  const totalCompared = selectedPokemonData.filter(p => p).length;
                  const rank = totalRanking[index];
                  return (
                    <td 
                      key={index} 
                      className={`px-4 py-3 text-center text-sm font-semibold ${
                        !total ? 'text-gray-700' :
                        totalCompared <= 1 ? 'text-gray-700' :
                        rank === 1 ? 'text-green-600 font-bold' :
                        rank === 2 && totalCompared > 2 ? 'text-blue-600' :
                        rank === totalCompared && totalCompared > 2 ? 'text-red-600' :
                        'text-gray-700'
                      }`}
                      style={{
                        color: !total ? undefined :
                          totalCompared <= 1 ? undefined :
                          rank === 1 ? '#16a34a' : // green-600
                          rank === 2 && totalCompared > 2 ? '#2563eb' : // blue-600
                          rank === totalCompared && totalCompared > 2 ? '#dc2626' : // red-600
                          undefined
                      }}
                    >
                      {total || "--"}
                    </td>
                  );
                })}
              </tr>
              
              {/* Abilities Row */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">Abilities</td>
                {selectedPokemonData.map((pokemon, index) => (
                  <td key={index} className="px-4 py-3 text-center text-sm text-gray-600">
                    {pokemon ? (
                      <div className="text-xs">
                        {pokemon.abilities?.slice(0, 2).join(", ") || "--"}
                      </div>
                    ) : (
                      "--"
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}