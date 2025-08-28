export interface PokemonData {
  id: number;
  name: string;
  internalName: string;
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
  type: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  target: string;
  priority: number;
  functionCode: string;
  flags: string[];
  description: string;
  effectChance?: number;
}

export interface ItemData {
  id: number;
  internalName: string;
  name: string;
  namePlural: string;
  pocket: number;
  price: number;
  description: string;
  useInField: boolean;
  useInBattle: boolean;
  specialItem: boolean;
  machine?: string;
}

export interface TrainerData {
  id: string;
  type: string;
  name: string;
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
    iv?: number[];
    ev?: number[];
    happiness?: number;
    nickname?: string;
    shadow?: boolean;
    ball?: number;
  }[];
  version?: number;
}