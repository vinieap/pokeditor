export interface PokemonData {
  id: number;
  name: string;
  internalName: string;
  displayName?: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAttack: number;
    spDefense: number;
  };
  abilities: string[];
  hiddenAbility?: string;
  moves: {
    level: number;
    move: string;
  }[];
  eggMoves: string[];
  evolutions: {
    species: string;
    method: string;
    parameter?: string;
  }[];
  height: number;
  weight: number;
  color: string;
  habitat: string;
  pokedex: string;
  genderRate: string;
  growthRate: string;
  baseExp: number;
  effortPoints: number[];
  rareness: number;
  happiness: number;
  compatibility: string[];
  stepsToHatch: number;
  regionalNumbers: string;
  kind: string;
  shape: number;
}

export interface MoveData {
  id: number;
  internalName: string;
  name: string;
  displayName?: string;
  localName?: string;
  functionCode: string;
  power: number;
  type: string;
  category: string;
  accuracy: number;
  pp: number;
  effectChance: number;
  target: string;
  priority: number;
  flags: string;
  description: string;
}

export interface ItemData {
  id: number;
  internalName: string;
  name: string;
  displayName?: string;
  localName?: string;
  namePlural: string;
  pocket: number;
  price: number;
  description: string;
  fieldUse: number;
  battleUse: number;
  specialItem: number;
  type?: number;
  machine?: string;
}

export type Move = MoveData;
export type TournamentRules = any;

export interface TrainerData {
  id: string;
  type: string;
  name: string;
  version?: number;
  items: string[];
  party: {
    species: string;
    level: number;
    item?: string;
    moves?: string[];
    ability?: string;
    gender?: string;
    form?: number;
    shiny?: boolean;
    nature?: string;
    iv?: number;
    happiness?: number;
    nickname?: string;
    shadow?: boolean;
    ball?: number;
  }[];
}

export interface EncounterData {
  id: number;
  mapId: number;
  mapName: string;
  landRate: number;
  caveRate: number;
  waterRate: number;
  encounters: {
    type: string;
    pokemon: {
      species: string;
      minLevel: number;
      maxLevel: number;
      probability: number;
    }[];
  }[];
}

export interface TypeData {
  id: number;
  name: string;
  internalName: string;
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
}

export interface AbilityData {
  id: number;
  internalName: string;
  name: string;
  description: string;
}

export interface TournamentTrainerData {
  id: number;
  type: string;
  name: string;
  pokemonIds: number[];
  beginSpeech: string;
  endSpeechWin: string;
  endSpeechLose: string;
}

// Pocket types for items
export enum ItemPocket {
  ITEMS = 0,
  MEDICINE = 1,
  POKEBALLS = 2,
  TMS_HMS = 3,
  BERRIES = 4,
  MAIL = 5,
  BATTLE_ITEMS = 6,
  KEY_ITEMS = 7
}

// Move categories
export enum MoveCategory {
  PHYSICAL = 'Physical',
  SPECIAL = 'Special',
  STATUS = 'Status'
}

// Gender rates
export enum GenderRate {
  ALWAYS_MALE = 'AlwaysMale',
  FEMALE_ONE_EIGHTH = 'FemaleOneEighth',
  FEMALE_25_PERCENT = 'Female25Percent',
  FEMALE_50_PERCENT = 'Female50Percent',
  FEMALE_75_PERCENT = 'Female75Percent',
  FEMALE_SEVEN_EIGHTHS = 'FemaleSevenEighths',
  ALWAYS_FEMALE = 'AlwaysFemale',
  GENDERLESS = 'Genderless'
}

// Growth rates
export enum GrowthRate {
  FAST = 'Fast',
  MEDIUM_FAST = 'MediumFast',
  MEDIUM_SLOW = 'MediumSlow',
  SLOW = 'Slow',
  ERRATIC = 'Erratic',
  FLUCTUATING = 'Fluctuating',
  PARABOLIC = 'Parabolic'
}

// Helper types
export type PokemonType = TypeData['internalName'];
export type PokemonAbility = AbilityData['internalName'];
export type MoveName = MoveData['internalName'];
export type ItemName = ItemData['internalName'];