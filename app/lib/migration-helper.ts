/**
 * Migration Helper - Maps old parser functions to new JSON loaders
 * This file helps maintain backward compatibility during migration
 */

import {
  loadPokemonData,
  loadMovesData,
  loadItemsData,
  loadTrainersData,
  loadEncountersData,
  loadTypesData,
  loadAbilitiesData,
  loadTournamentData
} from './data-loader-v2';

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

// Helper function to load and transform data for backward compatibility
export async function loadLegacyPokemonData(origin: string) {
  const data = await loadPokemonData(origin);
  if (!data) return [];
  // Transform to old format if needed
  return data.list.map(p => ({
    ...p,
    baseStats: p.stats, // Map new stats structure to old baseStats
    internalName: p.internalName,
    types: p.types.filter(Boolean) // Ensure no empty types
  }));
}

export async function loadLegacyMovesData(origin: string) {
  const data = await loadMovesData(origin);
  return data?.list || [];
}

export async function loadLegacyItemsData(origin: string) {
  const data = await loadItemsData(origin);
  return data?.list || [];
}

export async function loadLegacyTrainersData(origin: string) {
  const data = await loadTrainersData(origin);
  return data.list;
}

export async function loadLegacyEncountersData(origin: string) {
  const data = await loadEncountersData(origin);
  return data?.list || [];
}

// Quick migration functions for loaders
export async function migrateLoader(
  type: 'pokemon' | 'moves' | 'items' | 'trainers' | 'encounters',
  origin: string
) {
  switch (type) {
    case 'pokemon':
      return loadPokemonData(origin);
    case 'moves':
      return loadMovesData(origin);
    case 'items':
      return loadItemsData(origin);
    case 'trainers':
      return loadTrainersData(origin);
    case 'encounters':
      return loadEncountersData(origin);
    default:
      throw new Error(`Unknown data type: ${type}`);
  }
}