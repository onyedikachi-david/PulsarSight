import React, { useEffect, useState } from 'react';
import { RPC_URL, rpcGraphQL } from '../../utils/rpc';
import { createSolanaRpc } from '@solana/rpc';
import { Link } from 'react-router-dom';
import { Blocks, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, Database, XCircle, ArrowRight, RefreshCw, Layers } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);

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
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Blocks</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Explore the latest blocks on the network
                </p>
              </div>
            </div>
            <button
              onClick={fetchBlocks}
              className="p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400
                rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
              title="Refresh blocks"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blocks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-900/20">
          {loading ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="animate-pulse flex items-center justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-5 flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error Loading Blocks</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <button
                  onClick={fetchBlocks}
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                    text-white bg-gradient-to-r from-purple-500 to-blue-500
                    hover:from-purple-600 hover:to-blue-600
                    focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Slot
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Block Hash
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Previous Block
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {blocks.map((block, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {block.slot?.toString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {block.blockhash.substring(0, 8)}...{block.blockhash.substring(block.blockhash.length - 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {block.previousBlockhash.substring(0, 8)}...{block.previousBlockhash.substring(block.previousBlockhash.length - 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {block.blockTime ? new Date(Number(block.blockTime) * 1000).toLocaleString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {block.transactions.length}
                            </div>
                            {block.transactions.length > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/block/${block.blockHeight.toString()}`}
                            className="group p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                          >
                            <div className="p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg
                        text-gray-700 dark:text-gray-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:bg-purple-100 dark:hover:bg-purple-900/20
                        focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg
                        text-gray-700 dark:text-gray-200
                        hover:bg-purple-100 dark:hover:bg-purple-900/20
                        focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    >
                      Next
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlocksPage;
