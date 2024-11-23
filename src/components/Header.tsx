import React, { useState } from 'react'
import {
  Search,
  Sun,
  Moon,
  Bell,
  Home,
  Blocks,
  FileText,
  Activity,
  Users,
  Database
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from './ThemeProvider'
import { Tooltip } from './ui/Tooltip'

export default function Header() {
  const { isDark, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  const navItems = [
    { to: '/', icon: Home, text: 'Dashboard' },
    { to: '/blocks', icon: Blocks, text: 'Blocks' },
    { to: '/transactions', icon: Activity, text: 'Transactions' },
    { to: '/search', icon: Search, text: 'Search' },
    { to: '/validators', icon: Users, text: 'Validators' },
    { to: '/tokens', icon: Database, text: 'Tokens' },
    { to: '/contracts', icon: FileText, text: 'Contracts' }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo section */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.svg" alt="PulsarSight" className="size-8" />
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-lg font-semibold text-transparent">
                PulsarSight
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden space-x-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center space-x-2 rounded-lg px-3
                    py-2 text-sm font-medium
                    transition-all duration-200 ease-in-out
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }
                  `}
                >
                  <Icon className="size-4" />
                  <span>{item.text}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-48 rounded-lg border border-gray-200
                  bg-gray-50 py-2
                  pl-9 pr-4 text-gray-900
                  transition-all duration-200
                  placeholder:text-gray-500
                  focus:border-primary-500 focus:outline-none
                  focus:ring-2 focus:ring-primary-500/20
                  dark:border-gray-700 dark:bg-gray-800/50 dark:text-white
                  dark:placeholder:text-gray-400 dark:focus:border-primary-400
                "
              />
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Notifications */}
            <Tooltip content="Notifications">
              <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary-500" />
              </button>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip content={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {isDark ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="space-y-1 px-4 pb-3 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="size-5" />
                <span>{item.text}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
