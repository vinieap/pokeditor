#!/usr/bin/env node
/**
 * Batch migration script to update all routes to use JSON data
 * This script performs automated updates where possible
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationRule {
  file: string;
  replacements: Array<{
    search: string | RegExp;
    replace: string;
  }>;
}

const migrationRules: MigrationRule[] = [
  {
    file: 'moves._index.tsx',
    replacements: [
      {
        search: /import.*parseMovesData.*from.*parsers.*$/gm,
        replace: 'import { loadMovesData } from "~/lib/data-loader-v2";\nimport type { MoveData } from "~/lib/types-v2";'
      },
      {
        search: /const dataUrl = new URL\('\/data\/moves\.txt'.*?\);/gs,
        replace: ''
      },
      {
        search: /const response = await fetch\(dataUrl\.toString\(\)\);[\s\S]*?const movesContent = await response\.text\(\);[\s\S]*?const movesList = parseMovesData\(movesContent\);/gm,
        replace: 'const data = await loadMovesData(url.origin);\n    const movesList = data.list;'
      }
    ]
  },
  {
    file: 'moves.$id.tsx',
    replacements: [
      {
        search: /import.*parseMoves.*from.*parsers.*$/gm,
        replace: 'import { loadMovesData, loadPokemonData } from "~/lib/data-loader-v2";\nimport type { MoveData, PokemonData } from "~/lib/types-v2";'
      },
      {
        search: /const movesUrl[\s\S]*?const movesContent = await movesResponse\.text\(\);[\s\S]*?const movesList = parseMovesData\(movesContent\);/gm,
        replace: 'const movesData = await loadMovesData(url.origin);\n    const movesList = movesData.list;'
      },
      {
        search: /const pokemonUrl[\s\S]*?const pokemonContent = await pokemonResponse\.text\(\);[\s\S]*?const pokemonList = parsePokemonData\(pokemonContent\);/gm,
        replace: 'const pokemonData = await loadPokemonData(url.origin);\n    const pokemonList = pokemonData.list;'
      }
    ]
  },
  {
    file: 'items._index.tsx',
    replacements: [
      {
        search: /import.*parseItems.*from.*parsers.*$/gm,
        replace: 'import { loadItemsData } from "~/lib/data-loader-v2";\nimport type { ItemData } from "~/lib/types-v2";'
      },
      {
        search: /const dataUrl = new URL\('\/data\/items\.txt'.*?\);/gs,
        replace: ''
      },
      {
        search: /const response = await fetch\(dataUrl\.toString\(\)\);[\s\S]*?const itemsContent = await response\.text\(\);[\s\S]*?const itemsList = parseItemsData\(itemsContent\);/gm,
        replace: 'const data = await loadItemsData(url.origin);\n    const itemsList = data.list;'
      }
    ]
  },
  {
    file: 'items.$id.tsx',
    replacements: [
      {
        search: /import.*parseItems.*from.*parsers.*$/gm,
        replace: 'import { loadItemsData } from "~/lib/data-loader-v2";\nimport type { ItemData } from "~/lib/types-v2";'
      },
      {
        search: /const itemsUrl[\s\S]*?const itemsContent = await itemsResponse\.text\(\);[\s\S]*?const itemsList = parseItemsData\(itemsContent\);/gm,
        replace: 'const itemsData = await loadItemsData(url.origin);\n    const itemsList = itemsData.list;'
      }
    ]
  },
  {
    file: 'trainers._index.tsx',
    replacements: [
      {
        search: /import.*parseTrainers.*from.*parsers.*$/gm,
        replace: 'import { loadTrainersData } from "~/lib/data-loader-v2";\nimport type { TrainerData } from "~/lib/types-v2";'
      },
      {
        search: /const dataUrl = new URL\('\/data\/trainers\.txt'.*?\);/gs,
        replace: ''
      },
      {
        search: /const response = await fetch\(dataUrl\.toString\(\)\);[\s\S]*?const trainersContent = await response\.text\(\);[\s\S]*?const trainersList = parseTrainersData\(trainersContent\);/gm,
        replace: 'const data = await loadTrainersData(url.origin);\n    const trainersList = data.list;'
      }
    ]
  },
  {
    file: 'trainers.$id.tsx',
    replacements: [
      {
        search: /import.*parseTrainers.*from.*parsers.*$/gm,
        replace: 'import { loadTrainersData, loadPokemonData } from "~/lib/data-loader-v2";\nimport type { TrainerData, PokemonData } from "~/lib/types-v2";'
      },
      {
        search: /const trainersUrl[\s\S]*?const trainersContent = await trainersResponse\.text\(\);[\s\S]*?const trainersList = parseTrainersData\(trainersContent\);/gm,
        replace: 'const trainersData = await loadTrainersData(url.origin);\n    const trainersList = trainersData.list;'
      }
    ]
  },
  {
    file: 'encounters._index.tsx',
    replacements: [
      {
        search: /import.*parseEncounters.*from.*parsers.*$/gm,
        replace: 'import { loadEncountersData, loadPokemonData } from "~/lib/data-loader-v2";\nimport type { EncounterData, PokemonData } from "~/lib/types-v2";'
      },
      {
        search: /const dataUrl = new URL\('\/data\/encounters\.txt'.*?\);/gs,
        replace: ''
      },
      {
        search: /const response = await fetch\(dataUrl\.toString\(\)\);[\s\S]*?const encountersContent = await response\.text\(\);[\s\S]*?const encountersList = parseEncountersData\(encountersContent\);/gm,
        replace: 'const encountersData = await loadEncountersData(url.origin);\n    const encountersList = encountersData.list;'
      }
    ]
  },
  {
    file: 'tournaments._index.tsx',
    replacements: [
      {
        search: /import.*parseTournament.*from.*parsers.*$/gm,
        replace: 'import { loadTournamentData } from "~/lib/data-loader-v2";\nimport type { TournamentTrainerData } from "~/lib/types-v2";'
      }
    ]
  },
  {
    file: 'compare.tsx',
    replacements: [
      {
        search: /import.*parsePokemon.*from.*parsers.*$/gm,
        replace: 'import { loadPokemonData } from "~/lib/data-loader-v2";\nimport type { PokemonData } from "~/lib/types-v2";'
      },
      {
        search: /const dataUrl = new URL\('\/data\/pokemon\.txt'.*?\);/gs,
        replace: ''
      },
      {
        search: /const response = await fetch\(dataUrl\.toString\(\)\);[\s\S]*?const pokemonContent = await response\.text\(\);[\s\S]*?const pokemonList = parsePokemonData\(pokemonContent\);/gm,
        replace: 'const data = await loadPokemonData(url.origin);\n    const pokemonList = data.list;'
      }
    ]
  },
  {
    file: 'home.tsx',
    replacements: [
      {
        search: /import.*parsePokemon.*from.*parsers.*$/gm,
        replace: 'import { loadPokemonData, loadMovesData, loadItemsData, loadTrainersData } from "~/lib/data-loader-v2";\nimport type { PokemonData, MoveData, ItemData, TrainerData } from "~/lib/types-v2";'
      }
    ]
  }
];

async function migrateFile(rule: MigrationRule) {
  const filePath = path.join(__dirname, '..', 'app', 'routes', rule.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${rule.file}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  for (const replacement of rule.replacements) {
    const originalContent = content;
    content = content.replace(replacement.search, replacement.replace);
    if (content !== originalContent) {
      modified = true;
    }
  }
  
  if (modified) {
    // Create backup
    const backupPath = filePath + '.bak';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    
    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated: ${rule.file}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${rule.file}`);
    return false;
  }
}

async function runMigration() {
  console.log('🚀 Starting batch migration to JSON data...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const rule of migrationRules) {
    try {
      const success = await migrateFile(rule);
      if (success) successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${rule.file}:`, error);
      failCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`  ✅ Successfully migrated: ${successCount} files`);
  console.log(`  ❌ Failed: ${failCount} files`);
  console.log('\n💡 Note: Some files may need manual adjustments for:');
  console.log('  - Type definitions and interfaces');
  console.log('  - Data structure access patterns');
  console.log('  - Component prop types');
  console.log('\n🔧 Run "npm run build" to check for any TypeScript errors');
}

runMigration().catch(console.error);