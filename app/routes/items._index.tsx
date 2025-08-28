import { useState, useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/items._index";
import { loadItemsData } from "~/lib/data-loader-v2";
import type { ItemData } from "~/lib/types-v2";
import { ItemSprite } from "~/components/SpriteImage";

type Item = ItemData;

function getItemCategory(pocket: number): string {
  const pocketNames: Record<number, string> = {
    1: "Items",
    2: "Medicine",
    3: "Poké Balls",
    4: "TMs & HMs",
    5: "Berries",
    6: "Mail",
    7: "Battle Items",
    8: "Key Items"
  };
  return pocketNames[pocket] || "Other";
}


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Item Catalog - Pokeditor" },
    { name: "description", content: "Browse all Pokémon items with prices and effects" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const data = await loadItemsData(url.origin);
    return { items: data?.list || [] };
  } catch (error) {
    console.error('Failed to load items data:', error);
    return { items: [] };
  }
}

const categoryIcons: Record<string, string> = {
  'Items': '🎒',
  'Medicine': '💊',
  'Poké Balls': '🔴',
  'TMs & HMs': '💿',
  'Berries': '🫐',
  'Mail': '✉️',
  'Battle Items': '⚔️',
  'Key Items': '🔑',
  'Other': '📦',
};

const categoryColors: Record<string, string> = {
  'Items': 'bg-gray-100 dark:bg-gray-800',
  'Medicine': 'bg-green-50 dark:bg-green-900/30',
  'Poké Balls': 'bg-red-50 dark:bg-red-900/30',
  'TMs & HMs': 'bg-purple-50 dark:bg-purple-900/30',
  'Berries': 'bg-blue-50 dark:bg-blue-900/30',
  'Mail': 'bg-yellow-50 dark:bg-yellow-900/30',
  'Battle Items': 'bg-orange-50 dark:bg-orange-900/30',
  'Key Items': 'bg-indigo-50 dark:bg-indigo-900/30',
  'Other': 'bg-gray-50 dark:bg-gray-800',
};

export default function ItemsIndex() {
  const { items } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get unique categories from items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(item => cats.add(getItemCategory(item.pocket)));
    return ['all', ...Array.from(cats).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery === "" || 
        (item.displayName || item.internalName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const itemCategory = getItemCategory(item.pocket);
      const matchesCategory = selectedCategory === "all" || itemCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Group items by category for display
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<string, Item[]>();
    filteredItems.forEach(item => {
      const category = getItemCategory(item.pocket);
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });
    return grouped;
  }, [filteredItems]);

  const ItemCard = ({ item }: { item: Item }) => {
    const category = getItemCategory(item.pocket);
    
    return (
      <Link 
        to={`/items/${item.id}`}
        className={`${categoryColors[category] || 'bg-white dark:bg-gray-800'} rounded-lg shadow hover:shadow-lg transition-all p-4`}
      >
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-2 flex items-center justify-center">
            <ItemSprite 
              internalName={item.internalName}
              name={item.displayName || item.internalName}
              className="w-full h-full object-contain pixelated"
            />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{item.displayName || item.internalName}</h3>
          {item.price > 0 && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">₽{item.price.toLocaleString()}</p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{item.description}</p>
        </div>
      </Link>
    );
  };

  const ItemListItem = ({ item }: { item: Item }) => {
    const category = getItemCategory(item.pocket);
    
    return (
      <Link 
        to={`/items/${item.id}`}
        className={`${categoryColors[category] || 'bg-white dark:bg-gray-800'} rounded-lg shadow hover:shadow-md transition-shadow p-4`}
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
            <ItemSprite 
              internalName={item.internalName}
              name={item.displayName || item.internalName}
              className="w-full h-full object-contain pixelated"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.displayName || item.internalName}</h3>
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">{category}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
          </div>
          
          {item.price > 0 && (
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">₽{item.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sell: ₽{Math.floor(item.price / 2).toLocaleString()}</p>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Item Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search items by name or effect..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="min-w-[150px]">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white dark:bg-gray-800 placeholder-gray-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
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

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {Array.from(itemsByCategory.keys()).sort().map(category => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
              <div className="text-2xl mb-1">{categoryIcons[category] || '📦'}</div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{category}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{itemsByCategory.get(category)?.length || 0}</p>
            </div>
          ))}
        </div>

        {/* Items Display */}
        {filteredItems.length > 0 ? (
          viewMode === "grid" ? (
            // Grid view grouped by category
            <div className="space-y-6">
              {selectedCategory === "all" ? (
                // Show items grouped by category
                Array.from(itemsByCategory.entries()).map(([category, categoryItems]) => (
                  <div key={category}>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[category] || '📦'}</span>
                      {category}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({categoryItems.length})</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {categoryItems.map(item => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Show all items in single grid
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {filteredItems.map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // List view
            <div className="space-y-2">
              {filteredItems.map(item => (
                <ItemListItem key={item.id} item={item} />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No items found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}