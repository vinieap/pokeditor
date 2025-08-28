import { Link, NavLink } from "react-router";
import { useState, useRef, useEffect } from "react";
import { GlobalSearch } from "~/components/common/GlobalSearch";
import { DarkModeToggle } from "~/components/DarkModeToggle";

export function Navigation() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);
  
  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/pokemon", label: "Pokémon", icon: "🎮" },
    { href: "/trainers", label: "Trainers", icon: "👥" },
    { href: "/moves", label: "Moves", icon: "⚔️" },
    { href: "/items", label: "Items", icon: "🎒" },
    { href: "/encounters", label: "Encounters", icon: "🗺️" },
    { href: "/compare", label: "Compare", icon: "⚖️" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="text-2xl mr-2">📖</span>
              Pokédex Viewer
            </Link>
            
            <ul className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`
                    }
                    end={item.href === "/"}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div ref={searchRef} className={`relative ${searchOpen ? 'w-64' : 'w-10'} transition-all duration-300`}>
              {searchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search everything..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              
              {/* Search Results Dropdown */}
              <GlobalSearch 
                isOpen={searchOpen}
                onClose={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
            
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}