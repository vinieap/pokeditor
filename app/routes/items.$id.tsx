import { Link, useParams, useLoaderData } from "react-router";
import type { Route } from "./+types/items.$id";
import { loadItemsData } from "~/lib/data-loader-v2";
import type { ItemData } from "~/lib/types-v2";
import { ItemSprite } from "~/components/SpriteImage";

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


export function meta({ params, data }: Route.MetaArgs) {
  const item = data?.item;
  return [
    { title: item ? `${item.displayName || item.internalName} - Item Details` : `Item #${params.id} - Pokeditor` },
    { name: "description", content: item ? `View detailed information for ${item.displayName || item.internalName}` : `View detailed information for item #${params.id}` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    
    // Load items data with optimized JSON
    const data = await loadItemsData(url.origin);
    
    // Use indexed lookup for O(1) performance
    const item = data?.byId[parseInt(params.id || "0")];
    if (!item) {
      throw new Response("Item not found", { status: 404 });
    }
    
    return { item };
  } catch (error) {
    console.error('Failed to load item data:', error);
    throw error;
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
  'Items': 'bg-gray-50 dark:bg-gray-9000',
  'Medicine': 'bg-green-500',
  'Poké Balls': 'bg-red-500',
  'TMs & HMs': 'bg-purple-500',
  'Berries': 'bg-blue-500',
  'Mail': 'bg-yellow-500',
  'Battle Items': 'bg-orange-500',
  'Key Items': 'bg-indigo-500',
  'Other': 'bg-gray-400',
};

// Parse field use types
function getFieldUseDescription(fieldUse: number): string {
  const fieldUseMap: Record<number, string> = {
    0: 'Cannot be used outside of battle',
    1: 'Can be used on a Pokémon',
    2: 'Can be used directly',
    3: 'TM/HM',
    4: 'Evolution stone',
    5: 'Can be used on a Pokémon (reusable)',
  };
  
  return fieldUseMap[fieldUse] || 'Unknown use';
}

// Parse battle use types
function getBattleUseDescription(battleUse: number): string {
  const battleUseMap: Record<number, string> = {
    0: 'Cannot be used in battle',
    1: 'Can be used on a Pokémon',
    2: 'Can be used directly',
    3: 'Poké Ball',
    4: 'Battle item',
    5: 'Can be used on a Pokémon (from bag)',
  };
  
  return battleUseMap[battleUse] || 'Unknown use';
}

// Parse item type/flags
function getItemTypeDescription(type: number): string[] {
  const types: string[] = [];
  
  // These are bit flags, check each bit
  if (type & 1) types.push('Mail');
  if (type & 2) types.push('Mail (can hold)');
  if (type & 4) types.push('Poké Ball');
  if (type & 8) types.push('Berry');
  if (type & 16) types.push('Key Item');
  if (type & 32) types.push('Evolution Item');
  if (type & 64) types.push('Fossil');
  if (type & 128) types.push('Apricorn');
  if (type & 256) types.push('Elemental Gem');
  if (type & 512) types.push('Mega Stone');
  
  return types.length > 0 ? types : ['Standard Item'];
}

export default function ItemDetail() {
  const { id } = useParams();
  const { item } = useLoaderData<typeof loader>();

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Item Not Found</h1>
          <p className="text-gray-600 mb-4">Item #{id} could not be found</p>
          <Link to="/items" className="text-blue-500 hover:text-blue-700">
            Back to Items List
          </Link>
        </div>
      </div>
    );
  }

  const category = getItemCategory(item.pocket);
  const fieldUseDesc = getFieldUseDescription(item.fieldUse);
  const battleUseDesc = getBattleUseDescription(item.battleUse);
  const itemTypes = getItemTypeDescription(item.type || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/items" 
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            ← Back to Items List
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="h-12 w-12">
                      <ItemSprite
                        internalName={item.internalName}
                        name={item.displayName || item.internalName}
                        className="w-full h-full object-contain pixelated"
                      />
                    </div>
                    {item.displayName || item.internalName}
                  </h1>
                  <p className="text-gray-500">Item #{String(item.id).padStart(3, '0')}</p>
                  {item.localName && (
                    <p className="text-sm text-gray-500 mt-1">Local: {item.localName}</p>
                  )}
                  {item.namePlural && (
                    <p className="text-sm text-gray-500">Plural: {item.namePlural}</p>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-full text-white font-medium ${categoryColors[category]}`}>
                  {category}
                </div>
              </div>
              
              <p className="text-gray-700 text-lg mb-6">{item.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <span className="text-gray-500 text-sm">Buy Price</span>
                  <p className="font-bold text-xl text-gray-900">
                    {item.price > 0 ? `₽${item.price.toLocaleString()}` : 'Not for sale'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <span className="text-gray-500 text-sm">Sell Price</span>
                  <p className="font-bold text-xl text-gray-900">
                    {item.price > 0 ? `₽${Math.floor(item.price / 2).toLocaleString()}` : 'Cannot sell'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <span className="text-gray-500 text-sm">Bag Pocket</span>
                  <p className="font-semibold text-gray-900">{category}</p>
                </div>
              </div>
            </div>

            {/* Usage Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Usage Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Field Use</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      item.fieldUse > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <p className="text-gray-600">{fieldUseDesc}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Battle Use</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      item.battleUse > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <p className="text-gray-600">{battleUseDesc}</p>
                  </div>
                </div>

                {item.machine && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Teaches Move</h3>
                    <p className="text-gray-900 font-semibold bg-purple-50 inline-block px-3 py-1 rounded">
                      {item.machine}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Item Properties */}
            {itemTypes.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Item Properties</h2>
                <div className="flex flex-wrap gap-2">
                  {itemTypes.map(type => (
                    <span 
                      key={type}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            {/* Item Sprite Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Item Sprite</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center p-8">
                <ItemSprite
                  internalName={item.internalName}
                  name={item.name}
                  className="w-full h-full object-contain pixelated max-w-[128px]"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Internal: {item.internalName}</p>
            </div>
            
            {/* Price Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Buy Price</span>
                    <span className="text-sm font-semibold">
                      {item.price > 0 ? `₽${item.price.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  {item.price > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${Math.min((item.price / 10000) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Sell Price</span>
                    <span className="text-sm font-semibold">
                      {item.price > 0 ? `₽${Math.floor(item.price / 2).toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  {item.price > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${Math.min((item.price / 20000) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                
                {item.price > 0 && (
                  <div className="pt-2 mt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Sell/Buy Ratio: {((0.5) * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
              <div className="text-center">
                <div className="text-5xl mb-3">{categoryIcons[category]}</div>
                <div className={`inline-block px-4 py-2 rounded-full text-white font-medium ${categoryColors[category]}`}>
                  {category}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Pocket #{item.pocket}
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Usable in Field</span>
                  <span className={`font-medium ${item.fieldUse > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.fieldUse > 0 ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usable in Battle</span>
                  <span className={`font-medium ${item.battleUse > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.battleUse > 0 ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Can be Held</span>
                  <span className={`font-medium ${
                    item.pocket !== 8 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.pocket !== 8 ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Internal Data</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Internal Name</span>
                  <code className="font-mono">{item.internalName}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID</span>
                  <span className="font-medium text-gray-900">{item.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type Flags</span>
                  <code className="font-mono">{item.type}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Field Use</span>
                  <code className="font-mono">{item.fieldUse}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Battle Use</span>
                  <code className="font-mono">{item.battleUse}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}