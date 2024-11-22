import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rpcGraphQL } from '../../utils/rpc';
import { SearchService, SearchResult as SearchResultType, SearchFilters as SearchFiltersType, BaseAccount, TokenAccount, MintAccount, VoteAccount, Transaction, SearchResultData, isTransaction, isTokenAccount, isProgramAccount, isBaseAccount, ProgramAccount } from '../../services/search';
import {
  Search, Filter, Clock, Hash, Wallet, Coins, FileText,
  ChevronRight, RefreshCw, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import SearchResultDetail from '../../components/SearchResultDetail';

interface SearchResult extends SearchResultType {}
interface SearchFilters extends SearchFiltersType {}

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['all'],
    timeRange: '24h',
    status: 'all'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTypes = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'transaction', label: 'Transactions', icon: Hash },
    { id: 'address', label: 'Addresses', icon: Wallet },
    { id: 'token', label: 'Tokens', icon: Coins },
    { id: 'program', label: 'Programs', icon: FileText }
  ];

  const timeRanges = [
    { id: '1h', label: 'Last hour' },
    { id: '24h', label: 'Last 24 hours' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: 'all', label: 'All time' }
  ];

  const validateAddress = (address: string): boolean => {
    // Add SOON network address validation logic
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedResults: SearchResult[] = [];

      // Check if query looks like an address first
      const isAddressFormat = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(searchQuery);
      console.log("isAddressFormat: ", isAddressFormat);

      // Handle account-based searches first if it looks like an address
      if (isAddressFormat && (
        filters.types.includes('all') || 
        filters.types.includes('address') || 
        filters.types.includes('token') || 
        filters.types.includes('program')
      )) {
        const accountResults = await SearchService.searchAccounts(searchQuery);
        console.log("accountResults: ", accountResults);
        if (accountResults?.data?.account || accountResults?.data?.programAccounts) {
          const accounts = accountResults?.data?.account ? 
            [accountResults.data.account] : 
            [...(accountResults?.data?.tokens || []), ...(accountResults?.data?.contracts || [])];

          accounts.forEach((account: BaseAccount | TokenAccount | MintAccount | ProgramAccount) => {
            // Determine account type based on its properties
            if ('mint' in account && 'owner' in account) {
              if (filters.types.includes('all') || filters.types.includes('token')) {
                formattedResults.push({
                  type: 'token',
                  data: account as TokenAccount
                });
              }
            } else if (isProgramAccount(account)) {
              if (filters.types.includes('all') || filters.types.includes('program')) {
                formattedResults.push({
                  type: 'program',
                  data: account as ProgramAccount
                });
              }
            } else {
              if (filters.types.includes('all') || filters.types.includes('address')) {
                formattedResults.push({
                  type: 'address',
                  data: account as BaseAccount
                });
              }
            }
          });
        }
      }

      // Only try transaction search if no account results found or specifically searching for transactions
      if (formattedResults.length === 0 && 
          (filters.types.includes('all') || filters.types.includes('transaction'))) {
        const txResults = await SearchService.searchTransactions(searchQuery, filters);
        console.log("txResults: ", txResults);
        
        if (txResults.errors?.[0]?.extensions?.code === 'INVALID_SIGNATURE') {
          // Only show signature error if specifically searching for transactions
          if (filters.types.includes('transaction') && !filters.types.includes('all')) {
            setError(txResults.errors[0].message);
            setLoading(false);
            return;
          }
        } else if (txResults?.data?.transaction) {
          formattedResults.push({
            type: 'transaction' as const,
            data: txResults.data.transaction as Transaction
          });
        }
      }

      // Only set error if no results were found across all searches
      if (formattedResults.length === 0) {
        setError('No results found for your search query');
      } else {
        setResults(formattedResults);
      }
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Advanced Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search for transactions, addresses, tokens, and smart contracts
            </p>
          </div>

          {/* Search Input */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by address, transaction hash, token, or contract..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Search'}
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {searchTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFilters(f => ({ ...f, types: [type.id] }))}
                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5
                      ${filters.types.includes(type.id)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(f => ({ ...f, timeRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
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
              <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index}>
                    {/* Preview Card */}
                    <div 
                      className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        // Add state to track which result is expanded
                        const newResults = [...results];
                        newResults[index] = { 
                          ...result, 
                          expanded: !result.expanded 
                        };
                        setResults(newResults);
                      }}
                    >
                      {/* Keep the existing preview cards */}
                      {result.type === 'transaction' && isTransaction(result.data) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Hash className="h-5 w-5 text-blue-500" />
                            <div>
                              <Link
                                to={`/tx/${result.data.signatures?.[0] || ''}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                {result.data.signatures?.[0] 
                                  ? `${result.data.signatures[0].slice(0, 8)}...${result.data.signatures[0].slice(-8)}`
                                  : 'Unknown Transaction'}
                              </Link>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {result.data.blockTime 
                                  ? new Date(Number(result.data.blockTime) * 1000).toLocaleString()
                                  : 'Unknown Time'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!result.data.meta?.err ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-500">
                              {(Number(result.data.meta?.fee) || 0) / 1e9} SOON
                            </span>
                          </div>
                        </div>
                      )}

                      {result.type === 'address' && isBaseAccount(result.data) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-purple-500" />
                            <div>
                              <Link
                                to={`/address/${result.data.address}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                {result.data.address}
                              </Link>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Balance: {((result.data.lamports || 0n) / BigInt(1e9)).toString()} SOON
                              </p>
                            </div>
                          </div>
                          {isProgramAccount(result.data) && (
                            <div className="flex items-center gap-2">
                              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-sm">
                                Program
                              </div>
                              {result.data.authority && (
                                <div className="text-sm text-gray-500">
                                  Authority: {result.data.authority.address.slice(0, 4)}...{result.data.authority.address.slice(-4)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {result.type === 'token' && isTokenAccount(result.data) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Coins className="h-5 w-5 text-yellow-500" />
                            <div>
                              <Link
                                to={`/token/${result.data.mint.address}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                {result.data.mint.name || result.data.mint.address} 
                                {result.data.mint.symbol && `(${result.data.mint.symbol})`}
                              </Link>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Supply: {result.data.mint.supply?.toLocaleString()} • 
                                Holders: {result.data.mint.holders?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.data.mint.decimals} decimals
                          </div>
                        </div>
                      )}

                      {result.type === 'program' && isProgramAccount(result.data) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            <div>
                              <Link
                                to={`/program/${result.data.address}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                {result.data.address}
                              </Link>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {result.data.authority ? 
                                  `Authority: ${result.data.authority.address.slice(0, 4)}...${result.data.authority.address.slice(-4)}` :
                                  'Native Program'}
                              </p>
                            </div>
                          </div>
                          <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-sm">
                            Program
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detailed View */}
                    {result.expanded && (
                      <div className="mt-4">
                        <SearchResultDetail result={result} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No results found' : 'Enter a search query to begin'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
