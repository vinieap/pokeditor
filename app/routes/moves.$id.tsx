import { Link, useParams, useLoaderData } from "react-router";
import type { Route } from "./+types/moves.$id";
import { loadMovesData } from "~/lib/data-loader-v2";
import type { Move } from "~/lib/types-v2";
import { getTypeColorClass } from "~/lib/utils/typeColors";


export function meta({ params, data }: Route.MetaArgs) {
  const move = data?.move;
  return [
    { title: move ? `${move.displayName || move.internalName} - Move Details` : `Move #${params.id} - Pokeditor` },
    { name: "description", content: move ? `View detailed information for ${move.displayName || move.internalName}` : `View detailed information for move #${params.id}` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    
    // Load moves data with optimized JSON
    const data = await loadMovesData(url.origin);
    
    // Use indexed lookup for O(1) performance
    const move = data?.byId[parseInt(params.id || "0")];
    if (!move) {
      throw new Response("Move not found", { status: 404 });
    }
    
    return { move: move! };
  } catch (error) {
    console.error('Failed to load move data:', error);
    throw error;
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

// Parse flags from the encoded string
function parseFlags(flagString: string): string[] {
  const flagMap: Record<string, string> = {
    'a': 'Contact',
    'b': 'Can Protect',
    'c': 'Can Mirror Move',
    'd': 'Snatchable',
    'e': 'Can Magic Coat',
    'f': 'Thaws User',
    'g': 'High Critical Ratio',
    'h': 'Biting',
    'i': 'Punching',
    'j': 'Sound',
    'k': 'Powder',
    'l': 'Pulse',
    'm': 'Bomb',
    'n': 'Dance',
  };
  
  return flagString.split('').map(flag => flagMap[flag]).filter(Boolean);
}

// Parse target from code
function getTargetDescription(targetCode: string): string {
  const targetMap: Record<string, string> = {
    '00': 'Single target',
    '01': 'No target',
    '02': 'Single opponent',
    '04': 'All opponents',
    '08': 'All other Pokémon',
    '10': 'User',
    '20': 'Both sides',
    '40': 'User side',
    '80': 'Opponent side',
    '100': 'Partner',
    '200': 'User or partner',
    '400': 'Single opponent (opposite)',
    '800': 'Random opponent',
  };
  
  return targetMap[targetCode] || 'Unknown target';
}

export default function MoveDetail() {
  const { id } = useParams();
  const { move } = useLoaderData<typeof loader>();

  if (!move) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Move Not Found</h1>
          <p className="text-gray-600 mb-4">Move #{id} could not be found</p>
          <Link to="/moves" className="text-blue-500 hover:text-blue-700">
            Back to Moves List
          </Link>
        </div>
      </div>
    );
  }

  const flags = parseFlags(move.flags);
  const targetDesc = getTargetDescription(move.target);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/moves" 
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            ← Back to Moves List
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
                    <span className="text-4xl">{categoryIcons[move.category]}</span>
                    {move.displayName || move.internalName}
                  </h1>
                  <p className="text-gray-500">Move #{String(move.id).padStart(3, '0')}</p>
                  {move.localName && (
                    <p className="text-sm text-gray-500 mt-1">Local: {move.localName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full font-medium ${getTypeColorClass(move.type)}`}>
                    {move.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-white ${categoryColors[move.category]}`}>
                    {move.category}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{move.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Power</span>
                  <p className="font-semibold text-xl">
                    {move.power > 0 ? move.power : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Accuracy</span>
                  <p className="font-semibold text-xl">
                    {move.accuracy > 0 ? `${move.accuracy}%` : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">PP</span>
                  <p className="font-semibold text-xl">{move.pp}</p>
                </div>
                <div>
                  <span className="text-gray-500">Priority</span>
                  <p className="font-semibold text-xl">
                    {move.priority > 0 ? `+${move.priority}` : move.priority}
                  </p>
                </div>
              </div>
            </div>

            {/* Battle Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Battle Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Target</h3>
                  <p className="text-gray-600">{targetDesc}</p>
                </div>
                
                {move.effectChance > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Effect Chance</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="h-4 bg-green-500 rounded-full"
                          style={{ width: `${move.effectChance}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900">{move.effectChance}%</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Function Code</h3>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{move.functionCode}</code>
                </div>
              </div>
            </div>

            {/* Flags */}
            {flags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Properties</h2>
                <div className="flex flex-wrap gap-2">
                  {flags.map(flag => (
                    <span 
                      key={flag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {move.power > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Power</span>
                      <span className="text-sm font-semibold text-gray-900">{move.power}/200</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-red-500 rounded-full"
                        style={{ width: `${Math.min((move.power / 200) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {move.accuracy > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Accuracy</span>
                      <span className="text-sm font-semibold text-gray-900">{move.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${move.accuracy}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">PP</span>
                    <span className="text-sm font-semibold">{move.pp}/40</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${Math.min((move.pp / 40) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Category Info</h3>
              <div className="text-center">
                <div className="text-5xl mb-3">{categoryIcons[move.category]}</div>
                <div className={`inline-block px-4 py-2 rounded-full text-white font-medium ${categoryColors[move.category]}`}>
                  {move.category}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {move.category === 'Physical' && 'Uses Attack stat'}
                  {move.category === 'Special' && 'Uses Special Attack stat'}
                  {move.category === 'Status' && 'Non-damaging move'}
                </p>
              </div>
            </div>

            {/* Type Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Type</h3>
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-full text-lg font-medium ${getTypeColorClass(move.type)}`}>
                  {move.type}
                </div>
              </div>
            </div>

            {/* Internal Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Internal Data</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Internal Name</span>
                  <code className="font-mono">{move.internalName}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID</span>
                  <span className="font-medium text-gray-900">{move.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flags</span>
                  <code className="font-mono">{move.flags || 'none'}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}