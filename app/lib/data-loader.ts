import type { 
  PokemonData, 
  MoveData, 
  ItemData, 
  TrainerData 
} from './types';

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
}

const cache: DataCache = {};
const loadingPromises: Record<string, Promise<any>> = {};

export async function loadPokemonData(origin: string) {
  if (cache.pokemon) {
    return cache.pokemon;
  }
  
  if (loadingPromises.pokemon !== undefined) {
    return loadingPromises.pokemon;
  }
  
  loadingPromises.pokemon = fetch(`${origin}/data/json/pokemon.json`)
    .then(res => res.json())
    .then((data) => {
      cache.pokemon = data as typeof cache.pokemon;
      delete loadingPromises.pokemon;
      return data as typeof cache.pokemon;
    })
    .catch(error => {
      delete loadingPromises.pokemon;
      throw error;
    });
  
  return loadingPromises.pokemon;
}

export async function loadMovesData(origin: string) {
  if (cache.moves) {
    return cache.moves;
  }
  
  if (loadingPromises.moves !== undefined) {
    return loadingPromises.moves;
  }
  
  loadingPromises.moves = fetch(`${origin}/data/json/moves.json`)
    .then(res => res.json())
    .then((data) => {
      cache.moves = data as typeof cache.moves;
      delete loadingPromises.moves;
      return data as typeof cache.moves;
    })
    .catch(error => {
      delete loadingPromises.moves;
      throw error;
    });
  
  return loadingPromises.moves;
}

export async function loadItemsData(origin: string) {
  if (cache.items) {
    return cache.items;
  }
  
  if (loadingPromises.items !== undefined) {
    return loadingPromises.items;
  }
  
  loadingPromises.items = fetch(`${origin}/data/json/items.json`)
    .then(res => res.json())
    .then((data) => {
      cache.items = data as typeof cache.items;
      delete loadingPromises.items;
      return data as typeof cache.items;
    })
    .catch(error => {
      delete loadingPromises.items;
      throw error;
    });
  
  return loadingPromises.items;
}

export async function loadTrainersData(origin: string) {
  if (cache.trainers) {
    return cache.trainers;
  }
  
  if (loadingPromises.trainers !== undefined) {
    return loadingPromises.trainers;
  }
  
  loadingPromises.trainers = fetch(`${origin}/data/json/trainers.json`)
    .then(res => res.json())
    .then((data) => {
      cache.trainers = data as typeof cache.trainers;
      delete loadingPromises.trainers;
      return data as typeof cache.trainers;
    })
    .catch(error => {
      delete loadingPromises.trainers;
      throw error;
    });
  
  return loadingPromises.trainers;
}

export function getPokemonById(id: number): PokemonData | undefined {
  return cache.pokemon?.byId[id];
}

export function getPokemonByInternalName(name: string): PokemonData | undefined {
  if (!cache.pokemon) return undefined;
  const id = cache.pokemon.byInternalName[name];
  return id ? cache.pokemon.byId[id] : undefined;
}

export function getMoveById(id: number): MoveData | undefined {
  return cache.moves?.byId[id];
}

export function getMoveByInternalName(name: string): MoveData | undefined {
  if (!cache.moves) return undefined;
  const id = cache.moves.byInternalName[name];
  return id ? cache.moves.byId[id] : undefined;
}

export function getItemById(id: number): ItemData | undefined {
  return cache.items?.byId[id];
}

export function getItemByInternalName(name: string): ItemData | undefined {
  if (!cache.items) return undefined;
  const id = cache.items.byInternalName[name];
  return id ? cache.items.byId[id] : undefined;
}

export function getTrainerById(id: string): TrainerData | undefined {
  return cache.trainers?.byId[id];
}

export function getTrainersByType(type: string): TrainerData[] {
  if (!cache.trainers) return [];
  const ids = cache.trainers.byType[type] || [];
  return ids.map(id => cache.trainers!.byId[id]).filter(Boolean);
}

export function searchPokemon(query: string): PokemonData[] {
  if (!cache.pokemon) return [];
  const q = query.toLowerCase();
  
  return cache.pokemon.list.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.internalName.toLowerCase().includes(q) ||
    p.id.toString() === query
  );
}

export function searchMoves(query: string): MoveData[] {
  if (!cache.moves) return [];
  const q = query.toLowerCase();
  
  return cache.moves.list.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.internalName.toLowerCase().includes(q) ||
    m.type.toLowerCase() === q
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