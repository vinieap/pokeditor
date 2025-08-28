#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Setup sprite directories and create manifest after PokeAPI sprites installation
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SPRITES_DIR = path.join(PUBLIC_DIR, 'sprites');
const NODE_MODULES_SPRITES = path.join(__dirname, '..', 'node_modules', 'pokemon-sprites');

async function setupSpriteDirectories() {
  console.log('Setting up sprite directories...');
  
  // Create main sprites directory
  if (!fs.existsSync(SPRITES_DIR)) {
    fs.mkdirSync(SPRITES_DIR, { recursive: true });
  }

  // Create subdirectories
  const subdirs = ['pokemon', 'items', 'trainers'];
  subdirs.forEach(dir => {
    const fullPath = path.join(SPRITES_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  console.log('Sprite directories created successfully');
}

async function linkSprites() {
  console.log('Linking PokeAPI sprites (Gen 6 and earlier preferred)...');
  
  if (!fs.existsSync(NODE_MODULES_SPRITES)) {
    console.log('PokeAPI sprites not found in node_modules. Please ensure the package is installed.');
    return;
  }

  try {
    // Link Pokemon sprites - prioritize Gen 6 and earlier
    const pokemonSpritesSource = path.join(NODE_MODULES_SPRITES, 'sprites', 'pokemon');
    const pokemonSpritesTarget = path.join(SPRITES_DIR, 'pokemon');
    
    if (fs.existsSync(pokemonSpritesSource)) {
      // Remove existing directory if it's not a symlink
      if (fs.existsSync(pokemonSpritesTarget) && !fs.lstatSync(pokemonSpritesTarget).isSymbolicLink()) {
        fs.rmSync(pokemonSpritesTarget, { recursive: true });
      }
      
      if (!fs.existsSync(pokemonSpritesTarget)) {
        fs.symlinkSync(pokemonSpritesSource, pokemonSpritesTarget, 'dir');
        console.log('Pokemon sprites linked successfully');
      }
    }

    // Link item sprites if available
    const itemSpritesSource = path.join(NODE_MODULES_SPRITES, 'sprites', 'items');
    const itemSpritesTarget = path.join(SPRITES_DIR, 'items');
    
    if (fs.existsSync(itemSpritesSource)) {
      if (fs.existsSync(itemSpritesTarget) && !fs.lstatSync(itemSpritesTarget).isSymbolicLink()) {
        fs.rmSync(itemSpritesTarget, { recursive: true });
      }
      
      if (!fs.existsSync(itemSpritesTarget)) {
        fs.symlinkSync(itemSpritesSource, itemSpritesTarget, 'dir');
        console.log('Item sprites linked successfully');
      }
    }

  } catch (error) {
    console.error('Error linking sprites:', error.message);
  }
}

async function createGenPreferenceManifest() {
  console.log('Creating generation preference mapping...');
  
  const genPreferences = {
    // Generation priority for Pokemon sprites (Gen 6 and earlier)
    pokemon: {
      preferredGenerations: [
        'other/official-artwork',
        'other/x-y',
        'other/black-white/animated',
        'other/black-white', 
        'other/heartgold-soulsilver',
        'other/diamond-pearl',
        'other/emerald',
        'other/ruby-sapphire',
        'other/crystal',
        'other/gold-silver',
        'other/red-blue',
        '' // fallback to default
      ],
      defaultGeneration: 'other/x-y' // Gen 6 as default
    },
    items: {
      preferredPath: 'sprites/items'
    },
    trainers: {
      preferredPath: 'sprites/trainers'
    }
  };

  const preferencesPath = path.join(PUBLIC_DIR, 'sprites', 'generation-preferences.json');
  fs.writeFileSync(preferencesPath, JSON.stringify(genPreferences, null, 2));
  
  console.log('Generation preferences created');
}

async function createSpriteManifest() {
  console.log('Creating sprite manifest...');
  
  const manifest = {
    pokemon: {},
    items: {},
    trainers: {},
    timestamp: new Date().toISOString()
  };

  // Read Pokemon data and create manifest entries
  const pokemonDataPath = path.join(PUBLIC_DIR, 'data', 'pokemon.txt');
  if (fs.existsSync(pokemonDataPath)) {
    const pokemonData = fs.readFileSync(pokemonDataPath, 'utf-8')
      .replace(/^\uFEFF/, '') // Remove BOM if present
      .replace(/\r/g, ''); // Remove carriage returns
    
    // Split by the separator lines and filter out empty entries
    const entries = pokemonData.split('#-------------------------------').filter(e => e.trim());
    
    entries.forEach(entry => {
      const lines = entry.trim().split('\n');
      const header = lines.find(line => line.startsWith('[') && line.endsWith(']'));
      
      if (header) {
        const id = parseInt(header.slice(1, -1));
        let internalName = '';
        let name = '';
        
        lines.forEach(line => {
          if (line.startsWith('Name=')) {
            name = line.split('=')[1].trim();
          } else if (line.startsWith('InternalName=')) {
            internalName = line.split('=')[1].trim();
          }
        });
        
        if (internalName && name && !isNaN(id)) {
          manifest.pokemon[id] = {
            internalName,
            name,
            spriteId: internalName.toLowerCase().replace(/[^a-z0-9]/g, '')
          };
        }
      }
    });
    
    console.log(`Found ${Object.keys(manifest.pokemon).length} Pokemon entries`);
  }

  // Read items data and create manifest entries
  const itemsDataPath = path.join(PUBLIC_DIR, 'data', 'items.txt');
  if (fs.existsSync(itemsDataPath)) {
    const itemsData = fs.readFileSync(itemsDataPath, 'utf-8')
      .replace(/^\uFEFF/, ''); // Remove BOM if present
    const lines = itemsData.trim().split('\n');
    
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const id = parseInt(parts[0]);
        const internalName = parts[1];
        const name = parts[2];
        
        if (!isNaN(id) && internalName && name) {
          manifest.items[id] = {
            internalName,
            name,
            spriteId: internalName.toLowerCase().replace(/[^a-z0-9]/g, '')
          };
        }
      }
    });
  }

  // Write manifest
  const manifestPath = path.join(PUBLIC_DIR, 'sprites', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`Sprite manifest created with ${Object.keys(manifest.pokemon).length} Pokemon and ${Object.keys(manifest.items).length} items`);
}

async function main() {
  try {
    await setupSpriteDirectories();
    await linkSprites();
    await createGenPreferenceManifest();
    await createSpriteManifest();
    console.log('Sprite setup completed successfully!');
  } catch (error) {
    console.error('Error during sprite setup:', error);
    process.exit(1);
  }
}

main();