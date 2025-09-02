import { Link, useParams, useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/pokemon.$id";
import { 
  loadPokemonData, 
  loadMovesData, 
  getPokemonById, 
  getMoveByInternalName,
  getPokemonByInternalName 
} from "~/lib/data-loader-v2";
import type { PokemonData, MoveData } from "~/lib/types-v2";
import { OptimizedPokemonSprite } from "~/components/OptimizedSprite";
import { getTypeColor } from "~/lib/utils/typeColors";

export function meta({ params, data }: Route.MetaArgs) {
  const pokemon = data?.pokemon;
  const pokeName = pokemon?.displayName || pokemon?.internalName || pokemon?.name;
  return [
    { title: pokemon ? `${pokeName} - Pokémon #${pokemon.id}` : `Pokémon #${params.id} - Pokeditor` },
    { name: "description", content: pokemon ? `View detailed information for ${pokeName}` : `View detailed information for Pokémon #${params.id}` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    
    // Load all data
    const [pokemonData, movesData] = await Promise.all([
      loadPokemonData(url.origin),
      loadMovesData(url.origin)
    ]);
    
    // Get the specific Pokemon
    const pokemon = pokemonData?.byId[parseInt(params.id || "0")];
    if (!pokemon) {
      throw new Response("Pokemon not found", { status: 404 });
    }
    
    return { pokemon, moves: movesData, pokemonData };
  } catch (error) {
    console.error('Failed to load Pokemon data:', error);
    throw error;
  }
}

export default function PokemonDetail() {
  const { pokemon, moves, pokemonData } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"stats" | "moves" | "evolution">("stats");
  
  // Get move details
  const getMoveDetails = (moveName: string): MoveData | undefined => {
    return moves?.byInternalName[moveName] 
      ? moves?.byId[moves?.byInternalName[moveName]] 
      : undefined;
  };
  
  // Get evolution Pokemon using the indexed data
  const getEvolutionPokemon = (internalName: string): PokemonData | undefined => {
    // Try exact match first, then with \r suffix (data inconsistency handling)
    let id = pokemonData?.byInternalName[internalName];
    if (!id) {
      id = pokemonData?.byInternalName[internalName + '\r'];
    }
    return id ? pokemonData?.byId[id] : undefined;
  };

  // Build complete evolution chain
  const buildEvolutionChain = () => {
    if (!pokemonData) return null;

    // Build reverse lookup map: what evolves into what
    const evolutionParents: { [key: string]: { pokemon: PokemonData; method: string; parameter: string }[] } = {};
    
    Object.values(pokemonData.byId).forEach((poke) => {
      if (poke.evolutions && poke.evolutions.length > 0) {
        poke.evolutions.forEach((evo) => {
          const evoPokemon = getEvolutionPokemon(evo.species);
          if (evoPokemon) {
            if (!evolutionParents[evoPokemon.internalName]) {
              evolutionParents[evoPokemon.internalName] = [];
            }
            evolutionParents[evoPokemon.internalName].push({
              pokemon: poke,
              method: evo.method,
              parameter: evo.parameter
            });
          }
        });
      }
    });

    // Find the base form (no parents)
    const findBaseForm = (poke: PokemonData): PokemonData => {
      const parents = evolutionParents[poke.internalName];
      if (!parents || parents.length === 0) {
        return poke;
      }
      // If there are multiple parents (shouldn't happen normally), pick the first
      return findBaseForm(parents[0].pokemon);
    };

    const baseForm = findBaseForm(pokemon);

    // Build the evolution tree starting from base form
    const buildTree = (currentPoke: PokemonData): any => {
      const node = {
        pokemon: currentPoke,
        evolutions: [] as any[]
      };

      if (currentPoke.evolutions && currentPoke.evolutions.length > 0) {
        currentPoke.evolutions.forEach((evo) => {
          const evoPokemon = getEvolutionPokemon(evo.species);
          if (evoPokemon) {
            const childNode = buildTree(evoPokemon);
            childNode.method = evo.method;
            childNode.parameter = evo.parameter;
            node.evolutions.push(childNode);
          }
        });
      }

      return node;
    };

    return buildTree(baseForm);
  };

  const evolutionChain = buildEvolutionChain();

  // Component to render evolution method text
  const getEvolutionMethodText = (method: string, parameter: string) => {
    switch (method) {
      case 'Level':
        return `Lv. ${parameter}`;
      case 'Item':
        return `Use ${parameter}`;
      case 'Trade':
        return 'Trade';
      case 'Happiness':
        return 'High Friendship';
      case 'HasMove':
        return `Learn ${parameter}`;
      default:
        return parameter || method;
    }
  };

  // Component to render the complete evolution chain horizontally
  const renderEvolutionChain = (chain: any): JSX.Element => {
    const renderLevel = (nodes: any[], level: number = 0): JSX.Element[] => {
      return nodes.map((node, index) => {
        const poke = node.pokemon;
        const isCurrentPokemon = poke.id === pokemon.id;
        const hasEvolutions = node.evolutions && node.evolutions.length > 0;

        return (
          <div key={`${poke.id}-${level}-${index}`} className="flex items-center">
            {/* Pokemon Card */}
            <div className="flex flex-col items-center">
              <div className={`relative group ${isCurrentPokemon ? 'ring-4 ring-blue-500' : ''}`}>
                {isCurrentPokemon && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                    Current
                  </div>
                )}
                <Link 
                  to={`/pokemon/${poke.id}`} 
                  className={`block transition-all duration-200 ${isCurrentPokemon ? '' : 'hover:scale-105'}`}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center min-w-[120px] border-2 border-transparent hover:border-gray-300">
                    <div className="w-24 h-24 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <OptimizedPokemonSprite
                        id={poke.id}
                        name={poke.displayName || poke.internalName}
                        size={96}
                        className="w-full h-full object-contain pixelated"
                      />
                    </div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {poke.displayName || poke.internalName}
                    </p>
                    <p className="text-xs text-gray-500">#{String(poke.id).padStart(3, '0')}</p>
                    <div className="flex gap-1 justify-center mt-2">
                      {poke.types.slice(0, 2).map((type: string) => (
                        <span
                          key={type}
                          className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: getTypeColor(type.replace('\r', '')) }}
                        >
                          {type.replace('\r', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Evolution Arrow and Next Level */}
            {hasEvolutions && (
              <>
                {node.evolutions.length === 1 ? (
                  // Single evolution - horizontal flow
                  <>
                    <div className="flex flex-col items-center mx-6">
                      <div className="text-gray-500 text-sm mb-1">
                        {getEvolutionMethodText(node.evolutions[0].method, node.evolutions[0].parameter)}
                      </div>
                      <div className="text-3xl text-gray-400">→</div>
                    </div>
                    {renderLevel([node.evolutions[0]], level + 1)}
                  </>
                ) : (
                  // Multiple evolutions - branching layout
                  <>
                    <div className="flex flex-col items-center mx-6">
                      <div className="text-gray-500 text-sm mb-1">Evolves into:</div>
                      <div className="text-2xl text-gray-400">→</div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {node.evolutions.map((evoNode: any, evoIndex: number) => (
                        <div key={evoIndex} className="flex items-center">
                          <div className="flex flex-col items-center mr-4">
                            <div className="text-gray-500 text-xs">
                              {getEvolutionMethodText(evoNode.method, evoNode.parameter)}
                            </div>
                          </div>
                          {renderLevel([evoNode], level + 1)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      });
    };

    return (
      <div className="flex items-center justify-start">
        {renderLevel([chain])}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/pokemon" className="text-blue-500 hover:underline mb-4 inline-block">
            ← Back to Pokédex
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Pokemon Image */}
              <div className="flex-shrink-0 text-center">
                <div className="relative h-48 w-48 mx-auto mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <OptimizedPokemonSprite
                    id={pokemon.id}
                    name={pokemon.displayName || pokemon.internalName}
                    size={192}
                    priority={true}
                    className="w-full h-full object-contain pixelated"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{pokemon.displayName || pokemon.internalName}</h1>
                <p className="text-gray-500 text-lg">#{String(pokemon.id).padStart(3, '0')}</p>
                <div className="flex gap-2 justify-center mt-2">
                  {pokemon.types.map((type: string) => (
                    <span
                      key={type}
                      className="px-3 py-1 rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Height</p>
                    <p className="font-semibold">{pokemon.height}m</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Weight</p>
                    <p className="font-semibold">{pokemon.weight}kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Category</p>
                    <p className="font-semibold">{pokemon.kind}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Abilities</p>
                    <p className="font-semibold">
                      {pokemon.abilities.join(", ")}
                      {pokemon.hiddenAbility && (
                        <span className="text-gray-500"> (Hidden: {pokemon.hiddenAbility})</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Gender Rate</p>
                    <p className="font-semibold">{pokemon.genderRate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Catch Rate</p>
                    <p className="font-semibold">{pokemon.rareness}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-1">Pokédex Entry</p>
                  <p className="text-gray-700 italic">{pokemon.pokedex}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "stats"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("stats")}
              >
                Base Stats
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "moves"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("moves")}
              >
                Moves
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "evolution"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("evolution")}
              >
                Evolution
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === "stats" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Base Stats</h2>
                <div className="space-y-3">
                  {Object.entries(pokemon.stats).map(([stat, value]) => {
                    const statName = stat === 'spAttack' ? 'Sp. Atk' : 
                                    stat === 'spDefense' ? 'Sp. Def' : 
                                    stat.charAt(0).toUpperCase() + stat.slice(1);
                    const percentage = (value / 255) * 100;
                    
                    return (
                      <div key={stat} className="flex items-center gap-4">
                        <span className="w-20 text-gray-600 font-medium">
                          {statName}
                        </span>
                        <span className="w-12 text-right font-bold">{value}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Total</span>
                      <span className="font-bold text-lg">
                        {Object.values(pokemon.stats).reduce((sum: number, val: number) => sum + val, 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-bold mb-2">Training</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">EV Yield: </span>
                      <span className="font-medium">
                        {pokemon.effortPoints.map((ev: number, i: number) => {
                          const stats = ['HP', 'Atk', 'Def', 'Spd', 'SpA', 'SpD'];
                          return ev > 0 ? `${ev} ${stats[i]}` : null;
                        }).filter(Boolean).join(", ") || "None"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Base Exp: </span>
                      <span className="font-medium">{pokemon.baseExp}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Growth Rate: </span>
                      <span className="font-medium">{pokemon.growthRate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Base Happiness: </span>
                      <span className="font-medium">{pokemon.happiness}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "moves" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Moves</h2>
                
                {/* Level-up Moves */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Level-up Moves</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Level</th>
                          <th className="text-left py-2">Move</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-left py-2">Category</th>
                          <th className="text-left py-2">Power</th>
                          <th className="text-left py-2">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pokemon.moves.map(({ level, move }: { level: number; move: string }, i: number) => {
                          const moveData = getMoveDetails(move);
                          return (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="py-2">{level}</td>
                              <td className="py-2 font-medium">
                                {moveData ? (
                                  <Link 
                                    to={`/moves/${moveData.id}`} 
                                    className="text-blue-500 hover:underline"
                                  >
                                    {moveData.displayName || moveData.internalName}
                                  </Link>
                                ) : move}
                              </td>
                              <td className="py-2">
                                {moveData && (
                                  <span 
                                    className="px-2 py-1 rounded text-xs text-white"
                                    style={{ backgroundColor: getTypeColor(moveData.type) }}
                                  >
                                    {moveData.type}
                                  </span>
                                )}
                              </td>
                              <td className="py-2">{moveData?.category}</td>
                              <td className="py-2">{moveData?.power || '-'}</td>
                              <td className="py-2">{moveData?.accuracy || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Egg Moves */}
                {pokemon.eggMoves.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Egg Moves</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {pokemon.eggMoves.map((move: string) => {
                        const moveData = getMoveDetails(move);
                        return (
                          <div key={move} className="bg-gray-100 rounded p-2">
                            {moveData ? (
                              <Link 
                                to={`/moves/${moveData.id}`}
                                className="text-blue-500 hover:underline text-sm"
                              >
                                {moveData.displayName || moveData.internalName}
                              </Link>
                            ) : (
                              <span className="text-sm">{move}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "evolution" && (
              <div>
                <h2 className="text-xl font-bold mb-6">Evolution Chain</h2>
                {evolutionChain ? (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 overflow-x-auto">
                    <div className="flex justify-center min-w-fit">
                      {renderEvolutionChain(evolutionChain)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                      <p className="text-gray-500">This Pokémon does not evolve.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}