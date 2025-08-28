import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { loadPokemonData, loadMovesData, loadItemsData, loadTrainersData } from "~/lib/data-loader-v2";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pokédex Viewer - Browse Pokémon Data" },
    { name: "description", content: "Comprehensive web-based viewer for Pokémon game data files" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    
    // Load all data counts in parallel
    const [pokemonData, movesData, itemsData, trainerData] = await Promise.all([
      loadPokemonData(url.origin),
      loadMovesData(url.origin),
      loadItemsData(url.origin),
      loadTrainersData(url.origin)
    ]);
    
    return {
      pokemonCount: pokemonData?.list?.length || 0,
      movesCount: movesData?.list?.length || 0,
      itemsCount: itemsData?.list?.length || 0,
      trainersCount: trainerData?.list?.length || 0,
    };
  } catch (error) {
    console.error('Failed to load data counts:', error);
    return {
      pokemonCount: 0,
      movesCount: 0,
      itemsCount: 0,
      trainersCount: 0,
    };
  }
}

export default function Home() {
  const { pokemonCount, movesCount, itemsCount, trainersCount } = useLoaderData<typeof loader>();
  
  const mainSections = [
    { title: "Pokémon", href: "/pokemon", description: "Browse all Pokémon with stats and abilities", icon: "🎮", color: "from-red-400 to-red-600" },
    { title: "Trainers", href: "/trainers", description: "View trainer teams and battle configurations", icon: "👥", color: "from-blue-400 to-blue-600" },
    { title: "Moves", href: "/moves", description: "Explore moves with power and effects", icon: "⚔️", color: "from-yellow-400 to-yellow-600" },
    { title: "Items", href: "/items", description: "Discover items, prices, and effects", icon: "🎒", color: "from-green-400 to-green-600" },
    { title: "Encounters", href: "/encounters", description: "Find wild Pokémon by location", icon: "🗺️", color: "from-purple-400 to-purple-600" },
    { title: "Compare", href: "/compare", description: "Compare Pokémon stats side by side", icon: "⚖️", color: "from-cyan-400 to-cyan-600" },
  ];

  const quickStats = [
    { label: "Total Pokémon", value: pokemonCount.toString(), icon: "🎮" },
    { label: "Total Moves", value: movesCount.toString(), icon: "⚔️" },
    { label: "Total Items", value: itemsCount.toString(), icon: "🎒" },
    { label: "Trainers", value: trainersCount.toString(), icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pokédex Viewer
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-12">Explore comprehensive Pokémon game data</p>
          
          {/* Quick Stats */}
          <div className="inline-flex justify-center gap-12 px-12 py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl shadow-lg">
            {quickStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation Cards - Centered Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainSections.map((section) => (
              <Link
                key={section.href}
                to={section.href}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative p-8">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{section.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{section.description}</p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                      <span>Explore</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
