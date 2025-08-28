#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanString(str: string): string {
  return str.replace(/\r/g, '').trim();
}

function fixPokemonData() {
  const filePath = path.join(__dirname, '..', 'public', 'data', 'json', 'pokemon.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Fix byId entries
  for (const id in data.byId) {
    const pokemon = data.byId[id];
    
    // Clean types
    if (pokemon.types) {
      pokemon.types = pokemon.types.map((t: string) => cleanString(t)).filter(Boolean);
    }
    
    // Use InternalName for display (it's the English name)
    pokemon.displayName = pokemon.internalName;
    
    // Clean other string fields
    if (pokemon.genderRate) pokemon.genderRate = cleanString(pokemon.genderRate);
    if (pokemon.growthRate) pokemon.growthRate = cleanString(pokemon.growthRate);
    if (pokemon.color) pokemon.color = cleanString(pokemon.color);
    if (pokemon.habitat) pokemon.habitat = cleanString(pokemon.habitat);
    
    // Clean abilities
    if (pokemon.abilities) {
      pokemon.abilities = pokemon.abilities.map((a: string) => cleanString(a));
    }
    if (pokemon.hiddenAbility) {
      pokemon.hiddenAbility = cleanString(pokemon.hiddenAbility);
    }
    
    // Clean moves
    if (pokemon.moves) {
      pokemon.moves = pokemon.moves.map((m: any) => ({
        ...m,
        move: cleanString(m.move)
      }));
    }
    
    // Clean egg moves
    if (pokemon.eggMoves) {
      pokemon.eggMoves = pokemon.eggMoves.map((m: string) => cleanString(m));
    }
    
    // Clean evolutions
    if (pokemon.evolutions) {
      pokemon.evolutions = pokemon.evolutions.map((e: any) => ({
        ...e,
        species: cleanString(e.species),
        method: cleanString(e.method),
        parameter: e.parameter ? cleanString(e.parameter) : e.parameter
      }));
    }
  }
  
  // Update list
  data.list = Object.values(data.byId);
  
  // Save fixed data
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('✅ Fixed Pokemon data');
}

function fixMovesData() {
  const filePath = path.join(__dirname, '..', 'public', 'data', 'json', 'moves.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  for (const id in data.byId) {
    const move = data.byId[id];
    
    // Use InternalName for display (English name)
    move.displayName = move.internalName;
    
    // Clean type
    if (move.type) move.type = cleanString(move.type);
    if (move.category) move.category = cleanString(move.category);
    if (move.target) move.target = cleanString(move.target);
    if (move.flags) move.flags = cleanString(move.flags);
  }
  
  data.list = Object.values(data.byId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('✅ Fixed Moves data');
}

function fixItemsData() {
  const filePath = path.join(__dirname, '..', 'public', 'data', 'json', 'items.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  for (const id in data.byId) {
    const item = data.byId[id];
    
    // Use InternalName for display (English name)
    item.displayName = item.internalName;
  }
  
  data.list = Object.values(data.byId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('✅ Fixed Items data');
}

function fixAllData() {
  console.log('🔧 Fixing JSON data issues...\n');
  
  try {
    fixPokemonData();
    fixMovesData();
    fixItemsData();
    
    console.log('\n✨ All data fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing data:', error);
  }
}

fixAllData();