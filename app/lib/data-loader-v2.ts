import type { 
  PokemonData, 
  MoveData, 
  ItemData, 
  TrainerData,
  EncounterData,
  TypeData,
  AbilityData,
  TournamentTrainerData
} from './types-v2';

// Import static data for server-side rendering
import {
  loadPokemonDataStatic,
  loadMovesDataStatic,
  loadItemsDataStatic,
  loadTrainersDataStatic,
  loadTrainerTypesDataStatic,
  loadEncountersDataStatic,
  loadTypesDataStatic,
  loadAbilitiesDataStatic
} from './data-loader-static';

interface TrainerTypeData {
  id: string;
  name: string;
  baseMoney: number;
  skillLevel: number;
}

interface DataCache {
  pokemon?: {
    byId: Record<number, PokemonData>;
    byInternalName: Record<string, number>;
    list: PokemonData[];
  };
  moves?: {
    byId: Record<number, MoveData>;
    byInternalName: Record<string, number>;
    list: MoveData[];
  };
  items?: {
    byId: Record<number, ItemData>;
    byInternalName: Record<string, number>;
    list: ItemData[];
  };
  trainers?: {
    byId: Record<string, TrainerData>;
    byType: Record<string, string[]>;
    list: TrainerData[];
  };
  trainerTypes?: {
    byId: Record<string, TrainerTypeData>;
    list: TrainerTypeData[];
  };
  encounters?: {
    byId: Record<number, EncounterData>;
    list: EncounterData[];
  };
  types?: {
    byId: Record<number, TypeData>;
    byInternalName: Record<string, number>;
    list: TypeData[];
  };
  abilities?: {
    byId: Record<number, AbilityData>;
    byInternalName: Record<string, number>;
    list: AbilityData[];
  };
  tournaments?: Record<string, {
    byId: Record<number, TournamentTrainerData>;
    list: TournamentTrainerData[];
  }>;
}

const cache: DataCache = {};
const loadingPromises: Record<string, Promise<any>> = {};

// Generic loader function
async function loadJsonData<T>(
  dataType: string,
  origin: string
): Promise<T> {
  const cacheKey = dataType;
  
  // Return from cache if available
  if ((cache as any)[cacheKey]) {
    return (cache as any)[cacheKey];
  }
  
  // Return existing promise if loading
  if (loadingPromises[cacheKey] !== undefined) {
    return loadingPromises[cacheKey];
  }
  
  // Start loading
  // For server-side rendering in Cloudflare Workers, we need to use the full URL
  const dataUrl = `${origin}/data/json/${dataType}.json`;
  
  loadingPromises[cacheKey] = fetch(dataUrl, {
    // Add CF properties to bypass cache and ensure fresh data on server
    cf: {
      cacheTtl: 300,
      cacheEverything: true
    }
  } as RequestInit)
    .then(res => {
      if (!res.ok) {
        console.error(`Failed to fetch ${dataUrl}: ${res.status} ${res.statusText}`);
        throw new Error(`Failed to load ${dataType} data`);
      }
      return res.json();
    })
    .then(data => {
      (cache as any)[cacheKey] = data;
      delete loadingPromises[cacheKey];
      return data;
    })
    .catch(error => {
      console.error(`Error loading ${dataType} from ${dataUrl}:`, error);
      delete loadingPromises[cacheKey];
      throw error;
    });
  
  return loadingPromises[cacheKey];
}

// Main data loading functions
export async function loadPokemonData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadPokemonDataStatic();
  }
  return loadJsonData<typeof cache.pokemon>('pokemon', origin);
}

export async function loadMovesData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadMovesDataStatic();
  }
  return loadJsonData<typeof cache.moves>('moves', origin);
}

export async function loadItemsData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadItemsDataStatic();
  }
  return loadJsonData<typeof cache.items>('items', origin);
}

export async function loadTrainersData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadTrainersDataStatic();
  }
  
  if (cache.trainers) {
    return { 
      index: cache.trainers.byId, 
      list: cache.trainers.list 
    };
  }
  
  const url = new URL('/data/json/trainers.json', origin);
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch trainers data: ${response.status}`);
  }
  
  const data: any = await response.json();
  
  // Clean up trainer IDs (remove carriage returns)
  const cleanedById: Record<string, any> = {};
  const cleanedList: any[] = [];
  
  if (data?.byId) {
    Object.entries(data.byId).forEach(([key, value]: [string, any]) => {
      const cleanId = key.replace(/\r/g, '');
      const cleanTrainer = {
        ...value,
        id: cleanId,
        type: (value.type || '').replace(/\r/g, ''),
        name: (value.name || '').replace(/\r/g, '')
      };
      cleanedById[cleanId] = cleanTrainer;
      cleanedList.push(cleanTrainer);
    });
  } else if (data?.list) {
    data.list.forEach((trainer: any) => {
      const cleanId = (trainer.id || '').replace(/\r/g, '');
      const cleanTrainer = {
        ...trainer,
        id: cleanId,
        type: (trainer.type || '').replace(/\r/g, ''),
        name: (trainer.name || '').replace(/\r/g, '')
      };
      cleanedById[cleanId] = cleanTrainer;
      cleanedList.push(cleanTrainer);
    });
  }
  
  cache.trainers = {
    byId: cleanedById,
    byType: {},
    list: cleanedList
  };
  
  return { 
    index: cache.trainers.byId, 
    list: cache.trainers.list 
  };
}

export async function loadEncountersData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadEncountersDataStatic();
  }
  return loadJsonData<typeof cache.encounters>('encounters', origin);
}

export async function loadTypesData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadTypesDataStatic();
  }
  return loadJsonData<typeof cache.types>('types', origin);
}

export async function loadAbilitiesData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadAbilitiesDataStatic();
  }
  return loadJsonData<typeof cache.abilities>('abilities', origin);
}

export async function loadTrainerTypesData(origin: string) {
  // Use static imports on server-side (Cloudflare Workers)
  if (typeof window === 'undefined') {
    return loadTrainerTypesDataStatic();
  }
  if (cache.trainerTypes) {
    return { 
      index: cache.trainerTypes.byId, 
      list: cache.trainerTypes.list 
    };
  }
  
  const url = new URL('/data/json/trainertypes.json', origin);
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch trainer types data: ${response.status}`);
  }
  
  const data: any = await response.json();
  
  cache.trainerTypes = {
    byId: data?.byId || {},
    list: data?.list || []
  };
  
  return { 
    index: cache.trainerTypes.byId, 
    list: cache.trainerTypes.list 
  };
}

export async function loadTournamentData(tournamentName: string, origin: string) {
  if (!cache.tournaments) cache.tournaments = {};
  
  if (cache.tournaments[tournamentName]) {
    return cache.tournaments[tournamentName];
  }
  
  const data = await loadJsonData<typeof cache.tournaments[string]>(
    tournamentName,
    origin
  );
  
  cache.tournaments[tournamentName] = data;
  return data;
}

// Direct access functions
export function getPokemonById(id: number): PokemonData | undefined {
  return cache.pokemon?.byId[id];
}

export function getPokemonByInternalName(name: string): PokemonData | undefined {
  if (!cache.pokemon) return undefined;
  const id = cache.pokemon.byInternalName[name];
  return id !== undefined ? cache.pokemon.byId[id] : undefined;
}

export function getMoveById(id: number): MoveData | undefined {
  return cache.moves?.byId[id];
}

export function getMoveByInternalName(name: string): MoveData | undefined {
  if (!cache.moves) return undefined;
  const id = cache.moves.byInternalName[name];
  return id !== undefined ? cache.moves.byId[id] : undefined;
}

export function getItemById(id: number): ItemData | undefined {
  return cache.items?.byId[id];
}

export function getItemByInternalName(name: string): ItemData | undefined {
  if (!cache.items) return undefined;
  const id = cache.items.byInternalName[name];
  return id !== undefined ? cache.items.byId[id] : undefined;
}

export function getTrainerById(id: string): TrainerData | undefined {
  return cache.trainers?.byId[id];
}

export function getTrainersByType(type: string): TrainerData[] {
  if (!cache.trainers) return [];
  const ids = cache.trainers.byType[type] || [];
  return ids.map(id => cache.trainers!.byId[id]).filter(Boolean);
}

export function getEncounterByMapId(mapId: number): EncounterData | undefined {
  return cache.encounters?.byId[mapId];
}

export function getTypeById(id: number): TypeData | undefined {
  return cache.types?.byId[id];
}

export function getTypeByInternalName(name: string): TypeData | undefined {
  if (!cache.types) return undefined;
  const id = cache.types.byInternalName[name];
  return id !== undefined ? cache.types.byId[id] : undefined;
}

export function getAbilityById(id: number): AbilityData | undefined {
  return cache.abilities?.byId[id];
}

export function getAbilityByInternalName(name: string): AbilityData | undefined {
  if (!cache.abilities) return undefined;
  const id = cache.abilities.byInternalName[name];
  return id !== undefined ? cache.abilities.byId[id] : undefined;
}

// Search functions
export function searchPokemon(query: string): PokemonData[] {
  if (!cache.pokemon) return [];
  const q = query.toLowerCase();
  
  // Check if it's a numeric ID
  if (!isNaN(Number(query))) {
    const pokemon = cache.pokemon.byId[Number(query)];
    return pokemon ? [pokemon] : [];
  }
  
  return cache.pokemon.list.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.internalName.toLowerCase().includes(q) ||
    p.types.some(t => t.toLowerCase().includes(q))
  );
}

export function searchMoves(query: string): MoveData[] {
  if (!cache.moves) return [];
  const q = query.toLowerCase();
  
  return cache.moves.list.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.internalName.toLowerCase().includes(q) ||
    m.type.toLowerCase().includes(q)
  );
}

export function searchItems(query: string): ItemData[] {
  if (!cache.items) return [];
  const q = query.toLowerCase();
  
  return cache.items.list.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.internalName.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q)
  );
}

export function searchTrainers(query: string): TrainerData[] {
  if (!cache.trainers) return [];
  const q = query.toLowerCase();
  
  return cache.trainers.list.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.type.toLowerCase().includes(q)
  );
}

// Utility functions
export function getPokemonTypes(): string[] {
  if (!cache.types) return [];
  return cache.types.list.map(t => t.internalName);
}

export function getPokemonAbilities(): string[] {
  if (!cache.abilities) return [];
  return cache.abilities.list.map(a => a.internalName);
}

export function getMovesByType(type: string): MoveData[] {
  if (!cache.moves) return [];
  return cache.moves.list.filter(m => m.type === type);
}

export function getMovesByCategory(category: string): MoveData[] {
  if (!cache.moves) return [];
  return cache.moves.list.filter(m => m.category === category);
}

export function getItemsByPocket(pocket: number): ItemData[] {
  if (!cache.items) return [];
  return cache.items.list.filter(i => i.pocket === pocket);
}

// Stats functions
export function getDataStats() {
  return {
    pokemon: cache.pokemon?.list.length || 0,
    moves: cache.moves?.list.length || 0,
    items: cache.items?.list.length || 0,
    trainers: cache.trainers?.list.length || 0,
    encounters: cache.encounters?.list.length || 0,
    types: cache.types?.list.length || 0,
    abilities: cache.abilities?.list.length || 0
  };
}

// Clear cache function (useful for testing)
export function clearCache() {
  Object.keys(cache).forEach(key => {
    delete (cache as any)[key];
  });
  Object.keys(loadingPromises).forEach(key => {
    delete loadingPromises[key];
  });
}