import React, { useEffect, useState } from 'react';
import { RPC_URL, rpcGraphQL } from '../../utils/rpc';
import { createSolanaRpc } from '@solana/rpc';
import { Link } from 'react-router-dom';
import { 
  Layers, ChevronRight, RefreshCw, Clock, 
  Database, FileText, Inbox, BarChart2, 
  Activity, Zap, ExternalLink, ArrowUpRight, Eye, Search, BoxSelect, Focus
} from 'lucide-react';

interface Block {
  blockhash: string;
  blockHeight: bigint;
  blockTime: bigint | null;
  parentSlot: bigint;
  previousBlockhash: string;
  slot: bigint;
  transactions: Array<{
    slot: bigint;
    meta: {
      fee: bigint;
      logMessages: string[];
    };
  }>;
}

const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Group blocks by time periods
const groupBlocksByTime = (blocks: Block[]) => {
  const now = Date.now() / 1000;
  return blocks.reduce((groups, block) => {
    if (!block.blockTime) return groups;
    const diff = now - Number(block.blockTime);
    
    if (diff < 300) { // 5 minutes
      groups.recent = [...(groups.recent || []), block];
    } else if (diff < 3600) { // 1 hour
      groups.hour = [...(groups.hour || []), block];
    } else {
      groups.older = [...(groups.older || []), block];
    }
    return groups;
  }, {} as Record<string, Block[]>);
};

// Calculate block statistics
const getBlockStats = (blocks: Block[]) => {
  const totalTransactions = blocks.reduce((sum, block) => sum + block.transactions.length, 0);
  const avgTransactionsPerBlock = blocks.length > 0 ? totalTransactions / blocks.length : 0;
  const totalFees = blocks.reduce((sum, block) => {
    const blockFees = block.transactions.reduce((blockSum, tx) => {
      return blockSum + (tx.meta?.fee || 0n);
    }, 0n);
    return sum + blockFees;
  }, 0n);
  
  return {
    totalTransactions,
    avgTransactionsPerBlock,
    totalFees
  };
};

// Add this function for copy feedback
const copyToClipboard = async (text: string, event: React.MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText(text);
    
    // Show success state
    button.classList.add('text-green-500', 'dark:text-green-400');
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `;

    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove('text-green-500', 'dark:text-green-400');
      button.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
          />
        </svg>
      `;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const BlocksPage: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlot, setCurrentSlot] = useState<bigint | null>(null);
  const [firstVisibleSlot, setFirstVisibleSlot] = useState<bigint | null>(null);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalBlocks, setTotalBlocks] = useState<bigint | null>(null);
  const [blocksPerPage, setBlocksPerPage] = useState(10);

  const fetchBlocks = async (startSlot?: bigint, direction: 'next' | 'previous' = 'next') => {
    try {
      setLoading(true);
      
      if (!startSlot) {
        const rpc = createSolanaRpc(RPC_URL);
        startSlot = await rpc.getSlot().send();
      }

      const blockSource = `
        query GetBlock($slot: Slot!) {
          block(slot: $slot) {
            blockhash
            blockHeight
            blockTime
            parentSlot
            previousBlockhash
            transactions {
              slot
              meta {
                fee
                logMessages
              }
            }
          }
        }
      `;

      const newBlocks: Block[] = [];
      let slot = startSlot;

      for (let i = 0; i < blocksPerPage && slot; i++) {
        const result = await rpcGraphQL.query(blockSource, {
          slot: slot as any
        });
        console.log("Block result", result);

        if (result?.data?.block) {
          if (direction === 'next') {
            newBlocks.push(result.data.block as Block);
            slot = result.data.block.parentSlot as bigint;
          } else {
            newBlocks.unshift(result.data.block as Block);
            slot = slot + 1n;
          }
        } else {
          break;
        }
      }

      setBlocks(newBlocks);
      setCurrentSlot(startSlot);
      setFirstVisibleSlot(newBlocks[0]?.slot || null);
      setHasNext(newBlocks.length === blocksPerPage);
      setHasPrevious(!!startSlot && startSlot > 0n);
      setLoading(false);

    } catch (err) {
      console.error('Error fetching blocks:', err);
      setError('Failed to fetch block details');
      setLoading(false);
    }
  };

  const fetchTotalBlocks = async () => {
    try {
      const rpc = createSolanaRpc(RPC_URL);
      const slot = await rpc.getSlot().send();
      setTotalBlocks(slot);
    } catch (err) {
      console.error('Error fetching total blocks:', err);
    }
  };

  useEffect(() => {
    fetchBlocks();
    fetchTotalBlocks();
  }, []);

  const handleNext = () => {
    if (blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1];
      fetchBlocks(lastBlock.parentSlot, 'next');
    }
  };

  const handlePrevious = () => {
    if (firstVisibleSlot) {
      fetchBlocks(firstVisibleSlot + BigInt(blocksPerPage), 'previous');
    }
  };

  const handleRowsPerPageChange = (newValue: number) => {
    setBlocksPerPage(newValue);
    fetchBlocks(currentSlot || undefined);
  };

  // Calculate stats for display
  const stats = getBlockStats(blocks);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Blocks</h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Latest blocks on the network
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fetchBlocks()}
                  className="inline-flex items-center px-4 py-2 rounded-lg
                    text-white bg-gradient-to-r from-purple-500 to-blue-500
                    hover:from-purple-600 hover:to-blue-600 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Block Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
            {/* Total Transactions Card */}
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Total Transactions
                  </p>
                  <p className="mt-1 text-xl font-semibold text-purple-700 dark:text-purple-300">
                    {stats.totalTransactions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Average Transactions Card */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                  <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Avg. Tx/Block
                  </p>
                  <p className="mt-1 text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {stats.avgTransactionsPerBlock.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Fees Card */}
            <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2.5 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                  <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Total Fees
                  </p>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                      {stats.totalFees.toString()}
                    </p>
                    <p className="ml-1 text-sm text-green-600 dark:text-green-400">
                      lamports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Blocks List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-6 gap-4 px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
            <div>Height</div>
            <div>Hash</div>
            <div>Time</div>
            <div>Txn Count</div>
            <div>Total Fees</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(blocksPerPage)].map((_, i) => (
                <div key={i} className="animate-pulse px-6 py-4">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 justify-self-end"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blocks List */}
          {!loading && blocks.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {blocks.map((block) => {
                const totalFees = block.transactions.reduce((sum, tx) => 
                  sum + (tx.meta?.fee || 0n), 0n
                );

                return (
                  <div 
                    key={block.blockhash}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="grid grid-cols-6 gap-4 px-6 py-4">
                      {/* Block Height */}
                      <div className="flex items-center">
                        <Link 
                          to={`/block/${block.blockHeight.toString()}`}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                        >
                          #{block.blockHeight.toString()}
                        </Link>
                      </div>

                      {/* Block Hash */}
                      <div className="flex items-center group">
                        <Link 
                          to={`/tx/${block.blockhash}`}
                          className="flex items-center space-x-2 group"
                        >
                          <div className="font-mono text-sm text-purple-600 dark:text-purple-400 
                            group-hover:text-purple-700 dark:group-hover:text-purple-300">
                            {`${block.blockhash.slice(0, 6)}...${block.blockhash.slice(-6)}`}
                          </div>
                          <div className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 
                            bg-purple-100 dark:bg-purple-900/20 transition-all duration-200">
                            <ExternalLink className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          </div>
                        </Link>
                        <button 
                          onClick={(e) => copyToClipboard(block.blockhash, e)}
                          className="ml-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 
                            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                            hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
                          title="Copy full hash"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Block Time */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        {block.blockTime 
                          ? getTimeAgo(Number(block.blockTime))
                          : 'N/A'
                        }
                      </div>

                      {/* Transaction Count */}
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                        >
                          {block.transactions.length}
                        </span>
                      </div>

                      {/* Total Fees */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        {totalFees.toString()} lamports
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end">
                        <Link
                          to={`/block/${block.blockHeight.toString()}`}
                          className="group p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                        >
                          <div className="p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors">
                            <ExternalLink className="w-5 h-5 transition-transform group-hover:scale-110" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && blocks.length === 0 && (
            <div className="px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Database className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No blocks found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
            <select 
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm px-3 py-1.5"
              value={blocksPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            >
              <option value="5">5 blocks</option>
              <option value="10">10 blocks</option>
              <option value="20">20 blocks</option>
              <option value="50">50 blocks</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious || loading}
              className={`px-3 py-2 rounded-lg ${
                hasPrevious && !loading
                  ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext || loading}
              className={`px-3 py-2 rounded-lg ${
                hasNext && !loading
                  ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocksPage;
