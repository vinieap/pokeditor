/**
 * Sprite utilities for Pokemon, items, and other game assets
 */

export interface SpriteOptions {
  shiny?: boolean;
  female?: boolean;
  back?: boolean;
}

/**
 * Get Pokemon sprite path based on internal name and options
 * Prioritizes Gen 6 and earlier sprites, with preference for later generations
 */
export function getPokemonSprite(internalName: string, options: SpriteOptions = {}): string {
  const { shiny = false, female = false, back = false } = options;
  
  // Convert internal name to Pokemon ID format (lowercase, no special chars)
  const pokemonId = internalName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Priority order for sprite sources (Gen 6 and earlier, preferring latest)
  const spriteGenerations = [
    'other/official-artwork', // Official artwork (best quality)
    'other/x-y',             // Gen 6 X/Y sprites
    'other/black-white/animated', // Gen 5 animated sprites
    'other/black-white',     // Gen 5 static sprites
    'other/heartgold-soulsilver', // Gen 4 HGSS sprites
    'other/diamond-pearl',   // Gen 4 DP sprites
    'other/emerald',         // Gen 3 Emerald sprites
    'other/ruby-sapphire',   // Gen 3 RS sprites
    'other/crystal',         // Gen 2 Crystal sprites
    'other/gold-silver',     // Gen 2 GS sprites
    'other/red-blue',        // Gen 1 RB sprites
    ''                       // Default modern sprites as fallback
  ];
  
  // Build sprite path based on options
  let basePath = '/sprites/pokemon';
  let filename = `${pokemonId}.png`;
  
  if (back) basePath += '/back';
  if (shiny) basePath += '/shiny';
  if (female) basePath += '/female';
  
  // For now, use the default path structure
  // When sprites are installed, we can implement generation-specific fallback logic
  return `${basePath}/${filename}`;
}

/**
 * Get Pokemon sprite with generation preference fallback
 */
export function getPokemonSpriteWithGeneration(
  internalName: string, 
  preferredGeneration: string = 'x-y',
  options: SpriteOptions = {}
): string {
  const pokemonId = internalName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const { shiny = false, female = false, back = false } = options;
  
  let path = `/sprites/pokemon`;
  
  // Add generation-specific path if not default
  if (preferredGeneration && preferredGeneration !== 'default') {
    path += `/other/${preferredGeneration}`;
  }
  
  if (back) path += '/back';
  if (shiny) path += '/shiny';
  if (female) path += '/female';
  
  return `${path}/${pokemonId}.png`;
}

/**
 * Get item sprite path based on internal name
 */
export function getItemSprite(internalName: string): string {
  const itemId = internalName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `/sprites/items/${itemId}.png`;
}

/**
 * Get trainer sprite path based on trainer type or name
 */
export function getTrainerSprite(trainerName: string): string {
  const trainerId = trainerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `/sprites/trainers/${trainerId}.png`;
}

/**
 * Check if sprite exists (for fallback handling)
 */
export async function spriteExists(spritePath: string): Promise<boolean> {
  try {
    const response = await fetch(spritePath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get fallback sprite if primary doesn't exist
 */
export async function getSpriteWithFallback(
  primaryPath: string, 
  fallbackPath: string = '/sprites/unknown.svg'
): Promise<string> {
  const exists = await spriteExists(primaryPath);
  return exists ? primaryPath : fallbackPath;
}

/**
 * Parse Pokemon data file entry to extract sprite-relevant info
 */
export function parsePokemonEntry(entry: string): { id: number; internalName: string; name: string } | null {
  const lines = entry.trim().split('\n');
  const header = lines[0];
  
  if (!header.startsWith('[') || !header.endsWith(']')) {
    return null;
  }
  
  const id = parseInt(header.slice(1, -1));
  let internalName = '';
  let name = '';
  
  for (const line of lines.slice(1)) {
    if (line.startsWith('Name=')) {
      name = line.split('=')[1];
    } else if (line.startsWith('InternalName=')) {
      internalName = line.split('=')[1];
    }
  }
  
  return { id, internalName, name };
}

/**
 * Parse item data file entry to extract sprite-relevant info
 */
export function parseItemEntry(entry: string): { id: number; internalName: string; name: string } | null {
  const parts = entry.split(',');
  if (parts.length < 3) return null;
  
  const id = parseInt(parts[0]);
  const internalName = parts[1];
  const name = parts[2];
  
  return { id, internalName, name };
}