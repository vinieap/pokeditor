// Pokémon type colors for consistent styling across the app

// Tailwind class-based colors
export const typeColorClasses: Record<string, string> = {
  NORMAL: 'bg-gray-400 text-white',
  FIRE: 'bg-red-500 text-white',
  WATER: 'bg-blue-500 text-white',
  ELECTRIC: 'bg-yellow-400 text-black',
  GRASS: 'bg-green-500 text-white',
  ICE: 'bg-blue-300 text-black',
  FIGHTING: 'bg-red-700 text-white',
  POISON: 'bg-purple-500 text-white',
  GROUND: 'bg-yellow-600 text-white',
  FLYING: 'bg-indigo-400 text-white',
  PSYCHIC: 'bg-pink-500 text-white',
  BUG: 'bg-green-400 text-black',
  ROCK: 'bg-yellow-800 text-white',
  GHOST: 'bg-purple-700 text-white',
  DRAGON: 'bg-indigo-700 text-white',
  DARK: 'bg-gray-800 text-white',
  STEEL: 'bg-gray-500 text-white',
  FAIRY: 'bg-pink-300 text-black',
};

// Hex color values for inline styles
export const typeColorHex: Record<string, string> = {
  NORMAL: '#9CA3AF',   // gray-400
  FIRE: '#EF4444',     // red-500
  WATER: '#3B82F6',    // blue-500
  ELECTRIC: '#FACC15', // yellow-400
  GRASS: '#22C55E',    // green-500
  ICE: '#93C5FD',      // blue-300
  FIGHTING: '#B91C1C', // red-700
  POISON: '#A855F7',   // purple-500
  GROUND: '#CA8A04',   // yellow-600
  FLYING: '#818CF8',   // indigo-400
  PSYCHIC: '#EC4899',  // pink-500
  BUG: '#4ADE80',      // green-400
  ROCK: '#854D0E',     // yellow-800
  GHOST: '#6B21A8',    // purple-700
  DRAGON: '#4338CA',   // indigo-700
  DARK: '#1F2937',     // gray-800
  STEEL: '#6B7280',    // gray-500
  FAIRY: '#FBCFE8',    // pink-300
};

// Get type color hex value for inline styles
export function getTypeColor(type: string): string {
  if (!type) return typeColorHex.NORMAL;
  const cleanType = type.replace(/\r/g, '').trim().toUpperCase();
  return typeColorHex[cleanType] || typeColorHex.NORMAL;
}

// Get type color class for Tailwind classes
export function getTypeColorClass(type: string): string {
  if (!type) return typeColorClasses.NORMAL;
  const cleanType = type.replace(/\r/g, '').trim().toUpperCase();
  return typeColorClasses[cleanType] || typeColorClasses.NORMAL;
}

// Get just the background color without text color for badges
export function getTypeBgColor(type: string): string {
  const fullClass = getTypeColorClass(type);
  return fullClass.split(' ')[0]; // Return just the bg-* class
}