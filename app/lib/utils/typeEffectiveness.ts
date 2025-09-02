// Type effectiveness chart for Pokémon battles
// Values: 0 = no effect, 0.5 = not very effective, 1 = normal, 2 = super effective

const TYPE_EFFECTIVENESS_CHART: Record<string, Record<string, number>> = {
  NORMAL: {
    ROCK: 0.5, GHOST: 0, STEEL: 0.5
  },
  FIRE: {
    FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2
  },
  WATER: {
    FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5
  },
  ELECTRIC: {
    WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5
  },
  GRASS: {
    FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5
  },
  ICE: {
    FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5
  },
  FIGHTING: {
    NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5
  },
  POISON: {
    GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2
  },
  GROUND: {
    FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2
  },
  FLYING: {
    ELECTRIC: 0.5, GRASS: 2, ICE: 0.5, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5
  },
  PSYCHIC: {
    FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5
  },
  BUG: {
    FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5, FAIRY: 0.5
  },
  ROCK: {
    FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5
  },
  GHOST: {
    NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5
  },
  DRAGON: {
    DRAGON: 2, STEEL: 0.5, FAIRY: 0
  },
  DARK: {
    FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5
  },
  STEEL: {
    FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5, FAIRY: 2
  },
  FAIRY: {
    FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5
  }
};

export interface TypeEffectiveness {
  weakTo: string[];      // Types that deal 2x damage (super effective against this Pokemon)
  resistantTo: string[]; // Types that deal 0.5x damage (not very effective against this Pokemon)
  immuneTo: string[];    // Types that deal 0x damage (no effect against this Pokemon)
}

/**
 * Calculate type effectiveness for a Pokemon's type combination
 * @param types Array of Pokemon types (e.g., ["FIRE", "FLYING"])
 * @returns Object containing weaknesses, resistances, and immunities
 */
export function calculateTypeEffectiveness(types: string[]): TypeEffectiveness {
  const cleanTypes = types.map(type => type.replace(/\r/g, '').trim().toUpperCase()).filter(Boolean);
  
  // Initialize effectiveness multipliers for all types
  const effectiveness: Record<string, number> = {};
  const allTypes = Object.keys(TYPE_EFFECTIVENESS_CHART);
  
  // Start with normal effectiveness (1x) for all attacking types
  allTypes.forEach(type => {
    effectiveness[type] = 1;
  });
  
  // Calculate combined effectiveness for dual types
  cleanTypes.forEach(defenderType => {
    allTypes.forEach(attackerType => {
      const chart = TYPE_EFFECTIVENESS_CHART[attackerType];
      const multiplier = chart?.[defenderType] ?? 1; // Default to normal effectiveness
      effectiveness[attackerType] *= multiplier;
    });
  });
  
  // Categorize types by their final effectiveness
  const weakTo: string[] = [];
  const resistantTo: string[] = [];
  const immuneTo: string[] = [];
  
  Object.entries(effectiveness).forEach(([type, multiplier]) => {
    if (multiplier === 0) {
      immuneTo.push(type);
    } else if (multiplier > 1) {
      weakTo.push(type);
    } else if (multiplier < 1) {
      resistantTo.push(type);
    }
  });
  
  return {
    weakTo: weakTo.sort(),
    resistantTo: resistantTo.sort(),
    immuneTo: immuneTo.sort()
  };
}

/**
 * Get the effectiveness multiplier for a specific attacking type against defending types
 * @param attackingType The type of the attacking move
 * @param defendingTypes The types of the defending Pokemon
 * @returns The damage multiplier (0, 0.25, 0.5, 1, 2, or 4)
 */
export function getEffectivenessMultiplier(attackingType: string, defendingTypes: string[]): number {
  const cleanAttackingType = attackingType.replace(/\r/g, '').trim().toUpperCase();
  const cleanDefendingTypes = defendingTypes.map(type => type.replace(/\r/g, '').trim().toUpperCase());
  
  let multiplier = 1;
  
  cleanDefendingTypes.forEach(defenderType => {
    const chart = TYPE_EFFECTIVENESS_CHART[cleanAttackingType];
    const effectiveness = chart?.[defenderType] ?? 1;
    multiplier *= effectiveness;
  });
  
  return multiplier;
}

/**
 * Get a human-readable effectiveness description
 * @param multiplier The effectiveness multiplier
 * @returns A descriptive string
 */
export function getEffectivenessDescription(multiplier: number): string {
  if (multiplier === 0) return "No effect";
  if (multiplier === 0.25) return "Not very effective";
  if (multiplier === 0.5) return "Not very effective";
  if (multiplier === 1) return "Normal damage";
  if (multiplier === 2) return "Super effective";
  if (multiplier === 4) return "Super effective";
  return "Normal damage";
}