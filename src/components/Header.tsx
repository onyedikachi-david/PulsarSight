import React from 'react';
import { Search, Moon, Sun, Signal } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Signal className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">TrustedPoint</span>
          </div>
          
          <div className="hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by block, tx, address..."
                className="w-96 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
            <option>ZETACHAIN</option>
            <option>TESTNET</option>
          </select>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          <div className="flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
}