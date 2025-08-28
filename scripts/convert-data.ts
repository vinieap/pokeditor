#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PokemonData {
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

interface MoveData {
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

interface ItemData {
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

interface TrainerData {
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

function parsePokemonFile(content: string): Map<number, PokemonData> {
  const pokemonMap = new Map<number, PokemonData>();
  const sections = content.split('#-------------------------------').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const idMatch = lines[0].match(/\[(\d+)\]/);
    if (!idMatch) continue;
    
    const id = parseInt(idMatch[1]);
    const pokemon: Partial<PokemonData> = { id };
    
    for (const line of lines.slice(1)) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      switch (key) {
        case 'Name':
          pokemon.name = value;
          break;
        case 'InternalName':
          pokemon.internalName = value;
          break;
        case 'Type1':
        case 'Type2':
          if (!pokemon.types) pokemon.types = [];
          if (value) pokemon.types.push(value);
          break;
        case 'BaseStats':
          const stats = value.split(',').map(Number);
          pokemon.stats = {
            hp: stats[0],
            attack: stats[1],
            defense: stats[2],
            speed: stats[3],
            spAttack: stats[4],
            spDefense: stats[5]
          };
          break;
        case 'Abilities':
          pokemon.abilities = value.split(',').filter(a => a);
          break;
        case 'HiddenAbility':
          pokemon.hiddenAbility = value;
          break;
        case 'Moves':
          const movePairs = value.split(',');
          pokemon.moves = [];
          for (let i = 0; i < movePairs.length; i += 2) {
            pokemon.moves.push({
              level: parseInt(movePairs[i]),
              move: movePairs[i + 1]
            });
          }
          break;
        case 'EggMoves':
          pokemon.eggMoves = value ? value.split(',') : [];
          break;
        case 'Evolutions':
          const evoParts = value.split(',');
          pokemon.evolutions = [];
          for (let i = 0; i < evoParts.length; i += 3) {
            pokemon.evolutions.push({
              species: evoParts[i],
              method: evoParts[i + 1],
              parameter: evoParts[i + 2]
            });
          }
          break;
        case 'Height':
          pokemon.height = parseFloat(value);
          break;
        case 'Weight':
          pokemon.weight = parseFloat(value);
          break;
        case 'Color':
          pokemon.color = value;
          break;
        case 'Habitat':
          pokemon.habitat = value;
          break;
        case 'Pokedex':
          pokemon.pokedex = value;
          break;
        case 'GenderRate':
          pokemon.genderRate = value;
          break;
        case 'GrowthRate':
          pokemon.growthRate = value;
          break;
        case 'BaseEXP':
          pokemon.baseExp = parseInt(value);
          break;
        case 'EffortPoints':
          pokemon.effortPoints = value.split(',').map(Number);
          break;
        case 'Rareness':
          pokemon.rareness = parseInt(value);
          break;
        case 'Happiness':
          pokemon.happiness = parseInt(value);
          break;
        case 'Compatibility':
          pokemon.compatibility = value.split(',');
          break;
        case 'StepsToHatch':
          pokemon.stepsToHatch = parseInt(value);
          break;
        case 'RegionalNumbers':
          pokemon.regionalNumbers = value;
          break;
        case 'Kind':
          pokemon.kind = value;
          break;
        case 'Shape':
          pokemon.shape = parseInt(value);
          break;
      }
    }
    
    pokemonMap.set(id, pokemon as PokemonData);
  }
  
  return pokemonMap;
}

function parseMovesFile(content: string): Map<number, MoveData> {
  const movesMap = new Map<number, MoveData>();
  const sections = content.split('#-------------------------------').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const idMatch = lines[0].match(/\[(\d+)\]/);
    if (!idMatch) continue;
    
    const id = parseInt(idMatch[1]);
    const move: Partial<MoveData> = { id };
    
    for (const line of lines.slice(1)) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      switch (key) {
        case 'Name':
          move.name = value;
          break;
        case 'InternalName':
          move.internalName = value;
          break;
        case 'Type':
          move.type = value;
          break;
        case 'Category':
          move.category = value;
          break;
        case 'Power':
          move.power = parseInt(value) || 0;
          break;
        case 'Accuracy':
          move.accuracy = parseInt(value) || 0;
          break;
        case 'TotalPP':
          move.pp = parseInt(value) || 0;
          break;
        case 'Target':
          move.target = value;
          break;
        case 'Priority':
          move.priority = parseInt(value) || 0;
          break;
        case 'FunctionCode':
          move.functionCode = value;
          break;
        case 'Flags':
          move.flags = value ? value.split(',') : [];
          break;
        case 'Description':
          move.description = value;
          break;
        case 'EffectChance':
          move.effectChance = parseInt(value);
          break;
      }
    }
    
    movesMap.set(id, move as MoveData);
  }
  
  return movesMap;
}

function parseItemsFile(content: string): Map<number, ItemData> {
  const itemsMap = new Map<number, ItemData>();
  const sections = content.split('#-------------------------------').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const idMatch = lines[0].match(/\[(\d+)\]/);
    if (!idMatch) continue;
    
    const id = parseInt(idMatch[1]);
    const item: Partial<ItemData> = { id };
    
    for (const line of lines.slice(1)) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      switch (key) {
        case 'Name':
          item.name = value;
          break;
        case 'NamePlural':
          item.namePlural = value;
          break;
        case 'InternalName':
          item.internalName = value;
          break;
        case 'Pocket':
          item.pocket = parseInt(value);
          break;
        case 'Price':
          item.price = parseInt(value);
          break;
        case 'Description':
          item.description = value;
          break;
        case 'FieldUse':
          item.useInField = value === 'OnPokemon' || value === 'Direct';
          break;
        case 'BattleUse':
          item.useInBattle = value === 'OnPokemon' || value === 'OnFoe' || value === 'Direct';
          break;
        case 'SpecialItem':
          item.specialItem = value === '1' || value === 'true';
          break;
        case 'Machine':
          item.machine = value;
          break;
      }
    }
    
    itemsMap.set(id, item as ItemData);
  }
  
  return itemsMap;
}

function parseTrainersFile(content: string): Map<string, TrainerData> {
  const trainersMap = new Map<string, TrainerData>();
  const sections = content.split('#-------------------------------').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const headerMatch = lines[0].match(/\[(.+)\]/);
    if (!headerMatch) continue;
    
    const parts = headerMatch[1].split(',');
    const type = parts[0];
    const name = parts[1];
    const version = parts[2] ? parseInt(parts[2]) : undefined;
    
    const id = version ? `${type}_${name}_${version}` : `${type}_${name}`;
    const trainer: TrainerData = {
      id,
      type,
      name,
      items: [],
      party: [],
      version
    };
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('Items=')) {
        const itemsStr = line.substring(6);
        trainer.items = itemsStr ? itemsStr.split(',') : [];
      } else if (line.startsWith('Pokemon=')) {
        const pokemonStr = line.substring(8);
        const pokemonParts = pokemonStr.split(',');
        
        const pokemon: TrainerData['party'][0] = {
          species: pokemonParts[0],
          level: parseInt(pokemonParts[1])
        };
        
        if (pokemonParts[2]) pokemon.item = pokemonParts[2];
        if (pokemonParts[3]) pokemon.moves = pokemonParts.slice(3, 7).filter(m => m);
        if (pokemonParts[7]) pokemon.ability = pokemonParts[7];
        if (pokemonParts[8]) pokemon.gender = pokemonParts[8];
        if (pokemonParts[9]) pokemon.form = parseInt(pokemonParts[9]);
        if (pokemonParts[10]) pokemon.shiny = pokemonParts[10] === 'true';
        if (pokemonParts[11]) pokemon.nature = pokemonParts[11];
        if (pokemonParts[12]) pokemon.iv = pokemonParts[12].split('.').map(Number);
        if (pokemonParts[13]) pokemon.happiness = parseInt(pokemonParts[13]);
        if (pokemonParts[14]) pokemon.nickname = pokemonParts[14];
        if (pokemonParts[15]) pokemon.shadow = pokemonParts[15] === 'true';
        if (pokemonParts[16]) pokemon.ball = parseInt(pokemonParts[16]);
        
        trainer.party.push(pokemon);
      }
    }
    
    trainersMap.set(id, trainer);
  }
  
  return trainersMap;
}

async function convertDataFiles() {
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const outputDir = path.join(__dirname, '..', 'public', 'data', 'json');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('📊 Converting data files to optimized JSON format...\n');
  
  try {
    console.log('Converting Pokemon data...');
    const pokemonContent = fs.readFileSync(path.join(dataDir, 'pokemon.txt'), 'utf-8');
    const pokemonMap = parsePokemonFile(pokemonContent);
    
    const pokemonData = {
      byId: Object.fromEntries(pokemonMap),
      byInternalName: Object.fromEntries(
        Array.from(pokemonMap.values()).map(p => [p.internalName, p.id])
      ),
      list: Array.from(pokemonMap.values())
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'pokemon.json'),
      JSON.stringify(pokemonData, null, 2)
    );
    console.log(`✅ Converted ${pokemonMap.size} Pokemon`);
    
    console.log('Converting Moves data...');
    const movesContent = fs.readFileSync(path.join(dataDir, 'moves.txt'), 'utf-8');
    const movesMap = parseMovesFile(movesContent);
    
    const movesData = {
      byId: Object.fromEntries(movesMap),
      byInternalName: Object.fromEntries(
        Array.from(movesMap.values()).map(m => [m.internalName, m.id])
      ),
      list: Array.from(movesMap.values())
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'moves.json'),
      JSON.stringify(movesData, null, 2)
    );
    console.log(`✅ Converted ${movesMap.size} moves`);
    
    console.log('Converting Items data...');
    const itemsContent = fs.readFileSync(path.join(dataDir, 'items.txt'), 'utf-8');
    const itemsMap = parseItemsFile(itemsContent);
    
    const itemsData = {
      byId: Object.fromEntries(itemsMap),
      byInternalName: Object.fromEntries(
        Array.from(itemsMap.values()).map(i => [i.internalName, i.id])
      ),
      list: Array.from(itemsMap.values())
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'items.json'),
      JSON.stringify(itemsData, null, 2)
    );
    console.log(`✅ Converted ${itemsMap.size} items`);
    
    console.log('Converting Trainers data...');
    const trainersContent = fs.readFileSync(path.join(dataDir, 'trainers.txt'), 'utf-8');
    const trainersMap = parseTrainersFile(trainersContent);
    
    const trainersData = {
      byId: Object.fromEntries(trainersMap),
      byType: {} as Record<string, string[]>,
      list: Array.from(trainersMap.values())
    };
    
    for (const trainer of trainersMap.values()) {
      if (!trainersData.byType[trainer.type]) {
        trainersData.byType[trainer.type] = [];
      }
      trainersData.byType[trainer.type].push(trainer.id);
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'trainers.json'),
      JSON.stringify(trainersData, null, 2)
    );
    console.log(`✅ Converted ${trainersMap.size} trainers`);
    
    const statsPath = path.join(outputDir, 'conversion-stats.json');
    const stats = {
      timestamp: new Date().toISOString(),
      files: {
        pokemon: { count: pokemonMap.size, originalSize: pokemonContent.length },
        moves: { count: movesMap.size, originalSize: movesContent.length },
        items: { count: itemsMap.size, originalSize: itemsContent.length },
        trainers: { count: trainersMap.size, originalSize: trainersContent.length }
      }
    };
    
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    
    console.log('\n✨ Data conversion complete!');
    console.log(`📁 Output directory: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

convertDataFiles();