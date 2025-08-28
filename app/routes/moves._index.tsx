import { useState, useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/moves._index";
import { loadMovesData } from "~/lib/data-loader-v2";
import type { Move } from "~/lib/types-v2";
import { getTypeColorClass } from "~/lib/utils/typeColors";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Move Database - Pokeditor" },
    { name: "description", content: "Browse all Pokémon moves with power, accuracy, and effects" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const data = await loadMovesData(url.origin);
    return { moves: data?.list || [] };
  } catch (error) {
    console.error('Failed to load moves data:', error);
    return { moves: [] };
  }
}


const categoryColors: Record<string, string> = {
  Physical: 'bg-orange-500',
  Special: 'bg-blue-500',
  Status: 'bg-gray-50 dark:bg-gray-9000',
};

const categoryIcons: Record<string, string> = {
  Physical: '💥',
  Special: '✨',
  Status: '🔄',
};

export default function MovesIndex() {
  const { moves } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const types = [
    "all", "NORMAL", "FIRE", "WATER", "ELECTRIC", "GRASS", "ICE",
    "FIGHTING", "POISON", "GROUND", "FLYING", "PSYCHIC", "BUG",
    "ROCK", "GHOST", "DRAGON", "DARK", "STEEL", "FAIRY"
  ];

  const categories = ["all", "Physical", "Special", "Status"];

  const filteredMoves = useMemo(() => {
    return moves.filter(move => {
      const matchesSearch = searchQuery === "" || 
        (move.displayName || move.internalName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        move.internalName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === "all" || move.type === selectedType;
      const matchesCategory = selectedCategory === "all" || move.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [moves, searchQuery, selectedType, selectedCategory]);

  const MoveCard = ({ move }: { move: Move }) => (
    <Link 
      to={`/moves/${move.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{move.displayName || move.internalName}</h3>
        <span className="text-2xl">{categoryIcons[move.category]}</span>
      </div>
      
      <div className="flex gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColorClass(move.type)}`}>
          {move.type}
        </span>
        <span className={`px-2 py-1 rounded text-white text-xs ${categoryColors[move.category]}`}>
          {move.category}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-500">Power</span>
          <p className="font-semibold text-gray-900">{move.power || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">Accuracy</span>
          <p className="font-semibold text-gray-900">{move.accuracy || '-'}%</p>
        </div>
        <div>
          <span className="text-gray-500">PP</span>
          <p className="font-semibold text-gray-900">{move.pp}</p>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-2">{move.description}</p>
    </Link>
  );

  const MoveListItem = ({ move }: { move: Move }) => (
    <Link 
      to={`/moves/${move.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl">{categoryIcons[move.category]}</div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{move.displayName || move.internalName}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColorClass(move.type)}`}>
              {move.type}
            </span>
            <span className={`px-2 py-1 rounded text-white text-xs ${categoryColors[move.category]}`}>
              {move.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{move.description}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Power</p>
            <p className="font-semibold text-gray-900">{move.power || '-'}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Acc</p>
            <p className="font-semibold text-gray-900">{move.accuracy || '-'}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">PP</p>
            <p className="font-semibold text-gray-900">{move.pp}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Move Database</h1>
          <p className="text-gray-600">
            Showing {filteredMoves.length} of {moves.length} moves
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search moves by name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="min-w-[150px]">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                {types.slice(1).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="min-w-[150px]">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">💥</div>
            <p className="text-2xl font-bold text-gray-900">
              {moves.filter(m => m.category === 'Physical').length}
            </p>
            <p className="text-sm text-gray-600">Physical Moves</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-2xl font-bold text-gray-900">
              {moves.filter(m => m.category === 'Special').length}
            </p>
            <p className="text-sm text-gray-600">Special Moves</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <p className="text-2xl font-bold text-gray-900">
              {moves.filter(m => m.category === 'Status').length}
            </p>
            <p className="text-sm text-gray-600">Status Moves</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-2xl font-bold text-gray-900">
              {moves.filter(m => m.priority > 0).length}
            </p>
            <p className="text-sm text-gray-600">Priority Moves</p>
          </div>
        </div>

        {/* Moves Grid/List */}
        {filteredMoves.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "space-y-2"
          }>
            {filteredMoves.map(move => 
              viewMode === "grid" 
                ? <MoveCard key={move.id} move={move} />
                : <MoveListItem key={move.id} move={move} />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No moves found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}