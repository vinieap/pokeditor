import pokemonDataJson from '../../public/data/json/pokemon.json';
import movesDataJson from '../../public/data/json/moves.json';
import itemsDataJson from '../../public/data/json/items.json';
import trainersDataJson from '../../public/data/json/trainers.json';
import trainerTypesDataJson from '../../public/data/json/trainertypes.json';
import encountersDataJson from '../../public/data/json/encounters.json';
import typesDataJson from '../../public/data/json/types.json';
import abilitiesDataJson from '../../public/data/json/abilities.json';

// This module provides static imports of the JSON data for server-side rendering
// This avoids the need for fetch requests in Cloudflare Workers

export function loadPokemonDataStatic() {
  const data = pokemonDataJson as any;
  return {
    ...data,
    index: data.byId || {}
  };
}

export function loadMovesDataStatic() {
  const data = movesDataJson as any;
  return {
    ...data,
    index: data.byId || {}
  };
}

export function loadItemsDataStatic() {
  const data = itemsDataJson as any;
  return {
    ...data,
    index: data.byId || {}
  };
}

export function loadTrainersDataStatic() {
  // Clean up trainer IDs (remove carriage returns) if needed
  const cleanedById: Record<string, any> = {};
  const cleanedList: any[] = [];
  
  if ((trainersDataJson as any)?.byId) {
    Object.entries((trainersDataJson as any).byId).forEach(([key, value]) => {
      const cleanId = key.replace(/\r/g, '');
      cleanedById[cleanId] = {
        ...value,
        id: cleanId
      };
      cleanedList.push(cleanedById[cleanId]);
    });
  }
  
  return {
    byId: cleanedById,
    list: cleanedList,
    // Return as 'index' too for compatibility
    index: cleanedById
  };
}

export function loadTrainerTypesDataStatic() {
  // Add index property for compatibility
  const data = trainerTypesDataJson as any;
  return {
    ...data,
    index: data.byId || {}
  };
}

export function loadEncountersDataStatic() {
  return encountersDataJson;
}

export function loadTypesDataStatic() {
  return typesDataJson;
}

export function loadAbilitiesDataStatic() {
  const data = abilitiesDataJson as any;
  return {
    ...data,
    index: data.byId || {}
  };
}