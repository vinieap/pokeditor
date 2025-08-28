import { PokemonSprite } from './SpriteImage';

interface PokemonData {
  id: number;
  name: string;
  internalName: string;
  type1?: string;
  type2?: string;
  baseStats?: number[];
}

interface PokemonCardProps {
  pokemon: PokemonData;
  showShiny?: boolean;
  className?: string;
}

/**
 * Pokemon card component with sprite display
 * Uses Gen 6 and earlier sprites as preferred
 */
export function PokemonCard({ 
  pokemon, 
  showShiny = false, 
  className = "bg-white rounded-lg shadow-md p-4" 
}: PokemonCardProps) {
  const { id, name, internalName, type1, type2, baseStats } = pokemon;

  const typeColors = {
    NORMAL: 'bg-gray-400',
    FIRE: 'bg-red-500',
    WATER: 'bg-blue-500',
    ELECTRIC: 'bg-yellow-400',
    GRASS: 'bg-green-500',
    ICE: 'bg-blue-300',
    FIGHTING: 'bg-red-700',
    POISON: 'bg-purple-500',
    GROUND: 'bg-yellow-600',
    FLYING: 'bg-indigo-400',
    PSYCHIC: 'bg-pink-500',
    BUG: 'bg-green-400',
    ROCK: 'bg-yellow-800',
    GHOST: 'bg-purple-700',
    DRAGON: 'bg-purple-600',
    DARK: 'bg-gray-800',
    STEEL: 'bg-gray-500',
    FAIRY: 'bg-pink-300',
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-4">
        {/* Pokemon Sprite */}
        <div className="flex-shrink-0">
          <PokemonSprite
            internalName={internalName}
            name={name}
            className="w-20 h-20"
            shiny={showShiny}
          />
        </div>

        {/* Pokemon Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-500">#{id.toString().padStart(3, '0')}</span>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            {showShiny && <span className="text-xs bg-yellow-200 px-1 py-0.5 rounded">✨</span>}
          </div>

          {/* Types */}
          <div className="flex space-x-2 mb-2">
            {type1 && (
              <span className={`px-2 py-1 rounded text-white text-xs font-medium ${typeColors[type1 as keyof typeof typeColors] || 'bg-gray-400'}`}>
                {type1}
              </span>
            )}
            {type2 && (
              <span className={`px-2 py-1 rounded text-white text-xs font-medium ${typeColors[type2 as keyof typeof typeColors] || 'bg-gray-400'}`}>
                {type2}
              </span>
            )}
          </div>

          {/* Base Stats */}
          {baseStats && baseStats.length >= 6 && (
            <div className="text-xs text-gray-600">
              <div className="grid grid-cols-3 gap-1">
                <span>HP: {baseStats[0]}</span>
                <span>ATK: {baseStats[1]}</span>
                <span>DEF: {baseStats[2]}</span>
                <span>SPA: {baseStats[4]}</span>
                <span>SPD: {baseStats[5]}</span>
                <span>SPE: {baseStats[3]}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Pokemon sprite showcase with multiple variants
 */
export function PokemonSpriteShowcase({ 
  pokemon 
}: { 
  pokemon: PokemonData 
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium mb-3">{pokemon.name} Sprites</h4>
      <div className="grid grid-cols-2 gap-4">
        {/* Normal */}
        <div className="text-center">
          <PokemonSprite
            internalName={pokemon.internalName}
            name={pokemon.name}
            className="w-16 h-16 mx-auto"
          />
          <p className="text-xs text-gray-600 mt-1">Normal</p>
        </div>

        {/* Shiny */}
        <div className="text-center">
          <PokemonSprite
            internalName={pokemon.internalName}
            name={pokemon.name}
            className="w-16 h-16 mx-auto"
            shiny={true}
          />
          <p className="text-xs text-gray-600 mt-1">Shiny ✨</p>
        </div>

        {/* Back */}
        <div className="text-center">
          <PokemonSprite
            internalName={pokemon.internalName}
            name={pokemon.name}
            className="w-16 h-16 mx-auto"
            back={true}
          />
          <p className="text-xs text-gray-600 mt-1">Back</p>
        </div>

        {/* Back Shiny */}
        <div className="text-center">
          <PokemonSprite
            internalName={pokemon.internalName}
            name={pokemon.name}
            className="w-16 h-16 mx-auto"
            shiny={true}
            back={true}
          />
          <p className="text-xs text-gray-600 mt-1">Back Shiny</p>
        </div>
      </div>
    </div>
  );
}