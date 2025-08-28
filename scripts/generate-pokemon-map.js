#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pokemonDataPath = path.join(__dirname, '../public/data/pokemon.txt');
const outputPath = path.join(__dirname, '../app/lib/pokemon-id-map.ts');

// Read and parse Pokemon data
const pokemonData = fs.readFileSync(pokemonDataPath, 'utf-8');
const entries = pokemonData.split('#-------------------------------').filter(entry => entry.trim());

const nameToIdMap = {};

for (const entry of entries) {
  const lines = entry.trim().split('\n');
  if (lines.length === 0) continue;

  const idMatch = lines[0].match(/\[(\d+)\]/);
  if (!idMatch) continue;

  const id = parseInt(idMatch[1]);
  
  for (const line of lines.slice(1)) {
    if (line.startsWith('InternalName=')) {
      const name = line.substring('InternalName='.length).trim();
      nameToIdMap[name] = id;
      break;
    }
  }
}

// Generate TypeScript file
const tsContent = `// Auto-generated Pokemon name to ID mapping
// Generated from public/data/pokemon.txt

export const POKEMON_NAME_TO_ID: Record<string, number> = ${JSON.stringify(nameToIdMap, null, 2)};

export function getPokemonIdByName(name: string): number | undefined {
  return POKEMON_NAME_TO_ID[name.toUpperCase()];
}
`;

fs.writeFileSync(outputPath, tsContent);
console.log(`Generated Pokemon ID map with ${Object.keys(nameToIdMap).length} entries`);