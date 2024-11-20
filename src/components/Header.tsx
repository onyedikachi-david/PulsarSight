import React, { useState } from 'react';
import { Search, Menu, X, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Tooltip } from './ui/Tooltip';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="ml-4 flex items-center space-x-4">
              <img
                src="/logo.svg"
                alt="PulsarSight"
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                PulsarSight
              </span>
            </div>
          </div>

          {/* Center section - Search */}
          <div className={`
            hidden md:block flex-1 max-w-2xl mx-8
            ${isSearchOpen ? 'md:block' : ''}
          `}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by block, transaction, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2
                  bg-gray-100 dark:bg-gray-800
                  border border-transparent
                  focus:border-primary-500 dark:focus:border-primary-400
                  rounded-lg
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                  transition-all duration-200
                "
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Mobile search button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <Tooltip content="Notifications">
              <button className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              </button>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip content={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Mobile search field */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <input
              type="text"
              placeholder="Search by block, transaction, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                bg-gray-100 dark:bg-gray-800
                border border-transparent
                focus:border-primary-500 dark:focus:border-primary-400
                rounded-lg
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
                transition-all duration-200
              "
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-7 top-[4.5rem] -translate-y-1/2" />
          </div>
        )}
      </div>
    </header>
  );
}