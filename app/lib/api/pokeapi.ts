interface PokeAPIConfig {
  baseUrl: string;
}

export class PokeAPIClient {
  private config: PokeAPIConfig;
  private spriteCache: Map<string, string> = new Map();

  constructor(config?: Partial<PokeAPIConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || 'http://localhost:8000/api/v2'
    };
  }

  private getCacheKey(type: string, id: string | number, variant?: string): string {
    return `${type}:${id}:${variant || 'default'}`;
  }

  async getPokemonSprite(pokemonId: number | string, shiny: boolean = false): Promise<string> {
    const cacheKey = this.getCacheKey('pokemon', pokemonId, shiny ? 'shiny' : 'normal');
    
    // Check cache first
    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey)!;
    }

    try {
      const pokemonUrl = `${this.config.baseUrl}/pokemon/${pokemonId}`;
      const response = await fetch(pokemonUrl);
      
      if (!response.ok) {
        console.warn(`Pokemon ${pokemonId} not found in API`);
        return '/sprites/placeholder.png';
      }

      const data = await response.json() as any;
      const spriteUrl = shiny 
        ? data.sprites?.front_shiny || data.sprites?.front_default
        : data.sprites?.front_default;

      if (spriteUrl) {
        // For local PokeAPI, convert URL if needed
        const finalUrl = this.convertSpriteUrl(spriteUrl);
        this.spriteCache.set(cacheKey, finalUrl);
        return finalUrl;
      }
    } catch (error) {
      console.error(`Failed to fetch Pokemon sprite for ${pokemonId}:`, error);
    }

    return '/sprites/placeholder.png';
  }

  private convertSpriteUrl(url: string): string {
    // If the URL is from the official PokeAPI, convert to local
    if (url.includes('raw.githubusercontent.com/PokeAPI')) {
      // Extract the path after /sprites/
      const match = url.match(/\/sprites\/(.+)$/);
      if (match) {
        return `${this.config.baseUrl.replace('/api/v2', '')}/media/sprites/${match[1]}`;
      }
    }
    return url;
  }

  async getItemSprite(itemId: number | string): Promise<string> {
    const cacheKey = this.getCacheKey('item', itemId);
    
    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey)!;
    }

    try {
      const itemUrl = `${this.config.baseUrl}/item/${itemId}`;
      const response = await fetch(itemUrl);
      
      if (!response.ok) {
        console.warn(`Item ${itemId} not found in API`);
        return '/sprites/item-placeholder.png';
      }

      const data = await response.json() as any;
      if (data.sprites?.default) {
        const finalUrl = this.convertSpriteUrl(data.sprites.default);
        this.spriteCache.set(cacheKey, finalUrl);
        return finalUrl;
      }
    } catch (error) {
      console.error(`Failed to fetch item sprite for ${itemId}:`, error);
    }

    return '/sprites/item-placeholder.png';
  }

  async getTypeIcon(typeName: string): Promise<string> {
    // Type icons are usually static assets, return the expected path
    return `/sprites/types/${typeName.toLowerCase()}.png`;
  }

  async batchFetchPokemonSprites(pokemonIds: (number | string)[], shiny: boolean = false): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Process in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < pokemonIds.length; i += batchSize) {
      const batch = pokemonIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (id) => {
          try {
            const spritePath = await this.getPokemonSprite(id, shiny);
            results.set(String(id), spritePath);
          } catch (error) {
            console.error(`Failed to fetch sprite for Pokemon ${id}`);
            results.set(String(id), '/sprites/placeholder.png');
          }
        })
      );
      
      // Small delay between batches
      if (i + batchSize < pokemonIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  async getPokemonData(pokemonId: number | string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/pokemon/${pokemonId}`);
      if (!response.ok) {
        throw new Error(`Pokemon ${pokemonId} not found`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch Pokemon data for ${pokemonId}:`, error);
      return null;
    }
  }

  async getSpeciesData(pokemonId: number | string) {
    try {
      const response = await fetch(`${this.config.baseUrl}/pokemon-species/${pokemonId}`);
      if (!response.ok) {
        throw new Error(`Species ${pokemonId} not found`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch species data for ${pokemonId}:`, error);
      return null;
    }
  }

  clearCache(): void {
    this.spriteCache.clear();
  }
}

export const pokeAPI = new PokeAPIClient();