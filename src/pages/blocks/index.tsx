import React, { useEffect, useState } from 'react';
import { RPC_URL, rpcGraphQL } from '../../utils/rpc';
import { createSolanaRpc } from '@solana/rpc';
import { Link } from 'react-router-dom';

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

// Add this helper function for time formatting
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Header with Navigation and Block Count */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Blocks</h3>
              {totalBlocks && blocks.length > 0 && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                  {`${blocks[0].blockHeight?.toString() || '1'} of ${totalBlocks.toString()}`}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-6">
              {/* Rows per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                <select 
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  value={blocksPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                >
                  <option value="5">5 rows</option>
                  <option value="10">10 rows</option>
                  <option value="20">20 rows</option>
                  <option value="50">50 rows</option>
                </select>
              </div>
              {/* Navigation buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={!hasPrevious || loading}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    hasPrevious && !loading
                      ? 'text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/20'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasNext || loading}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    hasNext && !loading
                      ? 'text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/20'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-5 gap-4 px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center space-x-1">
              <span>#</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div>Block Hash</div>
            <div>Age</div>
            <div>Txn Count</div>
            <div>Block Height</div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(blocksPerPage)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="sm:grid sm:grid-cols-5 gap-4 px-6 py-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blocks List */}
          {!loading && blocks.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {blocks.map((block) => (
                <div 
                  key={block.blockhash}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="sm:grid sm:grid-cols-5 gap-4 px-6 py-4 text-sm">
                    <div className="flex items-center">
                      <Link 
                        to={`/block/${block.blockHeight?.toString()}`} 
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium hover:underline"
                      >
                        {block.blockHeight?.toString() || 'N/A'}
                      </Link>
                    </div>
                    <div className="mt-1 sm:mt-0 font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="truncate text-gray-600 dark:text-gray-300">{block.blockhash || 'N/A'}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(block.blockhash)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 sm:mt-0 text-gray-600 dark:text-gray-300">
                      {block.blockTime 
                        ? getTimeAgo(Number(block.blockTime))
                        : 'N/A'
                      }
                    </div>
                    <div className="mt-1 sm:mt-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                        {block.transactions?.length?.toString() || '0'} txns
                      </span>
                    </div>
                    <div className="mt-1 sm:mt-0 text-gray-600 dark:text-gray-300 font-medium">
                      {block.blockHeight?.toString() || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results State */}
          {!loading && blocks.length === 0 && (
            <div className="px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No blocks found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlocksPage;
