import { create } from 'zustand';

interface Pokemon {
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
}

interface PokemonState {
  pokemon: Pokemon[];
  loading: boolean;
  error: string | null;
  selectedPokemon: Pokemon | null;
  searchTerm: string;
  filterType: string | null;
  
  setPokemon: (pokemon: Pokemon[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectPokemon: (pokemon: Pokemon | null) => void;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: string | null) => void;
  updatePokemon: (id: number, updates: Partial<Pokemon>) => void;
  addPokemon: (pokemon: Pokemon) => void;
  deletePokemon: (id: number) => void;
  
  getFilteredPokemon: () => Pokemon[];
}

export const usePokemonStore = create<PokemonState>((set, get) => ({
  pokemon: [],
  loading: false,
  error: null,
  selectedPokemon: null,
  searchTerm: '',
  filterType: null,
  
  setPokemon: (pokemon) => set({ pokemon }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  selectPokemon: (selectedPokemon) => set({ selectedPokemon }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setFilterType: (filterType) => set({ filterType }),
  
  updatePokemon: (id, updates) => set((state) => ({
    pokemon: state.pokemon.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ),
    selectedPokemon: state.selectedPokemon?.id === id 
      ? { ...state.selectedPokemon, ...updates }
      : state.selectedPokemon
  })),
  
  addPokemon: (newPokemon) => set((state) => ({
    pokemon: [...state.pokemon, newPokemon]
  })),
  
  deletePokemon: (id) => set((state) => ({
    pokemon: state.pokemon.filter(p => p.id !== id),
    selectedPokemon: state.selectedPokemon?.id === id ? null : state.selectedPokemon
  })),
  
  getFilteredPokemon: () => {
    const state = get();
    let filtered = state.pokemon;
    
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(term) ||
        p.internalName?.toLowerCase().includes(term) ||
        p.id.toString().includes(term)
      );
    }
    
    if (state.filterType) {
      filtered = filtered.filter(p => 
        p.types[0] === state.filterType || p.types[1] === state.filterType
      );
    }
    
    return filtered;
  }
}));