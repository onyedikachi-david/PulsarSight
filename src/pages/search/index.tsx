import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SearchService,
  SearchResult as SearchResultType,
  SearchFilters as SearchFiltersType,
  BaseAccount,
  TokenAccount,
  MintAccount,
  Transaction,
  isTransaction,
  isTokenAccount,
  isProgramAccount,
  isBaseAccount,
  ProgramAccount
} from '../../services/search'
import {
  Search,
  Hash,
  Wallet,
  Coins,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react'
import SearchResultDetail from '../../components/SearchResultDetail'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult extends SearchResultType {}
interface SearchFilters extends SearchFiltersType {}

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['all'],
    timeRange: '24h',
    status: 'all'
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTypes = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'transaction', label: 'Transactions', icon: Hash },
    { id: 'address', label: 'Addresses', icon: Wallet },
    { id: 'token', label: 'Tokens', icon: Coins },
    { id: 'program', label: 'Programs', icon: FileText }
  ]

  const timeRanges = [
    { id: '1h', label: 'Last hour' },
    { id: '24h', label: 'Last 24 hours' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: 'all', label: 'All time' }
  ]

  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    try {
      const formattedResults: SearchResult[] = []

      // Check if query looks like an address first
      const isAddressFormat = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(searchQuery)
      console.log('isAddressFormat: ', isAddressFormat)

      // Handle account-based searches first if it looks like an address
      if (
        isAddressFormat &&
        (filters.types.includes('all') ||
          filters.types.includes('address') ||
          filters.types.includes('token') ||
          filters.types.includes('program'))
      ) {
        const accountResults = await SearchService.searchAccounts(searchQuery)
        console.log('accountResults: ', accountResults)
        if (
          accountResults?.data?.account ||
          accountResults?.data?.programAccounts
        ) {
          const accounts = accountResults?.data?.account
            ? [accountResults.data.account]
            : [
                ...(accountResults?.data?.tokens || []),
                ...(accountResults?.data?.contracts || [])
              ]

          accounts.forEach(
            (
              account: BaseAccount | TokenAccount | MintAccount | ProgramAccount
            ) => {
              // Determine account type based on its properties
              if ('mint' in account && 'owner' in account) {
                if (
                  filters.types.includes('all') ||
                  filters.types.includes('token')
                ) {
                  formattedResults.push({
                    type: 'token',
                    data: account as TokenAccount
                  })
                }
              } else if (isProgramAccount(account)) {
                if (
                  filters.types.includes('all') ||
                  filters.types.includes('program')
                ) {
                  formattedResults.push({
                    type: 'program',
                    data: account as ProgramAccount
                  })
                }
              } else {
                if (
                  filters.types.includes('all') ||
                  filters.types.includes('address')
                ) {
                  formattedResults.push({
                    type: 'address',
                    data: account as BaseAccount
                  })
                }
              }
            }
          )
        }
      }

      // Only try transaction search if no account results found or specifically searching for transactions
      if (
        formattedResults.length === 0 &&
        (filters.types.includes('all') || filters.types.includes('transaction'))
      ) {
        const txResults = await SearchService.searchTransactions(
          searchQuery,
          filters
        )
        console.log('txResults: ', txResults)

        if (txResults.errors?.[0]?.extensions?.code === 'INVALID_SIGNATURE') {
          // Only show signature error if specifically searching for transactions
          if (
            filters.types.includes('transaction') &&
            !filters.types.includes('all')
          ) {
            setError(txResults.errors[0].message)
            setLoading(false)
            return
          }
        } else if (txResults?.data?.transaction) {
          formattedResults.push({
            type: 'transaction' as const,
            data: txResults.data.transaction as Transaction
          })
        }
      }

      // Only set error if no results were found across all searches
      if (formattedResults.length === 0) {
        setError('No results found for your search query')
      } else {
        setResults(formattedResults)
      }
    } catch (err) {
      setError('Failed to perform search. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search for transactions, addresses, tokens, and smart contracts
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by address, transaction hash, token, or contract..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <Search className="absolute right-3 top-2.5 size-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="size-5 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {searchTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      setFilters((f) => ({ ...f, types: [type.id] }))
                    }
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm
                      ${
                        filters.types.includes(type.id)
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <type.icon className="size-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, timeRange: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {timeRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (for transactions) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-200">
                <AlertCircle className="size-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <RefreshCw className="size-8 animate-spin text-blue-500" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index}>
                    {/* Preview Card */}
                    <motion.div
                      className={`
                        cursor-pointer rounded-lg border border-gray-200 bg-white
                        p-4 dark:border-gray-600 dark:bg-gray-700
                        ${
                          result.expanded
                            ? 'border-blue-200 shadow-md dark:border-blue-800'
                            : 'hover:border-blue-200 dark:hover:border-blue-800'
                        }
                      `}
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        const newResults = [...results]
                        newResults[index] = {
                          ...result,
                          expanded: !result.expanded
                        }
                        setResults(newResults)
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Keep the existing preview cards */}
                      {result.type === 'transaction' &&
                        isTransaction(result.data) && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Hash className="size-5 text-blue-500" />
                              <div>
                                <Link
                                  to={`/tx/${
                                    result.data.signatures?.[0] || ''
                                  }`}
                                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {result.data.signatures?.[0]
                                    ? `${result.data.signatures[0].slice(
                                        0,
                                        8
                                      )}...${result.data.signatures[0].slice(
                                        -8
                                      )}`
                                    : 'Unknown Transaction'}
                                </Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {result.data.blockTime
                                    ? new Date(
                                        Number(result.data.blockTime) * 1000
                                      ).toLocaleString()
                                    : 'Unknown Time'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!result.data.meta?.err ? (
                                <CheckCircle className="size-5 text-green-500" />
                              ) : (
                                <XCircle className="size-5 text-red-500" />
                              )}
                              <span className="text-sm text-gray-500">
                                {(Number(result.data.meta?.fee) || 0) / 1e9}{' '}
                                SOON
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: result.expanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="size-5 text-gray-400" />
                            </motion.div>
                          </div>
                        )}

                      {result.type === 'address' &&
                        isBaseAccount(result.data) && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Wallet className="size-5 text-purple-500" />
                              <div>
                                <Link
                                  to={`/address/${result.data.address}`}
                                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {result.data.address}
                                </Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Balance:{' '}
                                  {(
                                    (result.data.lamports || 0n) / BigInt(1e9)
                                  ).toString()}{' '}
                                  SOON
                                </p>
                              </div>
                            </div>
                            {isProgramAccount(result.data) && (
                              <div className="flex items-center gap-2">
                                <div className="rounded bg-purple-100 px-2 py-1 text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                  Program
                                </div>
                                {result.data.authority && (
                                  <div className="text-sm text-gray-500">
                                    Authority:{' '}
                                    {result.data.authority.address.slice(0, 4)}
                                    ...{result.data.authority.address.slice(-4)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      {result.type === 'token' &&
                        isTokenAccount(result.data) && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Coins className="size-5 text-yellow-500" />
                              <div>
                                <Link
                                  to={`/token/${result.data.mint.address}`}
                                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {result.data.mint.name ||
                                    result.data.mint.address}
                                  {result.data.mint.symbol &&
                                    `(${result.data.mint.symbol})`}
                                </Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Supply:{' '}
                                  {result.data.mint.supply?.toLocaleString()} •
                                  Holders:{' '}
                                  {result.data.mint.holders?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.data.mint.decimals} decimals
                            </div>
                          </div>
                        )}

                      {result.type === 'program' &&
                        isProgramAccount(result.data) && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="size-5 text-indigo-500" />
                              <div>
                                <Link
                                  to={`/program/${result.data.address}`}
                                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {result.data.address}
                                </Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {result.data.authority
                                    ? `Authority: ${result.data.authority.address.slice(
                                        0,
                                        4
                                      )}...${result.data.authority.address.slice(
                                        -4
                                      )}`
                                    : 'Native Program'}
                                </p>
                              </div>
                            </div>
                            <div className="rounded bg-purple-100 px-2 py-1 text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              Program
                            </div>
                          </div>
                        )}
                    </motion.div>

                    {/* Detailed View with Animation */}
                    <AnimatePresence>
                      {result.expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: 'easeInOut'
                          }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4">
                            <SearchResultDetail result={result} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'No results found'
                  : 'Enter a search query to begin'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
