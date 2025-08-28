#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== TYPE DEFINITIONS ====================

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

interface ItemData {
  id: number;
  internalName: string;
  name: string;
  namePlural: string;
  pocket: number;
  price: number;
  description: string;
  fieldUse: number;
  battleUse: number;
  specialItem: number;
  machine?: string;
}

interface TrainerData {
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

interface EncounterData {
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

interface TypeData {
  id: number;
  name: string;
  internalName: string;
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
}

interface AbilityData {
  id: number;
  internalName: string;
  name: string;
  description: string;
}

interface TournamentTrainerData {
  id: number;
  type: string;
  name: string;
  pokemonIds: number[];
  beginSpeech: string;
  endSpeechWin: string;
  endSpeechLose: string;
}

// ==================== PARSING FUNCTIONS ====================

function parsePokemonFile(content: string): Map<number, PokemonData> {
  const pokemonMap = new Map<number, PokemonData>();
  const sections = content.split('#-------------------------------').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const idMatch = lines[0].match(/\[(\d+)\]/);
    if (!idMatch) continue;
    
    const id = parseInt(idMatch[1]);
    const pokemon: Partial<PokemonData> = { id, types: [], moves: [], eggMoves: [], evolutions: [], abilities: [], compatibility: [] };
    
    for (const line of lines.slice(1)) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (!value) continue;
      
      switch (key) {
        case 'Name':
          pokemon.name = value;
          break;
        case 'InternalName':
          pokemon.internalName = value;
          break;
        case 'Type1':
        case 'Type2':
          pokemon.types!.push(value);
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
          for (let i = 0; i < movePairs.length; i += 2) {
            if (movePairs[i] && movePairs[i + 1]) {
              pokemon.moves!.push({
                level: parseInt(movePairs[i]),
                move: movePairs[i + 1]
              });
            }
          }
          break;
        case 'EggMoves':
          pokemon.eggMoves = value.split(',').filter(m => m);
          break;
        case 'Evolutions':
          const evoParts = value.split(',');
          for (let i = 0; i < evoParts.length; i += 3) {
            if (evoParts[i]) {
              pokemon.evolutions!.push({
                species: evoParts[i],
                method: evoParts[i + 1] || '',
                parameter: evoParts[i + 2]
              });
            }
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
          pokemon.compatibility = value.split(',').filter(c => c);
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
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 14) continue;
    
    const id = parseInt(parts[0]);
    if (isNaN(id)) continue;
    
    const move: MoveData = {
      id,
      internalName: parts[1] || '',
      name: parts[2] || '',
      functionCode: parts[3] || '',
      power: parseInt(parts[4]) || 0,
      type: parts[5] || '',
      category: parts[6] || '',
      accuracy: parseInt(parts[7]) || 0,
      pp: parseInt(parts[8]) || 0,
      effectChance: parseInt(parts[9]) || 0,
      target: parts[10] || '',
      priority: parseInt(parts[11]) || 0,
      flags: parts[12] || '',
      description: parts[13] ? parts[13].replace(/"/g, '') : ''
    };
    
    movesMap.set(id, move);
  }
  
  return movesMap;
}

function parseItemsFile(content: string): Map<number, ItemData> {
  const itemsMap = new Map<number, ItemData>();
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 10) continue;
    
    const id = parseInt(parts[0]);
    if (isNaN(id)) continue;
    
    const item: ItemData = {
      id,
      internalName: parts[1] || '',
      name: parts[2] || '',
      namePlural: parts[3] || '',
      pocket: parseInt(parts[4]) || 0,
      price: parseInt(parts[5]) || 0,
      description: parts[6] ? parts[6].replace(/"/g, '') : '',
      fieldUse: parseInt(parts[7]) || 0,
      battleUse: parseInt(parts[8]) || 0,
      specialItem: parseInt(parts[9]) || 0,
      machine: parts[10]
    };
    
    itemsMap.set(id, item);
  }
  
  return itemsMap;
}

function parseTrainersFile(content: string): Map<string, TrainerData> {
  const trainersMap = new Map<string, TrainerData>();
  const sections = content.split('#-------------------------------').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'));
    if (lines.length < 2) continue;
    
    const typeAndName = lines[0];
    const name = lines[1];
    
    let version: number | undefined;
    let versionMatch = name.match(/,(\d+)$/);
    let trainerName = name;
    
    if (versionMatch) {
      version = parseInt(versionMatch[1]);
      trainerName = name.substring(0, name.lastIndexOf(','));
    }
    
    const id = version ? `${typeAndName}_${trainerName}_${version}` : `${typeAndName}_${trainerName}`;
    
    const trainer: TrainerData = {
      id,
      type: typeAndName,
      name: trainerName,
      version,
      items: [],
      party: []
    };
    
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',');
      
      if (parts.length === 1 && parseInt(parts[0]) > 0) {
        // Item count line - next lines are items
        const itemCount = parseInt(parts[0]);
        if (i + 1 < lines.length && itemCount > 0) {
          const itemLine = lines[i + 1];
          if (!itemLine.includes(',') || itemLine.split(',').every(p => p.match(/^[A-Z_]+$/))) {
            trainer.items = itemLine.split(',').filter(item => item);
            i++;
          }
        }
      } else if (parts[0] && parts[0].match(/^[A-Z_]+$/)) {
        // Pokemon line
        const pokemon: TrainerData['party'][0] = {
          species: parts[0],
          level: parseInt(parts[1]) || 1
        };
        
        if (parts[2]) pokemon.item = parts[2];
        if (parts[3] || parts[4] || parts[5] || parts[6]) {
          pokemon.moves = [parts[3], parts[4], parts[5], parts[6]].filter(m => m);
        }
        if (parts[7]) pokemon.ability = parts[7];
        if (parts[8]) pokemon.gender = parts[8];
        if (parts[9]) pokemon.form = parseInt(parts[9]);
        if (parts[10] === 'shiny') pokemon.shiny = true;
        if (parts[11]) pokemon.nature = parts[11];
        if (parts[12]) pokemon.iv = parseInt(parts[12]);
        if (parts[13]) pokemon.happiness = parseInt(parts[13]);
        if (parts[14]) pokemon.nickname = parts[14];
        if (parts[15] === 'true') pokemon.shadow = true;
        if (parts[16]) pokemon.ball = parseInt(parts[16]);
        
        trainer.party.push(pokemon);
      }
    }
    
    trainersMap.set(id, trainer);
  }
  
  return trainersMap;
}

function parseEncountersFile(content: string): Map<number, EncounterData> {
  const encountersMap = new Map<number, EncounterData>();
  const sections = content.split('#-------------------------------').filter(s => s.trim());
  
  // Slot probabilities for different encounter methods (in percentage)
  const slotProbabilities: Record<string, number[]> = {
    Land: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1],
    Cave: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1],
    Water: [60, 30, 5, 4, 1],
    RockSmash: [90, 10],
    OldRod: [70, 30],
    GoodRod: [60, 20, 20],
    SuperRod: [40, 40, 15, 4, 1],
    HeadbuttLow: [50, 15, 15, 10, 5, 5],
    HeadbuttHigh: [50, 15, 15, 10, 5, 5],
    LandMorning: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1],
    LandDay: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1],
    LandNight: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1],
    BugContest: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1],
  };
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length < 3) continue;
    
    const idMatch = lines[0].match(/^(\d+)/);
    if (!idMatch) continue;
    
    const mapId = parseInt(idMatch[1]);
    const mapName = lines[0].substring(idMatch[0].length).replace('#', '').trim();
    
    const rates = lines[1].split(',').map(Number);
    const encounter: EncounterData = {
      id: mapId,
      mapId,
      mapName,
      landRate: rates[0] || 0,
      caveRate: rates[1] || 0,
      waterRate: rates[2] || 0,
      encounters: []
    };
    
    let currentType = '';
    const typeEncounters: { [key: string]: Array<{ species: string; minLevel: number; maxLevel: number; probability: number }> } = {};
    
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.includes(',')) {
        currentType = line.replace(/\r/g, '').trim();
        if (!typeEncounters[currentType]) {
          typeEncounters[currentType] = [];
        }
      } else {
        const parts = line.split(',');
        if (parts.length >= 2 && currentType) {
          const slotIndex = typeEncounters[currentType].length;
          const cleanType = currentType.replace(/\r/g, '').trim();
          const probabilities = slotProbabilities[cleanType] || [];
          typeEncounters[currentType].push({
            species: parts[0],
            minLevel: parseInt(parts[1]) || 1,
            maxLevel: parseInt(parts[2]) || parseInt(parts[1]) || 1,
            probability: probabilities[slotIndex] || 0
          });
        }
      }
    }
    
    // Combine duplicate species entries
    for (const [type, pokemonList] of Object.entries(typeEncounters)) {
      const combinedPokemon = new Map<string, { species: string; minLevel: number; maxLevel: number; probability: number }>();
      
      for (const poke of pokemonList) {
        if (combinedPokemon.has(poke.species)) {
          const existing = combinedPokemon.get(poke.species)!;
          existing.minLevel = Math.min(existing.minLevel, poke.minLevel);
          existing.maxLevel = Math.max(existing.maxLevel, poke.maxLevel);
          existing.probability += poke.probability; // Sum probabilities
        } else {
          combinedPokemon.set(poke.species, { ...poke });
        }
      }
      
      encounter.encounters.push({ 
        type, 
        pokemon: Array.from(combinedPokemon.values())
      });
    }
    
    encountersMap.set(mapId, encounter);
  }
  
  return encountersMap;
}

function parseTypesFile(content: string): Map<number, TypeData> {
  const typesMap = new Map<number, TypeData>();
  const sections = content.split(/\n\[/).map((s, i) => i === 0 ? s : '[' + s);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const idMatch = lines[0].match(/\[(\d+)\]/);
    if (!idMatch) continue;
    
    const id = parseInt(idMatch[1]);
    const type: TypeData = {
      id,
      name: '',
      internalName: '',
      weaknesses: [],
      resistances: [],
      immunities: []
    };
    
    for (const line of lines.slice(1)) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      switch (key) {
        case 'Name':
          type.name = value;
          break;
        case 'InternalName':
          type.internalName = value;
          break;
        case 'Weaknesses':
          type.weaknesses = value ? value.split(',').filter(t => t) : [];
          break;
        case 'Resistances':
          type.resistances = value ? value.split(',').filter(t => t) : [];
          break;
        case 'Immunities':
          type.immunities = value ? value.split(',').filter(t => t) : [];
          break;
      }
    }
    
    typesMap.set(id, type);
  }
  
  return typesMap;
}

function parseAbilitiesFile(content: string): Map<number, AbilityData> {
  const abilitiesMap = new Map<number, AbilityData>();
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 3) continue;
    
    const id = parseInt(parts[0]);
    if (isNaN(id)) continue;
    
    const ability: AbilityData = {
      id,
      internalName: parts[1] || '',
      name: parts[2] || '',
      description: parts[3] ? parts[3].replace(/"/g, '') : ''
    };
    
    abilitiesMap.set(id, ability);
  }
  
  return abilitiesMap;
}

function parseTournamentFile(content: string): Map<number, TournamentTrainerData> {
  const tournamentMap = new Map<number, TournamentTrainerData>();
  const sections = content.split(/\n\[/).map((s, i) => i === 0 ? s : '[' + s);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const idMatch = lines[0].match(/\[(\d+)\]/);
    if (!idMatch) continue;
    
    const id = parseInt(idMatch[1]);
    const trainer: TournamentTrainerData = {
      id,
      type: '',
      name: '',
      pokemonIds: [],
      beginSpeech: '',
      endSpeechWin: '',
      endSpeechLose: ''
    };
    
    for (const line of lines.slice(1)) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      switch (key) {
        case 'Type':
          trainer.type = value;
          break;
        case 'Name':
          trainer.name = value;
          break;
        case 'PokemonNos':
          trainer.pokemonIds = value ? value.split(',').map(Number).filter(n => !isNaN(n)) : [];
          break;
        case 'BeginSpeech':
          trainer.beginSpeech = value;
          break;
        case 'EndSpeechWin':
          trainer.endSpeechWin = value;
          break;
        case 'EndSpeechLose':
          trainer.endSpeechLose = value;
          break;
      }
    }
    
    tournamentMap.set(id, trainer);
  }
  
  return tournamentMap;
}

// ==================== MAIN CONVERSION FUNCTION ====================

async function convertAllDataFiles() {
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const outputDir = path.join(__dirname, '..', 'public', 'data', 'json');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('📊 Converting all data files to optimized JSON format...\n');
  
  const conversions: Array<{ name: string; file: string; parser: (content: string) => Map<any, any> }> = [
    { name: 'Pokemon', file: 'pokemon.txt', parser: parsePokemonFile },
    { name: 'Moves', file: 'moves.txt', parser: parseMovesFile },
    { name: 'Items', file: 'items.txt', parser: parseItemsFile },
    { name: 'Trainers', file: 'trainers.txt', parser: parseTrainersFile },
    { name: 'Encounters', file: 'encounters.txt', parser: parseEncountersFile },
    { name: 'Types', file: 'types.txt', parser: parseTypesFile },
    { name: 'Abilities', file: 'abilities.txt', parser: parseAbilitiesFile },
  ];
  
  const tournamentFiles = [
    'pikacuptr.txt', 'pikacuppm.txt',
    'pokecuptr.txt', 'pokecuppm.txt',
    'littlecuptr.txt', 'littlecuppm.txt',
    'fancycuptr.txt', 'fancycuppm.txt',
    'fancycupsingletr.txt', 'fancycupsinglepm.txt'
  ];
  
  for (const tournament of tournamentFiles) {
    if (fs.existsSync(path.join(dataDir, tournament))) {
      conversions.push({
        name: tournament.replace('.txt', ''),
        file: tournament,
        parser: parseTournamentFile
      });
    }
  }
  
  const stats: any = {
    timestamp: new Date().toISOString(),
    files: {}
  };
  
  for (const { name, file, parser } of conversions) {
    try {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${name} (file not found)`);
        continue;
      }
      
      console.log(`Converting ${name} data...`);
      const content = fs.readFileSync(filePath, 'utf-8');
      const dataMap = parser(content);
      
      const outputData: any = {
        byId: Object.fromEntries(dataMap),
        list: Array.from(dataMap.values())
      };
      
      // Add index by internal name for applicable types
      if (name === 'Pokemon' || name === 'Moves' || name === 'Items' || name === 'Types' || name === 'Abilities') {
        outputData.byInternalName = {};
        for (const [id, item] of dataMap) {
          if ((item as any).internalName) {
            outputData.byInternalName[(item as any).internalName] = id;
          }
        }
      }
      
      // Add index by type for trainers
      if (name === 'Trainers') {
        outputData.byType = {};
        for (const trainer of dataMap.values()) {
          const t = trainer as TrainerData;
          if (!outputData.byType[t.type]) {
            outputData.byType[t.type] = [];
          }
          outputData.byType[t.type].push(t.id);
        }
      }
      
      const outputFile = path.join(outputDir, `${name.toLowerCase()}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
      
      stats.files[name] = {
        count: dataMap.size,
        originalSize: content.length,
        jsonSize: fs.statSync(outputFile).size
      };
      
      console.log(`✅ Converted ${dataMap.size} ${name} entries`);
    } catch (error) {
      console.error(`❌ Error converting ${name}:`, error);
    }
  }
  
  // Write conversion stats
  fs.writeFileSync(
    path.join(outputDir, 'conversion-stats.json'),
    JSON.stringify(stats, null, 2)
  );
  
  console.log('\n✨ Data conversion complete!');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('\n📊 Conversion Summary:');
  
  for (const [name, info] of Object.entries(stats.files)) {
    const reduction = Math.round((1 - (info as any).jsonSize / (info as any).originalSize) * 100);
    console.log(`  ${name}: ${(info as any).count} entries, ${reduction}% size reduction`);
  }
}

// Run the conversion
convertAllDataFiles().catch(console.error);