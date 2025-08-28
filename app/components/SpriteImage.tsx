import { useState, useEffect } from 'react';
import { type SpriteOptions } from '~/lib/sprites';
import { getPokemonIdByName } from '~/lib/pokemon-id-map';
import { getItemSpriteName } from '~/lib/item-sprite-mappings';

interface SpriteImageProps {
  type: 'pokemon' | 'item' | 'trainer';
  internalName: string;
  alt: string;
  className?: string;
  options?: SpriteOptions;
  fallbackSrc?: string;
  pokemonId?: number; // For Pokemon sprites that use numeric IDs
}

/**
 * Component for displaying sprites with automatic fallback handling
 */
export function SpriteImage({ 
  type, 
  internalName, 
  alt, 
  className = '', 
  options = {},
  fallbackSrc = '/sprites/unknown.svg',
  pokemonId
}: SpriteImageProps) {
  const [hasError, setHasError] = useState(false);

  // Generate sprite path based on type
  const generateSpritePath = () => {
    switch (type) {
      case 'pokemon': {
        const { shiny = false, female = false, back = false } = options;
        let path = '/sprites/pokemon';
        
        if (back) path += '/back';
        if (shiny) path += '/shiny';
        if (female) path += '/female';
        
        // Use Pokemon ID if provided
        if (pokemonId) {
          return `${path}/${pokemonId}.png`;
        }
        
        // Try to get ID from the complete mapping
        const mappedId = getPokemonIdByName(internalName);
        if (mappedId) {
          return `${path}/${mappedId}.png`;
        }
        
        // Last resort: try lowercase name (shouldn't happen)
        const filename = `${internalName.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
        return `${path}/${filename}`;
      }
      case 'item': {
        // Use the improved mapping function
        const spriteName = getItemSpriteName(internalName);
        return `/sprites/items/${spriteName}.png`;
      }
      case 'trainer': {
        const cleanName = internalName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `/sprites/trainers/${cleanName}.png`;
      }
      default:
        return fallbackSrc;
    }
  };

  const spritePath = hasError ? fallbackSrc : generateSpritePath();

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <img
      src={spritePath}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
}

/**
 * Pokemon-specific sprite component with common options
 */
export function PokemonSprite({ 
  internalName, 
  name, 
  className = "w-16 h-16", 
  shiny = false,
  female = false,
  back = false,
  pokemonId
}: { 
  internalName: string; 
  name: string; 
  className?: string;
  shiny?: boolean;
  female?: boolean;
  back?: boolean;
  pokemonId?: number;
}) {
  return (
    <SpriteImage
      type="pokemon"
      internalName={internalName}
      alt={`${name}${shiny ? ' (Shiny)' : ''}${female ? ' (Female)' : ''}${back ? ' (Back)' : ''}`}
      className={className}
      options={{ shiny, female, back }}
      pokemonId={pokemonId}
    />
  );
}

/**
 * Item-specific sprite component
 */
export function ItemSprite({ 
  internalName, 
  name, 
  className = "w-8 h-8" 
}: { 
  internalName: string; 
  name: string; 
  className?: string;
}) {
  return (
    <SpriteImage
      type="item"
      internalName={internalName}
      alt={name}
      className={className}
    />
  );
}

/**
 * Trainer-specific sprite component
 */
export function TrainerSprite({ 
  internalName, 
  name, 
  className = "w-16 h-16" 
}: { 
  internalName: string; 
  name: string; 
  className?: string;
}) {
  return (
    <SpriteImage
      type="trainer"
      internalName={internalName}
      alt={name}
      className={className}
    />
  );
}