import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router";

interface Pokemon {
  id: number;
  name: string;
  internalName: string;
  types: string[];
}

interface Move {
  id: number;
  name: string;
  internalName: string;
  type: string;
  category: string;
  basePower?: number;
}

interface Item {
  id: number;
  name: string;
  internalName: string;
  description?: string;
}

interface Trainer {
  id?: string | number;
  name: string;
  type: string;
  party: any[];
}

interface SearchResult {
  type: 'pokemon' | 'move' | 'item' | 'trainer';
  id: string | number;
  name: string;
  description?: string;
  icon?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function GlobalSearch({ isOpen, onClose, searchQuery, onSearchChange }: GlobalSearchProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    pokemon: Pokemon[];
    moves: Move[];
    items: Item[];
    trainers: Trainer[];
  }>({ pokemon: [], moves: [], items: [], trainers: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [pokemonRes, movesRes, itemsRes, trainersRes] = await Promise.all([
          fetch('/data/json/pokemon.json').then(r => r.json()),
          fetch('/data/json/moves.json').then(r => r.json()),
          fetch('/data/json/items.json').then(r => r.json()),
          fetch('/data/json/trainers.json').then(r => r.json()),
        ]) as [any, any, any, any];

        setData({
          pokemon: pokemonRes?.list || [],
          moves: movesRes?.list || [],
          items: itemsRes?.list || [],
          trainers: trainersRes?.list || [],
        });
      } catch (error) {
        console.error('Failed to load search data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (data.pokemon.length === 0) {
      loadData();
    }
  }, [isOpen, data.pokemon.length]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    const maxPerCategory = 5;

    // Search Pokemon
    const pokemonMatches = data.pokemon
      .filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.internalName.toLowerCase().includes(query) ||
        p.id.toString() === query
      )
      .slice(0, maxPerCategory)
      .map(p => ({
        type: 'pokemon' as const,
        id: p.id,
        name: p.name,
        description: `#${String(p.id).padStart(3, '0')} - ${p.types.filter(Boolean).join('/')}`,
        icon: '🎮'
      }));
    results.push(...pokemonMatches);

    // Search Moves
    const moveMatches = data.moves
      .filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.internalName.toLowerCase().includes(query)
      )
      .slice(0, maxPerCategory)
      .map(m => ({
        type: 'move' as const,
        id: m.id,
        name: m.name,
        description: `${m.type} - ${m.category} - Power: ${m.basePower || '-'}`,
        icon: '⚔️'
      }));
    results.push(...moveMatches);

    // Search Items
    const itemMatches = data.items
      .filter(i => 
        i.name.toLowerCase().includes(query) ||
        i.internalName.toLowerCase().includes(query)
      )
      .slice(0, maxPerCategory)
      .map(i => ({
        type: 'item' as const,
        id: i.id,
        name: i.name,
        description: i.description?.slice(0, 60) + '...',
        icon: '🎒'
      }));
    results.push(...itemMatches);

    // Search Trainers
    const trainerMatches = data.trainers
      .filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query)
      )
      .slice(0, maxPerCategory)
      .map((t, idx) => ({
        type: 'trainer' as const,
        id: t.id || idx,
        name: t.name,
        description: `${t.type} - Team size: ${t.party.length}`,
        icon: '👥'
      }));
    results.push(...trainerMatches);

    return results;
  }, [searchQuery, data]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, onClose]);

  const handleResultClick = (result: SearchResult) => {
    let path = '';
    switch (result.type) {
      case 'pokemon':
        path = `/pokemon/${result.id}`;
        break;
      case 'move':
        path = `/moves/${result.id}`;
        break;
      case 'item':
        path = `/items/${result.id}`;
        break;
      case 'trainer':
        path = `/trainers/${result.id}`;
        break;
    }
    navigate(path);
    onClose();
    onSearchChange('');
  };

  if (!isOpen) return null;

  const typeColors = {
    pokemon: 'bg-blue-100 text-blue-800',
    move: 'bg-orange-100 text-orange-800',
    item: 'bg-green-100 text-green-800',
    trainer: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden z-50">
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading search data...</div>
      ) : searchQuery.length < 2 ? (
        <div className="p-4 text-center text-gray-500">Type at least 2 characters to search...</div>
      ) : searchResults.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No results found for "{searchQuery}"</div>
      ) : (
        <div ref={resultsRef} className="overflow-y-auto max-h-96">
          {searchResults.map((result, idx) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:bg-gray-900 transition-colors text-left ${
                idx === selectedIndex ? 'bg-gray-50 dark:bg-gray-900' : ''
              }`}
            >
              <span className="text-2xl">{result.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{result.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[result.type]}`}>
                    {result.type}
                  </span>
                </div>
                {result.description && (
                  <p className="text-sm text-gray-600 truncate">{result.description}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
      
      <div className="border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
        <span>{searchResults.length} results</span>
      </div>
    </div>
  );
}