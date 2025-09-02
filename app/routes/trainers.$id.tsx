import { Link, useParams, useLoaderData } from "react-router";
import type { Route } from "./+types/trainers.$id";
import { 
  loadTrainersData, 
  loadTrainerTypesData, 
  loadPokemonData, 
  loadItemsData, 
  loadMovesData,
  loadAbilitiesData
} from "~/lib/data-loader-v2";
import type { TrainerData } from "~/lib/types-v2";

type TrainerPokemon = TrainerData['party'][0];
type Move = any;
type Ability = any;
import { PokemonSprite } from "~/components/SpriteImage";
import { ResponsiveSpriteImage } from "~/components/ResponsiveSpriteImage";
import { getTypeColor, getTypeColorClass } from "~/lib/utils/typeColors";
import { calculateTypeEffectiveness } from "~/lib/utils/typeEffectiveness";

export function meta({ params, data }: Route.MetaArgs) {
  const trainer = data?.trainer;
  return [
    { title: trainer ? `${trainer.name} - Trainer Details` : `Trainer - Pokeditor` },
    { name: "description", content: trainer ? `View ${trainer.name}'s team and battle configuration` : `View trainer team and battle configuration` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const trainerId = params.id;
    
    // Load all data in parallel using JSON loaders
    const [trainersData, trainerTypesData, pokemonData, itemsData, movesData, abilitiesData] = await Promise.all([
      loadTrainersData(url.origin),
      loadTrainerTypesData(url.origin),
      loadPokemonData(url.origin),
      loadItemsData(url.origin),
      loadMovesData(url.origin),
      loadAbilitiesData(url.origin)
    ]);
    
    // Find the specific trainer by ID using the index
    let trainer = trainersData.index[trainerId] || trainersData.list.find((t: any) => t.id === trainerId);
    
    if (!trainer) {
      throw new Response("Trainer not found", { status: 404 });
    }
    
    const trainerIndex = trainersData.list.indexOf(trainersData.index[trainerId] || trainer);
    
    // Find trainer type info
    const trainerType = trainerTypesData.index[trainer.type] || 
                      trainerTypesData.list.find(t => t.id === trainer.type);
    
    return { 
      trainer, 
      trainerType, 
      pokemonList: pokemonData?.list || [], 
      itemsList: itemsData?.list || [], 
      movesList: movesData?.list || [], 
      abilitiesList: abilitiesData?.list || [], 
      trainerIndex 
    };
  } catch (error) {
    console.error('Failed to load trainer data:', error);
    throw error;
  }
}


const natureEffects: Record<string, { plus: string; minus: string }> = {
  Hardy: { plus: '', minus: '' },
  Lonely: { plus: 'Attack', minus: 'Defense' },
  Brave: { plus: 'Attack', minus: 'Speed' },
  Adamant: { plus: 'Attack', minus: 'Sp. Attack' },
  Naughty: { plus: 'Attack', minus: 'Sp. Defense' },
  Bold: { plus: 'Defense', minus: 'Attack' },
  Docile: { plus: '', minus: '' },
  Relaxed: { plus: 'Defense', minus: 'Speed' },
  Impish: { plus: 'Defense', minus: 'Sp. Attack' },
  Lax: { plus: 'Defense', minus: 'Sp. Defense' },
  Timid: { plus: 'Speed', minus: 'Attack' },
  Hasty: { plus: 'Speed', minus: 'Defense' },
  Serious: { plus: '', minus: '' },
  Jolly: { plus: 'Speed', minus: 'Sp. Attack' },
  Naive: { plus: 'Speed', minus: 'Sp. Defense' },
  Modest: { plus: 'Sp. Attack', minus: 'Attack' },
  Mild: { plus: 'Sp. Attack', minus: 'Defense' },
  Quiet: { plus: 'Sp. Attack', minus: 'Speed' },
  Bashful: { plus: '', minus: '' },
  Rash: { plus: 'Sp. Attack', minus: 'Sp. Defense' },
  Calm: { plus: 'Sp. Defense', minus: 'Attack' },
  Gentle: { plus: 'Sp. Defense', minus: 'Defense' },
  Sassy: { plus: 'Sp. Defense', minus: 'Speed' },
  Careful: { plus: 'Sp. Defense', minus: 'Sp. Attack' },
  Quirky: { plus: '', minus: '' },
};

function PokemonCard({ pokemon, pokemonData, itemData, moveData, abilityData }: { 
  pokemon: TrainerPokemon; 
  pokemonData: any[];
  itemData: any[];
  moveData: Move[];
  abilityData: Ability[];
}) {
  const speciesData = pokemonData.find((p: any) => 
    p.internalName === pokemon.species || 
    p.internalName === pokemon.species + '\r'
  );
  const heldItem = itemData.find(i => i.internalName === pokemon.item);
  const displayName = speciesData?.name || pokemon.species;
  
  const nature = natureEffects[pokemon.nature || ''] || { plus: '', minus: '' };

  // Calculate type effectiveness if we have species data with types
  const typeEffectiveness = speciesData?.types ? (() => {
    try {
      return calculateTypeEffectiveness(speciesData.types);
    } catch (error) {
      console.error('Error calculating type effectiveness:', error);
      return null;
    }
  })() : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex gap-4">
        {/* Sprite - Now clickable */}
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
          {speciesData?.id ? (
            <Link to={`/pokemon/${speciesData.id}`} className="block w-full h-full hover:scale-105 transition-transform">
              <ResponsiveSpriteImage
                id={speciesData.id.toString()}
                alt={displayName}
                size={96}
                loading="lazy"
                className="w-full h-full object-contain pixelated"
              />
            </Link>
          ) : (
            <PokemonSprite
              internalName={pokemon.species}
              name={displayName}
              pokemonId={speciesData?.id}
              className="w-full h-full object-contain pixelated"
            />
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {speciesData?.id ? (
              <Link to={`/pokemon/${speciesData.id}`}>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white hover:text-blue-500 transition-colors">
                  {displayName}
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {displayName}
              </h3>
            )}
            {pokemon.nickname && (
              <span className="text-sm text-gray-500 dark:text-gray-400">"{pokemon.nickname}"</span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">Lv.{pokemon.level}</span>
            {pokemon.shiny && <span className="text-yellow-600" title="Shiny">✨</span>}
          </div>
          
          {/* Types */}
          {speciesData && speciesData.types && (
            <div className="flex gap-1 mb-3">
              {speciesData.types.filter(Boolean).map((type: string, i: number) => (
                <span 
                  key={i}
                  className="px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getTypeColor(type.replace('\r', '')) }}
                >
                  {type.replace('\r', '')}
                </span>
              ))}
            </div>
          )}

          {/* Type Effectiveness */}
          {typeEffectiveness && speciesData && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type Matchups</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {typeEffectiveness.weakTo.length > 0 && (
                  <div>
                    <span className="text-red-600 dark:text-red-400 font-medium">Weak to:</span>{' '}
                    <div className="inline-flex flex-wrap gap-1">
                      {typeEffectiveness.weakTo.map(type => (
                        <span
                          key={type}
                          className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {typeEffectiveness.resistantTo.length > 0 && (
                  <div>
                    <span className="text-green-600 dark:text-green-400 font-medium">Resists:</span>{' '}
                    <div className="inline-flex flex-wrap gap-1">
                      {typeEffectiveness.resistantTo.map(type => (
                        <span
                          key={type}
                          className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {typeEffectiveness.immuneTo.length > 0 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Immune to:</span>{' '}
                    <div className="inline-flex flex-wrap gap-1">
                      {typeEffectiveness.immuneTo.map(type => (
                        <span
                          key={type}
                          className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {pokemon.gender && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Gender:</span>{' '}
                <span className={pokemon.gender === 'M' ? 'text-blue-600' : 'text-pink-600'}>
                  {pokemon.gender === 'M' ? '♂' : '♀'}
                </span>
              </div>
            )}
            
            {pokemon.nature && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Nature:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {pokemon.nature}
                  {nature.plus && (
                    <span className="text-xs ml-1">
                      (<span className="text-red-600">+{nature.plus}</span>
                      /<span className="text-blue-600">-{nature.minus}</span>)
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {pokemon.item && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Item:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">{heldItem?.internalName || pokemon.item}</span>
              </div>
            )}
            
            {pokemon.abilityIndex !== undefined && (
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Ability:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {(() => {
                    const abilityName = speciesData?.abilities?.[pokemon.abilityIndex];
                    const ability = abilityData.find(a => a.internalName === abilityName);
                    return abilityName || ability?.name || `Ability ${pokemon.abilityIndex}`;
                  })()}
                </span>
              </div>
            )}
            
            {pokemon.happiness !== undefined && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Happiness:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">{pokemon.happiness}</span>
              </div>
            )}
            
            {pokemon.form !== undefined && pokemon.form > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Form:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">Form {pokemon.form}</span>
              </div>
            )}
          </div>
          
          {/* Base Stats */}
          {speciesData?.baseStats && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Base Stats:</p>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">HP:</span>
                  <span className="font-medium">{speciesData.baseStats.hp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ATK:</span>
                  <span className="font-medium">{speciesData.baseStats.attack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DEF:</span>
                  <span className="font-medium">{speciesData.baseStats.defense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SPA:</span>
                  <span className="font-medium">{speciesData.baseStats.spAttack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SPD:</span>
                  <span className="font-medium">{speciesData.baseStats.spDefense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SPE:</span>
                  <span className="font-medium">{speciesData.baseStats.speed}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total: <span className="font-medium">
                  {speciesData.baseStats.hp + speciesData.baseStats.attack + speciesData.baseStats.defense + 
                   speciesData.baseStats.spAttack + speciesData.baseStats.spDefense + speciesData.baseStats.speed}
                </span>
              </div>
            </div>
          )}
          
          {/* IVs/EVs */}
          <div className="mt-2 space-y-1">
            {pokemon.iv !== undefined && (
              <div className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">IVs:</span>{' '}
                <span className="font-mono">
                  {typeof pokemon.iv === 'number' ? 
                    `All stats: ${pokemon.iv}` : 
                    Array.isArray(pokemon.iv) ? 
                      `HP:${pokemon.iv[0]} ATK:${pokemon.iv[1]} DEF:${pokemon.iv[2]} SPE:${pokemon.iv[3]} SPA:${pokemon.iv[4]} SPD:${pokemon.iv[5]}` :
                      pokemon.iv
                  }
                </span>
              </div>
            )}
            
            {(pokemon as any).evs && (pokemon as any).evs.length > 0 && (
              <div className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">EVs:</span>{' '}
                <span className="font-mono">
                  HP:{(pokemon as any).evs[0]} ATK:{(pokemon as any).evs[1]} DEF:{(pokemon as any).evs[2]}{' '}
                  SPE:{(pokemon as any).evs[3]} SPA:{(pokemon as any).evs[4]} SPD:{(pokemon as any).evs[5]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Moves */}
      {pokemon.moves && pokemon.moves.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Moves:</p>
          <div className="space-y-2">
            {pokemon.moves.map((moveName, i) => {
              const move = moveData.find(m => m.internalName === moveName);
              if (!move) {
                return (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded">
                    <span className="font-medium">{moveName}</span>
                  </div>
                );
              }
              return (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 px-2 py-1.5 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{move.internalName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTypeColor(move.type)}`}>
                        {move.type}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        move.category === 'Physical' ? 'bg-orange-100 text-orange-800' :
                        move.category === 'Special' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {move.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {move.basePower > 0 && (
                      <span>Power: <span className="font-medium">{move.basePower}</span></span>
                    )}
                    {move.accuracy > 0 && (
                      <span>Acc: <span className="font-medium">{move.accuracy}%</span></span>
                    )}
                    <span>PP: <span className="font-medium">{move.pp}</span></span>
                    {move.priority !== 0 && (
                      <span>Priority: <span className="font-medium">{move.priority > 0 ? '+' : ''}{move.priority}</span></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainerDetail() {
  const { id } = useParams();
  const { trainer, trainerType, pokemonList, itemsList, movesList, abilitiesList, trainerIndex } = useLoaderData<typeof loader>();

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trainer Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">This trainer could not be found</p>
          <Link to="/trainers" className="text-blue-500 hover:text-blue-700">
            Back to Trainers List
          </Link>
        </div>
      </div>
    );
  }

  const totalLevels = trainer.party.reduce((sum: number, p: any) => sum + p.level, 0);
  const avgLevel = Math.round(totalLevels / trainer.party.length);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/trainers" 
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            ← Back to Trainers List
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {trainer.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {trainer.trainerType}
                    {trainer.version && ` (Version ${trainer.version})`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Trainer #{trainerIndex + 1}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {trainer.party.length} Pokémon
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Avg. Level {avgLevel}
                  </div>
                </div>
              </div>
              
              {/* Battle Items */}
              {trainer.items && trainer.items.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Battle Items</h3>
                  <div className="flex flex-wrap gap-2">
                    {trainer.items.map((item: any, i: number) => {
                      const itemData = itemsList.find((it: any) => it.internalName === item);
                      return (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {itemData?.displayName || itemData?.name || item}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Team */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Team</h2>
              {trainer.party.map((pokemon: any, idx: number) => (
                <PokemonCard 
                  key={idx}
                  pokemon={pokemon}
                  pokemonData={pokemonList}
                  itemData={itemsList}
                  moveData={movesList}
                  abilityData={abilitiesList}
                />
              ))}
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            {/* Trainer Type Info */}
            {trainerType && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Trainer Class</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{trainerType.name}</p>
                  </div>
                  
                  {trainerType.baseMoney > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Base Money</p>
                      <p className="font-semibold text-gray-900 dark:text-white">₽{trainerType.baseMoney}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Prize: ₽{trainerType.baseMoney * avgLevel}
                      </p>
                    </div>
                  )}
                  
                  {trainerType.skillLevel && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Skill Level</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-orange-500 rounded-full"
                            style={{ width: `${(trainerType.skillLevel / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{trainerType.skillLevel}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Team Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Team Size</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{trainer.party.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Level</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{avgLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Level Range</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(...trainer.party.map((p: any) => p.level))} - {Math.max(...trainer.party.map((p: any) => p.level))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Has Items</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {trainer.party.filter((p: any) => p.item).length} Pokémon
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Custom Moves</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {trainer.party.filter((p: any) => p.moves && p.moves.length > 0).length} Pokémon
                  </span>
                </div>
                {trainer.party.some(p => p.shiny) && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shiny Pokémon</span>
                    <span className="font-semibold text-yellow-600">
                      {trainer.party.filter((p: any) => p.shiny).length} ✨
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Level Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Level Distribution</h3>
              <div className="space-y-2">
                {trainer.party.map((pokemon: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {pokemonList.find((p: any) => p.internalName === pokemon.species)?.name || pokemon.species}
                      </span>
                      <span className="text-sm font-semibold">Lv.{pokemon.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(pokemon.level / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Internal Data</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Trainer Type</span>
                  <code className="font-mono">{trainer.trainerType}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name</span>
                  <span className="font-medium text-gray-900 dark:text-white">{trainer.name}</span>
                </div>
                {trainer.version && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Version</span>
                    <span className="font-medium text-gray-900 dark:text-white">{trainer.version}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{trainer.id || `#${trainerIndex + 1}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}