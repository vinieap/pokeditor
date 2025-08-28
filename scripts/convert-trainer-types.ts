import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TrainerType {
  id: string;
  name: string;
  baseMoney: number;
  skillLevel: number;
}

function parseTrainerTypesData(content: string): TrainerType[] {
  const lines = content.split('\n');
  const types: TrainerType[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;
    
    // Format: YOUNGSTER,Youngster,4,32
    const parts = line.split(',');
    if (parts.length >= 4) {
      types.push({
        id: parts[0].trim(),
        name: parts[1].trim(),
        baseMoney: parseInt(parts[2]) || 0,
        skillLevel: parseInt(parts[3]) || 0
      });
    }
  }
  
  return types;
}

async function main() {
  const dataPath = path.join(process.cwd(), 'public', 'data');
  const outputPath = path.join(dataPath, 'json');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Read and parse trainer types
  const typesContent = fs.readFileSync(path.join(dataPath, 'trainertypes.txt'), 'utf-8');
  const types = parseTrainerTypesData(typesContent);
  
  // Create indexed structure
  const indexedData = {
    byId: {} as Record<string, TrainerType>,
    list: types
  };
  
  types.forEach(type => {
    indexedData.byId[type.id] = type;
  });
  
  // Write JSON file
  const outputFile = path.join(outputPath, 'trainertypes.json');
  fs.writeFileSync(outputFile, JSON.stringify(indexedData, null, 2));
  
  console.log(`✅ Converted ${types.length} trainer types to JSON`);
  console.log(`   Output: ${outputFile}`);
}

main().catch(console.error);